import React, { createContext, useEffect, useState } from 'react';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { User } from '@/types/global';
import { secureStorage, SECURE_STORAGE_KEYS } from '@/lib/secure-storage';
import * as LocalAuthentication from 'expo-local-authentication';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isOnboardingComplete: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: any; needsVerification?: boolean }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  updatePassword: (newPassword: string) => Promise<{ error: any }>;
  verifyOTP: (email: string, token: string, type: 'signup' | 'recovery') => Promise<{ error: any }>;
  resendOTP: (email: string, type: 'signup' | 'recovery') => Promise<{ error: any }>;
  completeOnboarding: () => Promise<void>;
  toggleBiometrics: {
    setEnabled: (enabled: boolean) => Promise<void>;
    getEnabled: () => Promise<boolean>;
    authenticate: () => Promise<boolean>;
  };
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);

  useEffect(() => {
    // Get initial session and check onboarding status
    const initializeAuth = async () => {
      try {
        // Check onboarding status first
        const onboardingComplete = await secureStorage.getItem('onboarding_complete');
        setIsOnboardingComplete(onboardingComplete === 'true');

        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session error:', error);
          setLoading(false);
          return;
        }

        if (session?.user) {
          setSession(session);
          await loadUserProfile(session.user);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);
        
        if (event === 'SIGNED_OUT') {
          setUser(null);
          setSession(null);
          await secureStorage.removeItem(SECURE_STORAGE_KEYS.SESSION);
        } else if (session?.user) {
          setSession(session);
          await secureStorage.setItem(SECURE_STORAGE_KEYS.SESSION, JSON.stringify(session));
          await loadUserProfile(session.user);
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (supabaseUser: SupabaseUser) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      if (error && error.code === 'PGRST116') {
        // Profile doesn't exist, create one
        const newProfile = {
          id: supabaseUser.id,
          email: supabaseUser.email!,
          full_name: supabaseUser.user_metadata?.full_name || '',
          avatar_url: supabaseUser.user_metadata?.avatar_url || null,
          theme_preference: 'calm-blue',
          onboarding_completed: false,
          premium_status: false,
        };

        const { data: createdProfile, error: createError } = await supabase
          .from('profiles')
          .insert(newProfile)
          .select()
          .single();

        if (createError) {
          console.error('Error creating profile:', createError);
          setUser(null);
        } else {
          setUser(createdProfile as User);
        }
      } else if (!error && profile) {
        setUser(profile as User);
        // Update onboarding status from profile
        if (profile.onboarding_completed) {
          setIsOnboardingComplete(true);
          await secureStorage.setItem('onboarding_complete', 'true');
        }
      } else {
        console.error('Error loading profile:', error);
        setUser(null);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      setUser(null);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error };
      }

      if (data.session) {
        await secureStorage.setItem(SECURE_STORAGE_KEYS.SESSION, JSON.stringify(data.session));
        setSession(data.session);
        
        if (data.user) {
          await loadUserProfile(data.user);
        }
      }

      return { error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      return { error: new Error('An unexpected error occurred during sign in') };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName || '',
          },
        },
      });
      
      if (error) {
        return { error };
      }

      // Check if email confirmation is required
      if (data.user && !data.session) {
        return { error: null, needsVerification: true };
      }

      return { error: null, needsVerification: false };
    } catch (error) {
      console.error('Sign up error:', error);
      return { error: new Error('An unexpected error occurred during sign up') };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    await secureStorage.removeItem(SECURE_STORAGE_KEYS.SESSION);
    await secureStorage.removeItem('onboarding_complete');
    setIsOnboardingComplete(false);
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    return { error };
  };

  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    return { error };
  };

  const verifyOTP = async (email: string, token: string, type: 'signup' | 'recovery') => {
    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type,
    });
    return { error };
  };

  const resendOTP = async (email: string, type: 'signup' | 'recovery') => {
    if (type === 'signup') {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });
      return { error };
    } else {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      return { error };
    }
  };

  const completeOnboarding = async () => {
    setIsOnboardingComplete(true);
    await secureStorage.setItem('onboarding_complete', 'true');
    
    // Update user profile
    if (user) {
      await supabase
        .from('profiles')
        .update({ onboarding_completed: true })
        .eq('id', user.id);
    }
  };

  const toggleBiometrics = {
    setEnabled: async (enabled: boolean) => {
      await secureStorage.setItem(SECURE_STORAGE_KEYS.BIOMETRICS_ENABLED, JSON.stringify(enabled));
    },
    getEnabled: async () => {
      const enabled = await secureStorage.getItem(SECURE_STORAGE_KEYS.BIOMETRICS_ENABLED);
      return enabled ? JSON.parse(enabled) : false;
    },
    authenticate: async () => {
      try {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();
        
        if (!hasHardware || !isEnrolled) {
          return false;
        }

        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Authenticate to sign in',
          fallbackLabel: 'Use password',
        });

        return result.success;
      } catch (error) {
        console.error('Biometric authentication error:', error);
        return false;
      }
    },
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      isOnboardingComplete,
      signIn,
      signUp,
      signOut,
      resetPassword,
      updatePassword,
      verifyOTP,
      resendOTP,
      completeOnboarding,
      toggleBiometrics,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
import React, { createContext, useEffect, useState } from 'react';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { User } from '@/types/global';
import { secureStorage, SECURE_STORAGE_KEYS } from '@/lib/secure-storage';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  onboardingCompleted: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  updatePassword: (newPassword: string) => Promise<{ error: any }>;
  completeOnboarding: () => Promise<void>;
  toggleBiometrics: {
    setEnabled: (enabled: boolean) => Promise<void>;
    getEnabled: () => Promise<boolean>;
  };
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);

  useEffect(() => {
    // Get initial session from secure storage
    const initializeSession = async () => {
      try {
        // First try to get the current session from Supabase
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setSession(session);
          await secureStorage.setItem(SECURE_STORAGE_KEYS.SESSION, JSON.stringify(session));
          await loadUserProfile(session.user);
          return;
        }

        // If no current session, try to get from storage
        const storedSession = await secureStorage.getItem(SECURE_STORAGE_KEYS.SESSION);
        if (storedSession) {
          const parsedSession = JSON.parse(storedSession);
          // Verify the session is still valid
          const { data: { user } } = await supabase.auth.getUser(parsedSession?.access_token);
          if (user) {
            setSession(parsedSession);
            await loadUserProfile(user);
            return;
          }
        }

        // No valid session found
        setUser(null);
      } catch (error) {
        console.error('Session initialization error:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    initializeSession();

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
          await loadUserProfile(session.user);
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (supabaseUser: SupabaseUser) => {
    try {
      setLoading(true);
      console.log('Loading user profile for:', supabaseUser.email);
      
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
      } else {
        console.error('Error loading profile:', error);
        setUser(null);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      console.log('Starting sign in process for:', email);

      // Try password sign in first
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Sign in error:', error);
        return { error };
      }

      console.log('Sign in successful, storing session');
      
      // Store session for future use
      if (data.session) {
        await secureStorage.setItem(SECURE_STORAGE_KEYS.SESSION, JSON.stringify(data.session));
        setSession(data.session);
        
        // Load user profile immediately
        if (data.user) {
          await loadUserProfile(data.user);
        }
      }

      return { error: null };
    } catch (error) {
      console.error('Unexpected sign in error:', error);
      setUser(null);
      return { error: new Error('An unexpected error occurred during sign in') };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName || '',
        },
      },
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'dailyzen://reset-password',
    });
    return { error };
  };

  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    return { error };
  };

  const toggleBiometrics = {
    setEnabled: async (enabled: boolean) => {
      await secureStorage.setItem(SECURE_STORAGE_KEYS.BIOMETRICS_ENABLED, JSON.stringify(enabled));
      if (!enabled) {
        await secureStorage.removeItem(SECURE_STORAGE_KEYS.SESSION);
      }
    },
    getEnabled: async () => {
      const enabled = await secureStorage.getItem(SECURE_STORAGE_KEYS.BIOMETRICS_ENABLED);
      return enabled ? JSON.parse(enabled) : false;
    },
  };

  const completeOnboarding = async () => {
    if (!user) return;
    
    const { error } = await supabase
      .from('profiles')
      .update({ onboarding_completed: true })
      .eq('id', user.id);
      
    if (!error) {
      setUser(prev => prev ? { ...prev, onboarding_completed: true } : null);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      onboardingCompleted: user?.onboarding_completed ?? false,
      signIn,
      signUp,
      signOut,
      resetPassword,
      updatePassword,
      completeOnboarding,
      toggleBiometrics,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
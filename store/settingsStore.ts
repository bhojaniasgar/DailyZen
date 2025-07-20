import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { storage } from '@/lib/storage';
import { supabase } from '@/lib/supabase';

interface AppSettings {
  theme: string;
  notificationsEnabled: boolean;
  biometricsEnabled: boolean;
  waterReminderInterval: number; // in minutes
  defaultCurrency: string;
  onboardingCompleted: boolean;
}

interface AppStore {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => Promise<void>;
  initializeSettings: (userId: string) => Promise<void>;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      settings: {
        theme: 'light',
        notificationsEnabled: false,
        biometricsEnabled: false,
        waterReminderInterval: 120,
        defaultCurrency: 'USD',
        onboardingCompleted: false,
      },
      updateSettings: async (newSettings) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        }));

        // Sync with Supabase if we have relevant settings
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const syncedSettings = {
            theme_preference: newSettings.theme,
            notifications_enabled: newSettings.notificationsEnabled,
            biometrics_enabled: newSettings.biometricsEnabled,
          };

          await supabase
            .from('profiles')
            .update(syncedSettings)
            .eq('id', session.user.id);
        }
      },
      initializeSettings: async (userId) => {
        try {
          // Fetch user settings from Supabase
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

          if (profile) {
            set((state) => ({
              settings: {
                ...state.settings,
                theme: profile.theme_preference || state.settings.theme,
                notificationsEnabled: profile.notifications_enabled || state.settings.notificationsEnabled,
                biometricsEnabled: profile.biometrics_enabled || state.settings.biometricsEnabled,
                onboardingCompleted: profile.onboarding_completed || state.settings.onboardingCompleted,
              },
            }));
          }
        } catch (error) {
          console.error('Error initializing settings:', error);
        }
      },
    }),
    {
      name: 'dailyzen-storage',
      storage: createJSONStorage(() => ({
        getItem: (key: string) => {
          const value = storage.get(key);
          return value ? Promise.resolve(value) : Promise.resolve(null);
        },
        setItem: (key: string, value: string) => {
          storage.set(key, value);
          return Promise.resolve();
        },
        removeItem: (key: string) => {
          storage.delete(key);
          return Promise.resolve();
        },
      })),
    }
  )
);

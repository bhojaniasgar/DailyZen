import * as SecureStore from 'expo-secure-store';

// Define keys for secure storage
export const SECURE_STORAGE_KEYS = {
  SESSION: 'session',
  THEME: 'theme',
  BIOMETRICS_ENABLED: 'biometricsEnabled'
};

export const secureStorage = {
  async setItem(key: string, value: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.error('Secure storage set error:', error);
    }
  },

  async getItem(key: string): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.error('Secure storage get error:', error);
      return null;
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error('Secure storage remove error:', error);
    }
  }
};

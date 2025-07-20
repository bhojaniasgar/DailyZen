import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { storage } from './storage';

// Define keys for secure storage
export const SECURE_STORAGE_KEYS = {
  SESSION: 'session',
  THEME: 'theme',
  BIOMETRICS_ENABLED: 'biometricsEnabled'
};

export const secureStorage = {
  async setItem(key: string, value: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        // Use MMKV storage for web platform
        storage.set(key, value);
      } else {
        // Use SecureStore for native platforms
        await SecureStore.setItemAsync(key, value);
      }
    } catch (error) {
      console.error('Secure storage set error:', error);
    }
  },

  async getItem(key: string): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        // Use MMKV storage for web platform
        return storage.getString(key) || null;
      } else {
        // Use SecureStore for native platforms
        return await SecureStore.getItemAsync(key);
      }
    } catch (error) {
      console.error('Secure storage get error:', error);
      return null;
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        // Use MMKV storage for web platform
        storage.delete(key);
      } else {
        // Use SecureStore for native platforms
        await SecureStore.deleteItemAsync(key);
      }
    } catch (error) {
      console.error('Secure storage remove error:', error);
    }
  }
};
import AsyncStorage from '@react-native-async-storage/async-storage';

class Storage {
  async set(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error('Storage set error:', error);
    }
  }

  async get(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error('Storage get error:', error);
      return null;
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Storage delete error:', error);
    }
  }

  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Storage clear error:', error);
    }
  }

  async getAllKeys(): Promise<string[]> {
    try {
      return await AsyncStorage.getAllKeys();
    } catch (error) {
      console.error('Storage getAllKeys error:', error);
      return [];
    }
  }

  // Helper methods for JSON data
  async setObject(key: string, value: any): Promise<void> {
    try {
      await this.set(key, JSON.stringify(value));
    } catch (error) {
      console.error('Storage setObject error:', error);
    }
  }

  async getObject<T>(key: string): Promise<T | null> {
    try {
      const value = await this.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Storage getObject error:', error);
      return null;
    }
  }

  // Helper methods for boolean values
  async setBoolean(key: string, value: boolean): Promise<void> {
    await this.set(key, value.toString());
  }

  async getBoolean(key: string): Promise<boolean> {
    const value = await this.get(key);
    return value === 'true';
  }

  // Helper methods for number values
  async setNumber(key: string, value: number): Promise<void> {
    await this.set(key, value.toString());
  }

  async getNumber(key: string): Promise<number | null> {
    const value = await this.get(key);
    return value ? parseFloat(value) : null;
  }
}

export const storage = new Storage();
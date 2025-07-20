import { MMKV } from 'react-native-mmkv';

const mmkv = new MMKV();

class Storage {
  set(key: string, value: string): void {
    try {
      mmkv.set(key, value);
    } catch (error) {
      console.error('Storage set error:', error);
    }
  }

  get(key: string): string | null {
    try {
      return mmkv.getString(key) ?? null;
    } catch (error) {
      console.error('Storage get error:', error);
      return null;
    }
  }

  delete(key: string): void {
    try {
      mmkv.delete(key);
    } catch (error) {
      console.error('Storage delete error:', error);
    }
  }

  clear(): void {
    try {
      mmkv.clearAll();
    } catch (error) {
      console.error('Storage clear error:', error);
    }
  }

  getAllKeys(): string[] {
    try {
      return mmkv.getAllKeys();
    } catch (error) {
      console.error('Storage getAllKeys error:', error);
      return [];
    }
  }

  // JSON object helpers
  setObject(key: string, value: any): void {
    try {
      this.set(key, JSON.stringify(value));
    } catch (error) {
      console.error('Storage setObject error:', error);
    }
  }

  getObject<T>(key: string): T | null {
    try {
      const value = this.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Storage getObject error:', error);
      return null;
    }
  }

  // Boolean helpers
  setBoolean(key: string, value: boolean): void {
    this.set(key, value.toString());
  }

  getBoolean(key: string): boolean {
    return this.get(key) === 'true';
  }

  // Number helpers
  setNumber(key: string, value: number): void {
    this.set(key, value.toString());
  }

  getNumber(key: string): number | null {
    const value = this.get(key);
    return value ? parseFloat(value) : null;
  }
}

export const storage = new Storage();

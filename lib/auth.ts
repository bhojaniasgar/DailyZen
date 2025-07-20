import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';

const AUTH_KEY = 'auth_session';
const BIOMETRICS_ENABLED_KEY = 'biometrics_enabled';

export const authStorage = {
  async saveSession(session: any) {
    await SecureStore.setItemAsync(AUTH_KEY, JSON.stringify(session));
  },

  async getSession() {
    const session = await SecureStore.getItemAsync(AUTH_KEY);
    return session ? JSON.parse(session) : null;
  },

  async removeSession() {
    await SecureStore.deleteItemAsync(AUTH_KEY);
  },

  async setBiometricsEnabled(enabled: boolean) {
    await SecureStore.setItemAsync(BIOMETRICS_ENABLED_KEY, JSON.stringify(enabled));
  },

  async isBiometricsEnabled() {
    const enabled = await SecureStore.getItemAsync(BIOMETRICS_ENABLED_KEY);
    return enabled ? JSON.parse(enabled) : false;
  },

  async authenticateWithBiometrics() {
    const isEnabled = await this.isBiometricsEnabled();
    if (!isEnabled) return false;

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Log in with biometrics',
      disableDeviceFallback: false,
    });

    return result.success;
  }
};

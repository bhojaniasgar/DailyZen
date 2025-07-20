import * as LocalAuthentication from 'expo-local-authentication';
import { storage } from '@/lib/storage';

export async function authenticateWithBiometrics(): Promise<boolean> {
  try {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    
    if (!hasHardware || !isEnrolled) {
      return false;
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Authenticate to continue',
      fallbackLabel: 'Use password',
    });

    return result.success;
  } catch (error) {
    console.error('Biometric authentication error:', error);
    return false;
  }
}

export async function checkBiometricsAvailable(): Promise<boolean> {
  try {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    return hasHardware && isEnrolled;
  } catch (error) {
    console.error('Error checking biometrics:', error);
    return false;
  }
}

import React from 'react';
import { View, StyleSheet, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { useAuth } from '@/hooks/useAuth';
import * as Notifications from 'expo-notifications';

export default function Permissions() {
  const router = useRouter();
  const { completeOnboarding } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(false);

  const handleNotificationToggle = async (value: boolean) => {
    if (value) {
      const { status } = await Notifications.requestPermissionsAsync();
      setNotificationsEnabled(status === 'granted');
    } else {
      setNotificationsEnabled(false);
    }
  };

  const handleContinue = async () => {
    await completeOnboarding();
    router.replace('/(auth)/signin');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>App Permissions</Text>
      <Text style={styles.subtitle}>Configure your app permissions</Text>

      <View style={styles.permissionItem}>
        <View>
          <Text style={styles.permissionTitle}>Push Notifications</Text>
          <Text style={styles.permissionDescription}>
            Get reminders for your tasks, habits, and water intake
          </Text>
        </View>
        <Switch
          value={notificationsEnabled}
          onValueChange={handleNotificationToggle}
        />
      </View>

      <Text style={styles.note}>
        Note: Camera permission will be requested when you first use the QR scanner
      </Text>

      <Button onPress={handleContinue} style={styles.button}>
        Continue to Sign In
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
  },
  permissionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  permissionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  permissionDescription: {
    fontSize: 14,
    color: '#666',
    maxWidth: '80%',
  },
  note: {
    marginTop: 24,
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  button: {
    marginTop: 32,
  },
});

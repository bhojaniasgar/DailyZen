import { Platform } from 'react-native';

interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
}

class Analytics {
  private enabled = true;

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  track(event: AnalyticsEvent) {
    if (!this.enabled) return;

    // Log to console in development
    if (__DEV__) {
      console.log('Analytics Event:', event.name, event.properties);
    }

    // TODO: Replace with actual analytics service (Firebase, Amplitude, etc.)
    // Example: amplitude.track(event.name, event.properties);
  }

  // User events
  userSignedUp(method: string) {
    this.track({
      name: 'user_signed_up',
      properties: { method, platform: Platform.OS },
    });
  }

  userSignedIn(method: string) {
    this.track({
      name: 'user_signed_in',
      properties: { method, platform: Platform.OS },
    });
  }

  // Tool usage events
  toolOpened(toolName: string) {
    this.track({
      name: 'tool_opened',
      properties: { tool_name: toolName },
    });
  }

  habitCompleted(habitId: string, streakCount: number) {
    this.track({
      name: 'habit_completed',
      properties: { habit_id: habitId, streak_count: streakCount },
    });
  }

  taskCompleted(taskId: string, priority: string) {
    this.track({
      name: 'task_completed',
      properties: { task_id: taskId, priority },
    });
  }

  expenseAdded(amount: number, category: string) {
    this.track({
      name: 'expense_added',
      properties: { amount, category },
    });
  }

  waterLogged(amount: number, dailyTotal: number) {
    this.track({
      name: 'water_logged',
      properties: { amount, daily_total: dailyTotal },
    });
  }

  pomodoroCompleted(sessionType: string, duration: number) {
    this.track({
      name: 'pomodoro_completed',
      properties: { session_type: sessionType, duration },
    });
  }

  // Engagement events
  themeChanged(themeName: string) {
    this.track({
      name: 'theme_changed',
      properties: { theme_name: themeName },
    });
  }

  onboardingCompleted(timeSpent: number) {
    this.track({
      name: 'onboarding_completed',
      properties: { time_spent: timeSpent },
    });
  }

  // Monetization events
  adViewed(adType: string, placement: string) {
    this.track({
      name: 'ad_viewed',
      properties: { ad_type: adType, placement },
    });
  }

  premiumUpgrade(source: string) {
    this.track({
      name: 'premium_upgrade',
      properties: { source },
    });
  }
}

export const analytics = new Analytics();
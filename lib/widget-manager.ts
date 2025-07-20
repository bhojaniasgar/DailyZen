import { storage } from './storage';
import { Task } from '@/types/global';
import { Platform, NativeModules } from 'react-native';

class WidgetManager {
  private readonly WIDGET_TASKS_KEY = 'widget_tasks';

  async updateWidgetTasks(tasks: Task[]) {
    try {
      // Format tasks for widget display (limit to 5 most recent tasks)
      const widgetTasks = tasks
        .slice(0, 5)
        .map(({ id, title, priority, completed }) => ({
          id,
          title,
          priority,
          completed,
        }));

      // Store tasks in shared storage
      if (Platform.OS === 'ios') {
        // Use App Groups for iOS
        await storage.setObject('group.com.dailyzen.widget.tasks', widgetTasks);
      } else {
        // Use SharedPreferences for Android
        await storage.setObject('TodoWidget.tasks', widgetTasks);
      }

      // Trigger widget update
      if (Platform.OS === 'ios') {
        // Reload widget timeline
        await this.reloadWidget();
      } else {
        // Send broadcast to update Android widget
        await this.updateAndroidWidget();
      }
    } catch (error) {
      console.error('Error updating widget tasks:', error);
    }
  }

  private async reloadWidget() {
    if (Platform.OS === 'ios') {
      NativeModules.WidgetManager.reloadWidget();
    }
  }

  private async updateAndroidWidget() {
    if (Platform.OS === 'android') {
      NativeModules.WidgetManager.updateWidget();
    }
  }
}

export const widgetManager = new WidgetManager();

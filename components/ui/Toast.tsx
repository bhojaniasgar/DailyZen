import Toast, { BaseToast, ErrorToast, BaseToastProps } from 'react-native-toast-message';
import { useTheme } from '@/hooks/useTheme';

export const toastConfig = {
  success: (props: BaseToastProps) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: '#4CAF50',
        backgroundColor: '#E8F5E9',
      }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 16,
        fontWeight: '600',
      }}
      text2Style={{
        fontSize: 14,
      }}
    />
  ),
  error: (props: BaseToastProps) => (
    <ErrorToast
      {...props}
      style={{
        borderLeftColor: '#F44336',
        backgroundColor: '#FFEBEE',
      }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 16,
        fontWeight: '600',
      }}
      text2Style={{
        fontSize: 14,
      }}
    />
  ),
    info: (props: BaseToastProps) => (
        <BaseToast
        {...props}
        style={{
            borderLeftColor: '#2196F3',
            backgroundColor: '#E3F2FD',
        }}
        contentContainerStyle={{ paddingHorizontal: 15 }}
        text1Style={{
            fontSize: 16,
            fontWeight: '600',
        }}
        text2Style={{
            fontSize: 14,
        }}
        />
    ),
};
 

export const showToast = (type: 'success' | 'error' | 'info', title: string, message?: string) => {
  Toast.show({
    type,
    text1: title,
    text2: message,
    position: 'top',
    visibilityTime: 4000,
    autoHide: true,
    topOffset: 50,
    onPress() {
        Toast.hide();
    },
  });
};

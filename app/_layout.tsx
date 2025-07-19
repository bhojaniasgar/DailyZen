import { ThemeProvider } from '@/context/ThemeContext';
import { Slot } from 'expo-router';

export default function Layout() {
  return (
    <ThemeProvider>
       <Slot />
    </ThemeProvider>
  );
}

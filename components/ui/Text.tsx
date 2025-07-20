import { Text as RNText, TextProps, TextStyle } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import React from 'react';

interface CustomTextProps extends TextProps {
  variant?: 'header' | 'title' | 'body' | 'caption';
  color?: string;
}

export function Text({ style, variant, color, ...props }: CustomTextProps) {
  const { theme } = useTheme();

  const getVariantStyle = (): TextStyle => {
    switch (variant) {
      case 'header':
        return {
          fontSize: 24,
          fontWeight: 'bold',
          marginBottom: 8,
        };
      case 'title':
        return {
          fontSize: 18,
          fontWeight: '600',
          marginBottom: 4,
        };
      case 'caption':
        return {
          fontSize: 12,
          color: theme.colors.textSecondary,
        };
      default:
        return {
          fontSize: 16,
        };
    }
  };

  return (
    <RNText
      style={[
        {
          color: color || theme.colors.text,
        },
        getVariantStyle(),
        style,
      ]}
      {...props}
    />
  );
}

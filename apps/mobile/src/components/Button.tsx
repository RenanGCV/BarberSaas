import { theme } from '@/constants/theme';
import React from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TextStyle,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  fullWidth = false,
  icon,
  style,
}) => {
  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      ...styles.button,
      ...styles[size],
    };

    if (fullWidth) {
      baseStyle.width = '100%';
    }

    const variantStyles: Record<string, ViewStyle> = {
      primary: styles.primaryButton,
      secondary: styles.secondaryButton,
      outline: styles.outlineButton,
      ghost: styles.ghostButton,
    };

    return { ...baseStyle, ...variantStyles[variant], ...style };
  };

  const getTextStyle = (): TextStyle => {
    const variantTextStyles: Record<string, TextStyle> = {
      primary: styles.primaryText,
      secondary: styles.secondaryText,
      outline: styles.outlineText,
      ghost: styles.ghostText,
    };

    return { ...styles.buttonText, ...variantTextStyles[variant] };
  };

  return (
    <TouchableOpacity
      style={[
        getButtonStyle(),
        (disabled || isLoading) && styles.disabled,
      ]}
      onPress={onPress}
      disabled={disabled || isLoading}
      activeOpacity={0.7}
    >
      {isLoading ? (
        <ActivityIndicator color={variant === 'primary' ? '#fff' : theme.colors.primary} />
      ) : (
        <View style={styles.content}>
          {icon && <View style={styles.icon}>{icon}</View>}
          <Text style={getTextStyle()}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  sm: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  md: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  lg: {
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: theme.spacing.sm,
  },
  buttonText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
  },
  primaryText: {
    color: '#fff',
  },
  secondaryButton: {
    backgroundColor: theme.colors.card,
  },
  secondaryText: {
    color: theme.colors.text,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  outlineText: {
    color: theme.colors.primary,
  },
  ghostButton: {
    backgroundColor: 'transparent',
  },
  ghostText: {
    color: theme.colors.primary,
  },
  disabled: {
    opacity: 0.5,
  },
});

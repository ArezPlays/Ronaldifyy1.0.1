import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  testID?: string;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  icon,
  style,
  textStyle,
  testID,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    };

    const sizeStyles: Record<string, ViewStyle> = {
      small: { paddingVertical: 10, paddingHorizontal: 16 },
      medium: { paddingVertical: 16, paddingHorizontal: 24 },
      large: { paddingVertical: 20, paddingHorizontal: 32 },
    };

    const variantStyles: Record<string, ViewStyle> = {
      secondary: { backgroundColor: Colors.surface },
      outline: { backgroundColor: 'transparent', borderWidth: 2, borderColor: Colors.primary },
      ghost: { backgroundColor: 'transparent' },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...(variant !== 'primary' ? variantStyles[variant] : {}),
      opacity: isDisabled ? 0.5 : 1,
    };
  };

  const getTextStyle = (): TextStyle => {
    const sizeStyles: Record<string, TextStyle> = {
      small: { fontSize: 14 },
      medium: { fontSize: 16 },
      large: { fontSize: 18 },
    };

    const variantStyles: Record<string, TextStyle> = {
      primary: { color: Colors.black },
      secondary: { color: Colors.text },
      outline: { color: Colors.primary },
      ghost: { color: Colors.textSecondary },
    };

    return {
      fontWeight: '600' as const,
      ...sizeStyles[size],
      ...variantStyles[variant],
    };
  };

  const content = (
    <>
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? Colors.black : Colors.text} size="small" />
      ) : (
        <>
          {icon}
          <Text style={[getTextStyle(), textStyle]}>{title}</Text>
        </>
      )}
    </>
  );

  if (variant === 'primary') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.8}
        testID={testID}
        style={style}
      >
        <LinearGradient
          colors={Colors.gradient.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[getButtonStyle(), { overflow: 'hidden' }]}
        >
          {content}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
      testID={testID}
      style={[getButtonStyle(), style]}
    >
      {content}
    </TouchableOpacity>
  );
}

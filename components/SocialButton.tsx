import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import Colors from '@/constants/colors';

interface SocialButtonProps {
  title: string;
  onPress: () => void;
  icon: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'apple' | 'google' | 'default';
  testID?: string;
}

export default function SocialButton({
  title,
  onPress,
  icon,
  loading = false,
  disabled = false,
  variant = 'default',
  testID,
}: SocialButtonProps) {
  const isDisabled = disabled || loading;

  const getBackgroundColor = () => {
    switch (variant) {
      case 'apple':
        return Colors.white;
      case 'google':
        return Colors.white;
      default:
        return Colors.surface;
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'apple':
      case 'google':
        return Colors.black;
      default:
        return Colors.text;
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      testID={testID}
      style={[
        styles.button,
        { backgroundColor: getBackgroundColor(), opacity: isDisabled ? 0.5 : 1 },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <>
          <View style={styles.iconContainer}>{icon}</View>
          <Text style={[styles.text, { color: getTextColor() }]}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    gap: 12,
  },
  iconContainer: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
});

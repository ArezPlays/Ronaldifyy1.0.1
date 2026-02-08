import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Apple, ChevronLeft, ArrowRight } from 'lucide-react-native';
import Colors from '@/constants/colors';
import SocialButton from '@/components/SocialButton';
import { useAuth } from '@/contexts/AuthContext';
import { usePersonalization } from '@/contexts/PersonalizationContext';

export default function LoginScreen() {
  const router = useRouter();
  const { signInWithApple, continueAsGuest } = useAuth();
  const { data: personalizationData } = usePersonalization();
  
  const [loading, setLoading] = useState<'apple' | 'guest' | null>(null);

  const { updatePersonalization } = usePersonalization();

  const handleAppleSignIn = async () => {
    try {
      setLoading('apple');
      const appleUser = await signInWithApple();
      console.log('Apple sign in successful, name:', appleUser.displayName, 'email:', appleUser.email);
      if (appleUser.displayName) {
        await updatePersonalization({ name: appleUser.displayName });
        console.log('[Login] Synced Apple name to personalization:', appleUser.displayName);
      }
    } catch (error: any) {
      console.log('Apple sign in error:', error);
      if (error?.message !== 'Sign in was cancelled') {
        Alert.alert('Error', 'Failed to sign in with Apple');
      }
    } finally {
      setLoading(null);
    }
  };

  const handleContinueWithoutSignIn = async () => {
    try {
      setLoading('guest');
      await continueAsGuest(personalizationData?.name || undefined);
      console.log('Guest sign in successful');
    } catch (error) {
      console.log('Guest sign in error:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  const showApple = Platform.OS === 'ios';
  console.log('[Login] Rendering login screen, showApple:', showApple);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0F0F1A', '#1A1A2E', '#0F0F1A']}
        style={StyleSheet.absoluteFill}
      />
      
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <ChevronLeft size={28} color={Colors.text} />
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>Welcome</Text>
            <Text style={styles.subtitle}>Sign in to save your progress across devices, or continue without an account.</Text>
          </View>

          <View style={styles.socialButtons}>
            {showApple && (
              <SocialButton
                title="Continue with Apple"
                onPress={handleAppleSignIn}
                icon={<Apple size={22} color={Colors.black} />}
                variant="apple"
                loading={loading === 'apple'}
                disabled={loading !== null}
                testID="apple-signin-button"
              />
            )}

            {showApple && (
              <View style={styles.dividerContainer}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>
            )}

            <TouchableOpacity
              style={[styles.guestButton, loading !== null && styles.guestButtonDisabled]}
              onPress={handleContinueWithoutSignIn}
              disabled={loading !== null}
              activeOpacity={0.7}
              testID="guest-button"
            >
              {loading === 'guest' ? (
                <View style={styles.guestLoadingContainer}>
                  <Text style={styles.guestButtonText}>Setting up...</Text>
                </View>
              ) : (
                <>
                  <Text style={styles.guestButtonText}>Continue without sign in</Text>
                  <ArrowRight size={20} color={Colors.text} />
                </>
              )}
            </TouchableOpacity>
            
            <Text style={styles.guestNote}>
              Your data will be saved locally on this device
            </Text>
          </View>

          <View style={styles.termsContainer}>
            <Text style={styles.termsText}>
              By continuing, you agree to our Terms of Service and Privacy Policy
            </Text>
            <Text style={styles.madeByText}>Made By Arez :)</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  header: {
    marginTop: 32,
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '800' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    lineHeight: 23,
  },
  socialButtons: {
    gap: 16,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 4,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    fontSize: 14,
    color: Colors.textMuted,
    fontWeight: '500' as const,
  },
  guestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    gap: 10,
  },
  guestButtonDisabled: {
    opacity: 0.5,
  },
  guestLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  guestButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  guestNote: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: -4,
  },
  termsContainer: {
    marginTop: 32,
    paddingHorizontal: 16,
  },
  termsText: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
  madeByText: {
    fontSize: 13,
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '700' as const,
    marginTop: 14,
    letterSpacing: 0.5,
  },
});

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Apple, Chrome, ChevronLeft } from 'lucide-react-native';
import Colors from '@/constants/colors';
import SocialButton from '@/components/SocialButton';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginScreen() {
  const router = useRouter();
  const { signInWithApple, signInWithGoogle } = useAuth();
  
  const [loading, setLoading] = useState<'apple' | 'google' | null>(null);

  const handleAppleSignIn = async () => {
    try {
      setLoading('apple');
      await signInWithApple();
      console.log('Apple sign in successful');
    } catch (error) {
      console.log('Apple sign in error:', error);
      Alert.alert('Error', 'Failed to sign in with Apple');
    } finally {
      setLoading(null);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading('google');
      await signInWithGoogle();
      console.log('Google sign in successful');
    } catch (error) {
      console.log('Google sign in error:', error);
      Alert.alert('Error', 'Failed to sign in with Google');
    } finally {
      setLoading(null);
    }
  };

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
            <Text style={styles.subtitle}>Sign in and start your football journey</Text>
          </View>

          <View style={styles.socialButtons}>
            <SocialButton
              title="Continue with Apple"
              onPress={handleAppleSignIn}
              icon={<Apple size={22} color={Colors.black} />}
              variant="apple"
              loading={loading === 'apple'}
              disabled={loading !== null}
              testID="apple-signin-button"
            />

            <SocialButton
              title="Continue with Google"
              onPress={handleGoogleSignIn}
              icon={<Chrome size={22} color={Colors.black} />}
              variant="google"
              loading={loading === 'google'}
              disabled={loading !== null}
              testID="google-signin-button"
            />
          </View>

          <View style={styles.termsContainer}>
            <Text style={styles.termsText}>
              By continuing, you agree to our Terms of Service and Privacy Policy
            </Text>
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
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  socialButtons: {
    gap: 16,
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
});

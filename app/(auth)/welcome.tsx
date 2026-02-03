import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import Button from '@/components/Button';

const { height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0F0F1A', '#1A1A2E', '#0F0F1A']}
        style={StyleSheet.absoluteFill}
      />
      
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.heroSection}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoEmoji}>⚽</Text>
              <View style={styles.logoGlow} />
            </View>
            
            <Text style={styles.title}>Ronaldify</Text>
            <Text style={styles.subtitle}>Train Like a Champion</Text>
            
            <Text style={styles.description}>
              AI-powered football coaching to unlock your full potential on the pitch
            </Text>
          </View>

          <View style={styles.featuresContainer}>
            <FeatureItem emoji="🎯" text="Personalized Training Plans" />
            <FeatureItem emoji="📹" text="Video Analysis & Feedback" />
            <FeatureItem emoji="🤖" text="AI Coach Available 24/7" />
          </View>

          <View style={styles.buttonContainer}>
            <Button
              title="Get Started"
              onPress={() => router.push('/(auth)/login')}
              size="large"
              testID="get-started-button"
            />
            
            <Text style={styles.termsText}>
              By continuing, you agree to our Terms of Service and Privacy Policy
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

function FeatureItem({ emoji, text }: { emoji: string; text: string }) {
  return (
    <View style={styles.featureItem}>
      <Text style={styles.featureEmoji}>{emoji}</Text>
      <Text style={styles.featureText}>{text}</Text>
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  heroSection: {
    alignItems: 'center',
    marginTop: height * 0.08,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  logoEmoji: {
    fontSize: 56,
  },
  logoGlow: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: Colors.primary,
    opacity: 0.1,
  },
  title: {
    fontSize: 42,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 8,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  featuresContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 20,
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  featureEmoji: {
    fontSize: 28,
  },
  featureText: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '500',
  },
  buttonContainer: {
    paddingBottom: 16,
    gap: 16,
  },
  termsText: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
});

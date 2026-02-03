import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, TouchableOpacity, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Sparkles, Target, Trophy } from 'lucide-react-native';
import Colors from '@/constants/colors';
import Button from '@/components/Button';

const { height } = Dimensions.get('window');

export default function StartScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim, scaleAnim]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0A1628', '#0F0F1A', '#1A1A2E']}
        style={StyleSheet.absoluteFill}
      />
      
      <SafeAreaView style={styles.safeArea}>
        <Animated.View 
          style={[
            styles.content,
            { 
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }, { scale: scaleAnim }]
            }
          ]}
        >
          <View style={styles.heroSection}>
            <View style={styles.logoContainer}>
              <LinearGradient
                colors={['#00C853', '#00A844']}
                style={styles.logoGradient}
              >
                <Text style={styles.logoEmoji}>⚽</Text>
              </LinearGradient>
              <View style={styles.sparkleContainer}>
                <Sparkles size={20} color={Colors.accent} />
              </View>
            </View>
            
            <Text style={styles.title}>Welcome to Ronaldify</Text>
            <Text style={styles.subtitle}>
              Your AI-powered football coach
            </Text>
            
            <Text style={styles.description}>
              Let&apos;s personalize your training experience. It takes less than a minute!
            </Text>
          </View>

          <View style={styles.featuresContainer}>
            <FeatureItem 
              icon={<Target size={24} color={Colors.primary} />}
              title="Personalized Drills"
              description="Training tailored to your position and goals"
            />
            <FeatureItem 
              icon={<Sparkles size={24} color={Colors.accent} />}
              title="AI Coaching"
              description="Get real-time feedback and tips"
            />
            <FeatureItem 
              icon={<Trophy size={24} color="#FF6B35" />}
              title="Track Progress"
              description="See your skills improve over time"
            />
          </View>

          <View style={styles.buttonContainer}>
            <Button
              title="Let's Get Started"
              onPress={() => router.push('/(personalization)/name')}
              size="large"
              testID="start-personalization-button"
            />
            
            <Text style={styles.timeText}>
              ⏱ Takes only 1 minute
            </Text>

            <View style={styles.legalLinks}>
              <TouchableOpacity 
                onPress={() => Linking.openURL('https://factual-headstand-dcf.notion.site/Ronaldify-Privacy-Policy-2fbb9d755c118040aca3f5e890ab22a4')}
              >
                <Text style={styles.legalLinkText}>Privacy Policy</Text>
              </TouchableOpacity>
              <Text style={styles.legalDivider}>•</Text>
              <TouchableOpacity 
                onPress={() => Linking.openURL('https://factual-headstand-dcf.notion.site/Ronaldify-Terms-of-Service-2fbb9d755c11806fa894fcc080a8b8ea?pvs=73')}
              >
                <Text style={styles.legalLinkText}>Terms of Service</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

function FeatureItem({ 
  icon, 
  title, 
  description 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
}) {
  return (
    <View style={styles.featureItem}>
      <View style={styles.featureIcon}>{icon}</View>
      <View style={styles.featureText}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDescription}>{description}</Text>
      </View>
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
    paddingTop: height * 0.05,
    paddingBottom: 20,
  },
  heroSection: {
    alignItems: 'center',
  },
  logoContainer: {
    position: 'relative',
    marginBottom: 24,
  },
  logoGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoEmoji: {
    fontSize: 48,
  },
  sparkleContainer: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: Colors.surface,
    padding: 6,
    borderRadius: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
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
    borderRadius: 24,
    padding: 20,
    gap: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  buttonContainer: {
    gap: 12,
  },
  timeText: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  legalLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    gap: 8,
  },
  legalLinkText: {
    fontSize: 13,
    color: Colors.textMuted,
    textDecorationLine: 'underline',
  },
  legalDivider: {
    fontSize: 13,
    color: Colors.textMuted,
  },
});

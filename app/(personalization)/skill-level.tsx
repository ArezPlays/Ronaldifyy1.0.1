import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, TrendingUp } from 'lucide-react-native';
import Colors from '@/constants/colors';
import Button from '@/components/Button';
import { SkillLevel } from '@/types/user';
import { usePersonalization } from '@/contexts/PersonalizationContext';

const SKILL_LEVELS = [
  {
    id: 'beginner' as SkillLevel,
    label: 'Beginner',
    description: 'Just starting out or learning the basics',
    emoji: '🌱',
    color: '#4CAF50',
  },
  {
    id: 'intermediate' as SkillLevel,
    label: 'Intermediate',
    description: 'Comfortable with fundamentals, looking to improve',
    emoji: '⚡',
    color: '#FF9800',
  },
  {
    id: 'advanced' as SkillLevel,
    label: 'Advanced',
    description: 'Experienced player seeking elite-level training',
    emoji: '🔥',
    color: '#F44336',
  },
];

export default function SkillLevelScreen() {
  const router = useRouter();
  const { data, updatePersonalization } = usePersonalization();
  const [selectedLevel, setSelectedLevel] = useState<SkillLevel | null>(data.skillLevel);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const handleContinue = async () => {
    if (selectedLevel) {
      await updatePersonalization({ skillLevel: selectedLevel });
      router.push('/(personalization)/goals');
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0A1628', '#0F0F1A', '#1A1A2E']}
        style={StyleSheet.absoluteFill}
      />
      
      <SafeAreaView style={styles.safeArea}>
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          <View style={styles.header}>
            <TouchableOpacity 
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <ChevronLeft size={24} color={Colors.text} />
            </TouchableOpacity>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '80%' }]} />
            </View>
            <Text style={styles.stepText}>Step 4 of 5</Text>
          </View>

          <View style={styles.main}>
            <View style={styles.iconContainer}>
              <TrendingUp size={32} color={Colors.primary} />
            </View>
            
            <Text style={styles.title}>What&apos;s your skill level?</Text>
            <Text style={styles.subtitle}>
              We&apos;ll match drill difficulty to your experience
            </Text>

            <View style={styles.optionsContainer}>
              {SKILL_LEVELS.map(level => (
                <TouchableOpacity
                  key={level.id}
                  style={[
                    styles.optionCard,
                    selectedLevel === level.id && { 
                      borderColor: level.color, 
                      backgroundColor: `${level.color}15` 
                    },
                  ]}
                  onPress={() => setSelectedLevel(level.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.optionEmoji}>{level.emoji}</Text>
                  <View style={styles.optionText}>
                    <Text style={[
                      styles.optionLabel,
                      selectedLevel === level.id && { color: level.color },
                    ]}>
                      {level.label}
                    </Text>
                    <Text style={styles.optionDescription}>{level.description}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.footer}>
            <Button
              title="Continue"
              onPress={handleContinue}
              disabled={!selectedLevel}
              size="large"
              testID="skill-level-continue-button"
            />
          </View>
        </Animated.View>
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    paddingTop: 16,
    marginBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  progressBar: {
    height: 4,
    backgroundColor: Colors.surface,
    borderRadius: 2,
    marginBottom: 16,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  stepText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  main: {
    flex: 1,
    alignItems: 'center',
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: `${Colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 10,
    lineHeight: 24,
  },
  optionsContainer: {
    width: '100%',
    gap: 12,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: Colors.border,
    gap: 16,
  },
  optionEmoji: {
    fontSize: 36,
  },
  optionText: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  footer: {
    paddingVertical: 20,
  },
});

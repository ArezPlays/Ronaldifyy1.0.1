import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft } from 'lucide-react-native';
import Colors from '@/constants/colors';
import Button from '@/components/Button';
import { SKILL_LEVELS } from '@/constants/skills';
import { SkillLevel, Position } from '@/types/user';

export default function SkillLevelScreen() {
  const router = useRouter();
  const { position } = useLocalSearchParams<{ position: Position }>();
  const [selectedLevel, setSelectedLevel] = useState<SkillLevel | null>(null);

  const handleContinue = () => {
    if (selectedLevel) {
      router.push({
        pathname: '/(onboarding)/goals',
        params: { position, skillLevel: selectedLevel },
      });
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0F0F1A', '#1A1A2E', '#0F0F1A']}
        style={StyleSheet.absoluteFill}
      />
      
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ChevronLeft size={28} color={Colors.text} />
          </TouchableOpacity>
          
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '66%' }]} />
          </View>
          <Text style={styles.stepText}>Step 2 of 3</Text>
          <Text style={styles.title}>What&apos;s your skill level?</Text>
          <Text style={styles.subtitle}>Be honest — we&apos;ll adjust your training accordingly</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.levelsContainer}>
            {SKILL_LEVELS.map(level => (
              <TouchableOpacity
                key={level.id}
                onPress={() => setSelectedLevel(level.id)}
                style={[
                  styles.levelCard,
                  selectedLevel === level.id && styles.levelCardSelected,
                ]}
                activeOpacity={0.7}
              >
                <View style={styles.levelIconContainer}>
                  <Text style={styles.levelIcon}>{level.icon}</Text>
                </View>
                <View style={styles.levelTextContainer}>
                  <Text style={[
                    styles.levelTitle,
                    selectedLevel === level.id && styles.levelTitleSelected,
                  ]}>
                    {level.label}
                  </Text>
                  <Text style={styles.levelDescription}>{level.description}</Text>
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
            testID="skill-continue-button"
          />
        </View>
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
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
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
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  levelsContainer: {
    gap: 16,
  },
  levelCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: Colors.border,
    gap: 16,
  },
  levelCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: `${Colors.primary}10`,
  },
  levelIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelIcon: {
    fontSize: 32,
  },
  levelTextContainer: {
    flex: 1,
  },
  levelTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  levelTitleSelected: {
    color: Colors.primary,
  },
  levelDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
});

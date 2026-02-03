import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, Check } from 'lucide-react-native';
import Colors from '@/constants/colors';
import Button from '@/components/Button';
import { TRAINING_GOALS } from '@/constants/skills';
import { TrainingGoal, Position, SkillLevel } from '@/types/user';
import { useUser } from '@/contexts/UserContext';

export default function GoalsScreen() {
  const router = useRouter();
  const { position, skillLevel } = useLocalSearchParams<{ 
    position: Position; 
    skillLevel: SkillLevel;
  }>();
  const { completeOnboarding } = useUser();
  const [selectedGoals, setSelectedGoals] = useState<TrainingGoal[]>([]);
  const [loading, setLoading] = useState(false);

  const toggleGoal = (goalId: TrainingGoal) => {
    setSelectedGoals(prev => {
      if (prev.includes(goalId)) {
        return prev.filter(g => g !== goalId);
      }
      if (prev.length >= 3) {
        return prev;
      }
      return [...prev, goalId];
    });
  };

  const handleComplete = async () => {
    if (selectedGoals.length === 0) {
      Alert.alert('Select Goals', 'Please select at least one training goal');
      return;
    }

    try {
      setLoading(true);
      await completeOnboarding({
        position: position || null,
        skillLevel: skillLevel || null,
        goals: selectedGoals,
      });
      console.log('Onboarding completed successfully');
      router.replace('/(tabs)/welcome-coach');
    } catch (error) {
      console.log('Error completing onboarding:', error);
      Alert.alert('Error', 'Failed to save your preferences');
    } finally {
      setLoading(false);
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
            <View style={[styles.progressFill, { width: '100%' }]} />
          </View>
          <Text style={styles.stepText}>Step 3 of 3</Text>
          <Text style={styles.title}>What do you want to improve?</Text>
          <Text style={styles.subtitle}>Select up to 3 training goals</Text>
        </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.goalsGrid}>
            {TRAINING_GOALS.map(goal => {
              const isSelected = selectedGoals.includes(goal.id);
              return (
                <TouchableOpacity
                  key={goal.id}
                  onPress={() => toggleGoal(goal.id)}
                  style={[
                    styles.goalCard,
                    isSelected && styles.goalCardSelected,
                  ]}
                  activeOpacity={0.7}
                >
                  {isSelected && (
                    <View style={styles.checkBadge}>
                      <Check size={14} color={Colors.black} strokeWidth={3} />
                    </View>
                  )}
                  <Text style={styles.goalIcon}>{goal.icon}</Text>
                  <Text style={[
                    styles.goalTitle,
                    isSelected && styles.goalTitleSelected,
                  ]}>
                    {goal.label}
                  </Text>
                  <Text style={styles.goalDescription}>{goal.description}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Text style={styles.selectedCount}>
            {selectedGoals.length}/3 selected
          </Text>
          <Button
            title="Start Training"
            onPress={handleComplete}
            disabled={selectedGoals.length === 0}
            loading={loading}
            size="large"
            testID="goals-complete-button"
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  goalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  goalCard: {
    width: '47%',
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    position: 'relative',
  },
  goalCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: `${Colors.primary}10`,
  },
  checkBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  goalTitleSelected: {
    color: Colors.primary,
  },
  goalDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 12,
  },
  selectedCount: {
    textAlign: 'center',
    color: Colors.textSecondary,
    fontSize: 14,
  },
});

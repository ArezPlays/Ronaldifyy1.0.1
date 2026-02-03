import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, Target, Check } from 'lucide-react-native';
import Colors from '@/constants/colors';
import Button from '@/components/Button';
import { TrainingGoal } from '@/types/user';
import { usePersonalization } from '@/contexts/PersonalizationContext';
import { TRAINING_GOALS } from '@/constants/skills';

export default function GoalsScreen() {
  const router = useRouter();
  const { data, updatePersonalization, completePersonalization } = usePersonalization();
  const [selectedGoals, setSelectedGoals] = useState<TrainingGoal[]>(data.goals || []);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const toggleGoal = (goalId: TrainingGoal) => {
    setSelectedGoals(prev => {
      if (prev.includes(goalId)) {
        return prev.filter(g => g !== goalId);
      }
      if (prev.length >= 3) {
        return [...prev.slice(1), goalId];
      }
      return [...prev, goalId];
    });
  };

  const handleComplete = async () => {
    if (selectedGoals.length > 0) {
      await updatePersonalization({ goals: selectedGoals });
      await completePersonalization();
      router.replace('/(auth)/login');
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
              <View style={[styles.progressFill, { width: '100%' }]} />
            </View>
            <Text style={styles.stepText}>Step 5 of 5</Text>
          </View>

          <View style={styles.main}>
            <View style={styles.iconContainer}>
              <Target size={32} color={Colors.primary} />
            </View>
            
            <Text style={styles.title}>What do you want to improve?</Text>
            <Text style={styles.subtitle}>
              Select up to 3 goals for personalized training
            </Text>

            <ScrollView 
              style={styles.scrollView}
              contentContainerStyle={styles.goalsContainer}
              showsVerticalScrollIndicator={false}
            >
              {TRAINING_GOALS.map(goal => {
                const isSelected = selectedGoals.includes(goal.id as TrainingGoal);
                return (
                  <TouchableOpacity
                    key={goal.id}
                    style={[
                      styles.goalCard,
                      isSelected && styles.goalCardSelected,
                    ]}
                    onPress={() => toggleGoal(goal.id as TrainingGoal)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.goalEmoji}>{goal.icon}</Text>
                    <View style={styles.goalText}>
                      <Text style={[
                        styles.goalLabel,
                        isSelected && styles.goalLabelSelected,
                      ]}>
                        {goal.label}
                      </Text>
                      <Text style={styles.goalDescription}>{goal.description}</Text>
                    </View>
                    {isSelected && (
                      <View style={styles.checkmark}>
                        <Check size={16} color={Colors.black} />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          <View style={styles.footer}>
            <View style={styles.selectedCount}>
              <Text style={styles.selectedCountText}>
                {selectedGoals.length}/3 selected
              </Text>
            </View>
            <Button
              title="Complete Setup"
              onPress={handleComplete}
              disabled={selectedGoals.length === 0}
              size="large"
              testID="goals-complete-button"
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
    fontSize: 26,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 10,
    lineHeight: 24,
  },
  scrollView: {
    width: '100%',
  },
  goalsContainer: {
    gap: 12,
    paddingBottom: 20,
  },
  goalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: Colors.border,
    gap: 14,
  },
  goalCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: `${Colors.primary}15`,
  },
  goalEmoji: {
    fontSize: 32,
  },
  goalText: {
    flex: 1,
  },
  goalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 2,
  },
  goalLabelSelected: {
    color: Colors.primary,
  },
  goalDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  checkmark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    paddingVertical: 16,
    gap: 12,
  },
  selectedCount: {
    alignItems: 'center',
  },
  selectedCountText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
});

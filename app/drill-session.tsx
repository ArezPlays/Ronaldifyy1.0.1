import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Animated,
  Vibration,
  Platform
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  X, 
  Play, 
  Pause, 
  CheckCircle, 
  Clock, 
  ChevronRight,
  Award,
  Flame
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { getDrillById } from '@/mocks/training';
import { notifyDrillCompleted } from '@/lib/notifications';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useTraining } from '@/contexts/TrainingContext';

export default function DrillSessionScreen() {
  const { drillId } = useLocalSearchParams<{ drillId: string }>();
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(true);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [isCompleted, setIsCompleted] = useState(false);
  
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  const { t } = useLanguage();
  const { colors } = useTheme();
  const { completeDrill } = useTraining();

  const drill = getDrillById(drillId || '');

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  useEffect(() => {
    if (isRunning) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: Platform.OS !== 'web',
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: Platform.OS !== 'web',
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRunning, pulseAnim]);

  useEffect(() => {
    if (drill) {
      const progress = completedSteps.size / drill.steps.length;
      Animated.timing(progressAnim, {
        toValue: progress,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  }, [completedSteps, drill, progressAnim]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStepComplete = (stepIndex: number) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    setCompletedSteps(prev => {
      const newSet = new Set(prev);
      if (newSet.has(stepIndex)) {
        newSet.delete(stepIndex);
      } else {
        newSet.add(stepIndex);
      }
      return newSet;
    });

    if (stepIndex === currentStep && drill && stepIndex < drill.steps.length - 1) {
      setCurrentStep(stepIndex + 1);
    }
  };

  const handleComplete = async () => {
    if (!drill) return;
    
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Vibration.vibrate(200);
    }
    
    setIsRunning(false);
    setIsCompleted(true);
    
    // Track completion in training context
    const result = await completeDrill(drill.id, Math.floor(timeElapsed / 60) || drill.duration);
    console.log('Drill completed! XP earned:', result?.xpEarned);
    
    await notifyDrillCompleted(drill.title);
  };

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (timerRef.current) clearInterval(timerRef.current);
    router.back();
  };

  const dynamicStyles = createDynamicStyles(colors);

  if (!drill) {
    return (
      <View style={dynamicStyles.container}>
        <LinearGradient colors={[colors.gradientStart, colors.gradientMiddle]} style={StyleSheet.absoluteFill} />
        <SafeAreaView style={dynamicStyles.safeArea}>
          <Text style={dynamicStyles.errorText}>{t.drillNotFound}</Text>
          <TouchableOpacity style={dynamicStyles.backButton} onPress={handleClose}>
            <Text style={dynamicStyles.backButtonText}>{t.goBack}</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </View>
    );
  }

  if (isCompleted) {
    return (
      <View style={dynamicStyles.container}>
        <LinearGradient colors={[colors.gradientStart, colors.gradientMiddle, colors.gradientEnd]} style={StyleSheet.absoluteFill} />
        <SafeAreaView style={dynamicStyles.safeArea}>
          <View style={dynamicStyles.completedContainer}>
            <View style={dynamicStyles.completedIcon}>
              <Award size={64} color={colors.accent} />
            </View>
            <Text style={dynamicStyles.completedTitle}>{t.drillComplete}</Text>
            <Text style={dynamicStyles.completedSubtitle}>{drill.title}</Text>
            
            <View style={dynamicStyles.statsRow}>
              <View style={dynamicStyles.statItem}>
                <Clock size={20} color={colors.primary} />
                <Text style={dynamicStyles.statValue}>{formatTime(timeElapsed)}</Text>
                <Text style={dynamicStyles.statLabel}>{t.time}</Text>
              </View>
              <View style={dynamicStyles.statDivider} />
              <View style={dynamicStyles.statItem}>
                <CheckCircle size={20} color={colors.success} />
                <Text style={dynamicStyles.statValue}>{completedSteps.size}/{drill.steps.length}</Text>
                <Text style={dynamicStyles.statLabel}>{t.steps}</Text>
              </View>
            </View>

            <TouchableOpacity 
              style={dynamicStyles.doneButton}
              onPress={handleClose}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[colors.primary, colors.accent]}
                style={dynamicStyles.doneButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={dynamicStyles.doneButtonText}>{t.done}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return t.easy;
      case 'medium': return t.medium;
      case 'hard': return t.hard;
      default: return difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
    }
  };

  return (
    <View style={dynamicStyles.container}>
      <LinearGradient colors={[colors.gradientStart, colors.gradientMiddle, colors.gradientEnd]} style={StyleSheet.absoluteFill} />
      
      <SafeAreaView style={dynamicStyles.safeArea} edges={['top', 'bottom']}>
        <View style={dynamicStyles.header}>
          <TouchableOpacity style={dynamicStyles.closeButton} onPress={handleClose}>
            <X size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={dynamicStyles.timerContainer}>
            <Clock size={16} color={colors.primary} />
            <Text style={dynamicStyles.timerText}>{formatTime(timeElapsed)}</Text>
          </View>
        </View>

        <ScrollView 
          style={dynamicStyles.scrollView}
          contentContainerStyle={dynamicStyles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={dynamicStyles.drillInfo}>
            <View style={dynamicStyles.difficultyBadge}>
              <Flame size={12} color={
                drill.difficulty === 'easy' ? colors.success :
                drill.difficulty === 'medium' ? colors.warning : colors.error
              } />
              <Text style={[dynamicStyles.difficultyText, {
                color: drill.difficulty === 'easy' ? colors.success :
                       drill.difficulty === 'medium' ? colors.warning : colors.error
              }]}>
                {getDifficultyText(drill.difficulty)}
              </Text>
            </View>
            <Text style={dynamicStyles.drillTitle}>{drill.title}</Text>
            <Text style={dynamicStyles.drillDescription}>{drill.description}</Text>
          </View>

          <View style={dynamicStyles.progressSection}>
            <View style={dynamicStyles.progressHeader}>
              <Text style={dynamicStyles.progressLabel}>{t.progress}</Text>
              <Text style={dynamicStyles.progressValue}>{completedSteps.size}/{drill.steps.length} {t.steps.toLowerCase()}</Text>
            </View>
            <View style={dynamicStyles.progressBar}>
              <Animated.View style={[dynamicStyles.progressFill, { width: progressWidth }]} />
            </View>
          </View>

          <View style={dynamicStyles.stepsSection}>
            <Text style={dynamicStyles.stepsTitle}>{t.steps}</Text>
            {drill.steps.map((step, index) => {
              const isCurrentStep = index === currentStep;
              const isStepCompleted = completedSteps.has(index);
              
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    dynamicStyles.stepCard,
                    isCurrentStep && dynamicStyles.stepCardActive,
                    isStepCompleted && dynamicStyles.stepCardCompleted
                  ]}
                  onPress={() => handleStepComplete(index)}
                  activeOpacity={0.7}
                >
                  <View style={[
                    dynamicStyles.stepNumber,
                    isStepCompleted && dynamicStyles.stepNumberCompleted
                  ]}>
                    {isStepCompleted ? (
                      <CheckCircle size={16} color={colors.black} />
                    ) : (
                      <Text style={[
                        dynamicStyles.stepNumberText,
                        isCurrentStep && dynamicStyles.stepNumberTextActive
                      ]}>{index + 1}</Text>
                    )}
                  </View>
                  <Text style={[
                    dynamicStyles.stepText,
                    isStepCompleted && dynamicStyles.stepTextCompleted
                  ]}>{step}</Text>
                  {isCurrentStep && !isStepCompleted && (
                    <ChevronRight size={18} color={colors.primary} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {drill.equipment.length > 0 && (
            <View style={dynamicStyles.equipmentSection}>
              <Text style={dynamicStyles.equipmentTitle}>{t.equipment}</Text>
              <View style={dynamicStyles.equipmentList}>
                {drill.equipment.map((item, index) => (
                  <View key={index} style={dynamicStyles.equipmentItem}>
                    <Text style={dynamicStyles.equipmentText}>{item}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </ScrollView>

        <View style={dynamicStyles.footer}>
          <Animated.View style={{ transform: [{ scale: isRunning ? pulseAnim : 1 }], flex: 1 }}>
            <TouchableOpacity
              style={[dynamicStyles.actionButton, isRunning && dynamicStyles.actionButtonPaused]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setIsRunning(!isRunning); }}
              activeOpacity={0.8}
            >
              {isRunning ? (
                <>
                  <Pause size={20} color={colors.text} />
                  <Text style={dynamicStyles.actionButtonTextPaused}>{t.pause}</Text>
                </>
              ) : (
                <>
                  <Play size={20} color={colors.black} fill={colors.black} />
                  <Text style={dynamicStyles.actionButtonText}>
                    {timeElapsed > 0 ? t.resume : t.start}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </Animated.View>

          {completedSteps.size === drill.steps.length && (
            <TouchableOpacity
              style={dynamicStyles.completeButton}
              onPress={handleComplete}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[colors.success, '#00B347']}
                style={dynamicStyles.completeButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <CheckCircle size={20} color={colors.text} />
                <Text style={dynamicStyles.completeButtonText}>{t.complete}</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

const createDynamicStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  timerText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.text,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
  },
  drillInfo: {
    marginBottom: 24,
  },
  difficultyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginBottom: 12,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  drillTitle: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: colors.text,
    marginBottom: 8,
  },
  drillDescription: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  progressSection: {
    marginBottom: 24,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.textSecondary,
  },
  progressValue: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.primary,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.surface,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  stepsSection: {
    marginBottom: 24,
  },
  stepsTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 12,
  },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    gap: 12,
  },
  stepCardActive: {
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}08`,
  },
  stepCardCompleted: {
    backgroundColor: `${colors.success}15`,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberCompleted: {
    backgroundColor: colors.success,
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: colors.textMuted,
  },
  stepNumberTextActive: {
    color: colors.primary,
  },
  stepText: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
    lineHeight: 20,
  },
  stepTextCompleted: {
    color: colors.textSecondary,
    textDecorationLine: 'line-through',
  },
  equipmentSection: {
    marginBottom: 24,
  },
  equipmentTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 12,
  },
  equipmentList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  equipmentItem: {
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  equipmentText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 34,
    flexDirection: 'row',
    gap: 12,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    gap: 8,
  },
  actionButtonPaused: {
    backgroundColor: colors.surface,
  },
  actionButtonText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.black,
  },
  actionButtonTextPaused: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.text,
  },
  completeButton: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
  },
  completeButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  completeButtonText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.text,
  },
  errorText: {
    fontSize: 18,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 100,
  },
  backButton: {
    alignSelf: 'center',
    marginTop: 20,
    backgroundColor: colors.surface,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.primary,
  },
  completedContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  completedIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: `${colors.accent}20`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  completedTitle: {
    fontSize: 32,
    fontWeight: '800' as const,
    color: colors.text,
    marginBottom: 8,
  },
  completedSubtitle: {
    fontSize: 18,
    color: colors.textSecondary,
    marginBottom: 32,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: colors.text,
  },
  statLabel: {
    fontSize: 14,
    color: colors.textMuted,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
  },
  doneButton: {
    width: '100%',
    borderRadius: 14,
    overflow: 'hidden',
  },
  doneButtonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneButtonText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.black,
  },
});

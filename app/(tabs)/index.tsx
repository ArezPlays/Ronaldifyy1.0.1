import React, { useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { 
  Play, 
  Target, 
  MessageCircle, 
  ChevronRight, 
  Zap,
  Flame,
  Trophy,
  Video,
  Lock,
  Sparkles
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/contexts/ThemeContext';
import { useUser } from '@/contexts/UserContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTraining } from '@/contexts/TrainingContext';
import { usePersonalization } from '@/contexts/PersonalizationContext';
import { POSITIONS } from '@/constants/positions';
import { SKILL_MASTERY_PATHS } from '@/mocks/training';

Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const { profile } = useUser();
  const { isPro } = useSubscription();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { data: personalizationData } = usePersonalization();
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  const positionLabel = profile?.position 
    ? POSITIONS.find(p => p.id === profile.position)?.label 
    : t.player;

  const { progress, dailyWorkout, getAllSkillsProgress } = useTraining();

  const topSkills = getAllSkillsProgress
    .sort((a, b) => b.progress - a.progress)
    .slice(0, 3);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const getTimeOfDayGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t.goodMorning;
    if (hour < 17) return t.goodAfternoon;
    return t.goodEvening;
  };

  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientMiddle, colors.gradientEnd]}
        style={StyleSheet.absoluteFill}
      />
      
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View 
            style={[
              styles.header,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
            ]}
          >
            <View style={styles.headerTop}>
              <View>
                <Text style={styles.greeting}>{getTimeOfDayGreeting()},</Text>
                <Text style={styles.name}>{personalizationData?.name || profile?.name || t.champion}</Text>
              </View>
              {isPro ? (
                <View style={styles.proBadge}>
                  <Zap size={14} color="#000000" />
                  <Text style={styles.proText}>PRO</Text>
                </View>
              ) : (
                <TouchableOpacity 
                  style={styles.upgradeButton}
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/paywall'); }}
                >
                  <Text style={styles.upgradeText}>{t.upgrade}</Text>
                </TouchableOpacity>
              )}
            </View>
            
            <View style={styles.positionPill}>
              <Text style={styles.positionEmoji}>⚽</Text>
              <Text style={styles.positionText}>{positionLabel}</Text>
              <View style={styles.positionDot} />
              <Text style={styles.skillText}>
                {profile?.skillLevel 
                  ? profile.skillLevel.charAt(0).toUpperCase() + profile.skillLevel.slice(1)
                  : 'Beginner'}
              </Text>
            </View>
          </Animated.View>

          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <View style={styles.streakCard}>
              <LinearGradient
                colors={['#1E3A5F', '#0F2744']}
                style={styles.streakGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.streakContent}>
                  <View style={styles.streakMain}>
                    <View style={styles.streakIconContainer}>
                      <Flame size={28} color="#FF6B35" />
                    </View>
                    <View>
                      <Text style={styles.streakValue}>{progress.streak}</Text>
                      <Text style={styles.streakLabel}>{t.dayStreak}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.streakStats}>
                    <View style={styles.streakStatItem}>
                      <Text style={styles.streakStatValue}>{progress.sessionsThisWeek || 0}</Text>
                      <Text style={styles.streakStatLabel}>{t.sessions}</Text>
                    </View>
                    <View style={styles.streakStatDivider} />
                    <View style={styles.streakStatItem}>
                      <Text style={styles.streakStatValue}>{progress.appOpenMinutesThisWeek || 0}m</Text>
                      <Text style={styles.streakStatLabel}>{t.thisWeek}</Text>
                    </View>
                  </View>
                </View>
                
                <View style={styles.weekDays}>
                  {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => (
                    <View key={index} style={styles.weekDayItem}>
                      <View style={[
                        styles.weekDayCircle,
                        index < progress.streak && styles.weekDayCompleted
                      ]}>
                        {index < progress.streak && <Zap size={10} color="#000000" />}
                      </View>
                      <Text style={styles.weekDayText}>{day}</Text>
                    </View>
                  ))}
                </View>
              </LinearGradient>
            </View>
          </Animated.View>

          {dailyWorkout && (
            <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
              <TouchableOpacity 
                style={styles.dailyGoalCard}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/(tabs)/drills'); }}
                activeOpacity={0.8}
              >
                <View style={styles.dailyGoalHeader}>
                  <View style={styles.dailyGoalBadge}>
                    <Target size={14} color={colors.primary} />
                    <Text style={styles.dailyGoalBadgeText}>{t.todaysFocus}</Text>
                  </View>
                  <View style={styles.xpBadge}>
                    <Zap size={12} color="#000" />
                    <Text style={styles.xpBadgeText}>+{dailyWorkout.xpReward} XP</Text>
                  </View>
                </View>
                <View style={styles.dailyGoalContent}>
                  <Text style={styles.dailyGoalEmoji}>
                    {SKILL_MASTERY_PATHS.find(p => p.id === dailyWorkout.focusArea)?.icon || '⚽'}
                  </Text>
                  <View style={styles.dailyGoalText}>
                    <Text style={styles.dailyGoalTitle}>{dailyWorkout.title}</Text>
                    <Text style={styles.dailyGoalSubtitle}>
                      {dailyWorkout.drillIds.length} {t.drillsWord} • {dailyWorkout.duration} {t.min}
                    </Text>
                  </View>
                </View>
                <View style={styles.startWorkoutBtnSmall}>
                  <Play size={16} color="#000" fill="#000" />
                  <Text style={styles.startWorkoutBtnText}>{t.startWorkout}</Text>
                </View>
              </TouchableOpacity>
            </Animated.View>
          )}

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t.quickStart}</Text>
            </View>
            
            <View style={styles.quickActions}>
              <TouchableOpacity 
                style={styles.quickActionMain}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/(tabs)/drills'); }}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[colors.primary, '#00A844']}
                  style={styles.quickActionMainGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.quickActionMainIcon}>
                    <Play size={24} color="#000000" fill="#000000" />
                  </View>
                  <Text style={styles.quickActionMainTitle}>{t.startTraining}</Text>
                  <Text style={styles.quickActionMainSubtitle}>{t.beginSession}</Text>
                </LinearGradient>
              </TouchableOpacity>

              <View style={styles.quickActionsSecondary}>
                <TouchableOpacity 
                  style={styles.quickAction}
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/(tabs)/coach'); }}
                  activeOpacity={0.8}
                >
                  <View style={[styles.quickActionIcon, { backgroundColor: '#6B4EFF20' }]}>
                    <MessageCircle size={20} color="#6B4EFF" />
                  </View>
                  <Text style={styles.quickActionTitle}>{t.aiCoach}</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.quickAction}
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/(tabs)/video'); }}
                  activeOpacity={0.8}
                >
                  <View style={[styles.quickActionIcon, { backgroundColor: '#FF6B3520' }]}>
                    <Video size={20} color="#FF6B35" />
                  </View>
                  <Text style={styles.quickActionTitle}>{t.analyze}</Text>
                  {!isPro && (
                    <View style={styles.proMiniTag}>
                      <Lock size={8} color="#000000" />
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t.yourSkills}</Text>
              <TouchableOpacity onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/(tabs)/drills'); }}>
                <Text style={styles.seeAllText}>{t.seeAll}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.skillsList}>
              {topSkills.map((skill) => {
                const path = SKILL_MASTERY_PATHS.find(p => p.id === skill.id);
                if (!path) return null;
                return (
                  <TouchableOpacity
                    key={skill.id}
                    style={styles.skillCard}
                    onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/(tabs)/drills'); }}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.skillIconSmall, { backgroundColor: path.color }]}>
                      <Text style={styles.skillIconTextSmall}>{path.icon}</Text>
                    </View>
                    <View style={styles.skillContent}>
                      <View style={styles.skillTitleRow}>
                        <Text style={styles.skillTitle}>{path.title}</Text>
                        <Text style={styles.skillLevelText}>{t.lvl} {skill.currentLevel}</Text>
                      </View>
                      <View style={styles.skillProgressBar}>
                        <View style={[styles.skillProgressFill, { width: `${skill.progress}%`, backgroundColor: path.color }]} />
                      </View>
                      <Text style={styles.skillProgressText}>
                        {skill.drillsCompleted}/{skill.totalDrills} {t.drillsCompleted}
                      </Text>
                    </View>
                    <ChevronRight size={18} color={colors.textMuted} />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {!isPro && (
            <TouchableOpacity 
              style={styles.proCard}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/paywall'); }}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#FFD700', '#FF8C00']}
                style={styles.proCardGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <View style={styles.proCardIcon}>
                  <Trophy size={24} color="#000000" />
                </View>
                <View style={styles.proCardContent}>
                  <Text style={styles.proCardTitle}>{t.unlockPotential}</Text>
                  <Text style={styles.proCardSubtitle}>
                    {t.aiVideoAnalysis}
                  </Text>
                </View>
                <ChevronRight size={20} color="#000000" />
              </LinearGradient>
            </TouchableOpacity>
          )}

          <View style={styles.aiTipCard}>
            <View style={styles.aiTipHeader}>
              <Sparkles size={16} color={colors.primary} />
              <Text style={styles.aiTipLabel}>{t.aiTip}</Text>
            </View>
            <Text style={styles.aiTipText}>
              {profile?.position === 'ST' 
                ? "As a striker, focus on your first touch today. It creates space for the shot."
                : profile?.position === 'GK'
                ? "Work on your positioning. A well-positioned keeper makes every save look easy."
                : "Consistency is key. Even 15 minutes of focused practice daily builds elite skills."}
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  header: {
    marginTop: 8,
    marginBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  greeting: {
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  name: {
    fontSize: 26,
    fontWeight: '800' as const,
    color: colors.text,
  },
  proBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  proText: {
    fontSize: 12,
    fontWeight: '800' as const,
    color: '#000000',
  },
  upgradeButton: {
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  upgradeText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: colors.primary,
  },
  positionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  positionEmoji: {
    fontSize: 16,
  },
  positionText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.text,
  },
  positionDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.textMuted,
  },
  skillText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  streakCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
  },
  streakGradient: {
    padding: 20,
  },
  streakContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  streakMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  streakIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255, 107, 53, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakValue: {
    fontSize: 32,
    fontWeight: '800' as const,
    color: '#FFFFFF',
  },
  streakLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  streakStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  streakStatItem: {
    alignItems: 'center',
  },
  streakStatValue: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  streakStatLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
  },
  streakStatDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  weekDays: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  weekDayItem: {
    alignItems: 'center',
    gap: 6,
  },
  weekDayCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekDayCompleted: {
    backgroundColor: colors.primary,
  },
  weekDayText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '500' as const,
  },
  dailyGoalCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 18,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dailyGoalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  dailyGoalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: `${colors.primary}15`,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  dailyGoalBadgeText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: colors.primary,
  },
  dailyGoalContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
  },
  dailyGoalEmoji: {
    fontSize: 40,
  },
  dailyGoalText: {
    flex: 1,
  },
  dailyGoalTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 4,
  },
  dailyGoalSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },

  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.text,
  },
  seeAllText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500' as const,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionMain: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
  },
  quickActionMainGradient: {
    padding: 20,
    minHeight: 140,
    justifyContent: 'space-between',
    borderRadius: 20,
  },
  quickActionMainIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionMainTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#000000',
  },
  quickActionMainSubtitle: {
    fontSize: 13,
    color: '#000000',
    opacity: 0.7,
  },
  quickActionsSecondary: {
    width: 100,
    gap: 12,
  },
  quickAction: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    position: 'relative',
  },
  quickActionIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionTitle: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: colors.text,
  },
  proMiniTag: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  xpBadgeText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: '#000',
  },
  startWorkoutBtnSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    gap: 8,
    marginTop: 4,
  },
  startWorkoutBtnText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#000',
  },
  skillsList: {
    gap: 10,
  },
  skillCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    gap: 12,
  },
  skillIconSmall: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skillIconTextSmall: {
    fontSize: 20,
  },
  skillContent: {
    flex: 1,
  },
  skillTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  skillTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: colors.text,
  },
  skillLevelText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: colors.primary,
  },
  skillProgressBar: {
    height: 4,
    backgroundColor: colors.surfaceLight,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 4,
  },
  skillProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  skillProgressText: {
    fontSize: 11,
    color: colors.textMuted,
  },
  proCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
  },
  proCardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    gap: 14,
  },
  proCardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  proCardContent: {
    flex: 1,
  },
  proCardTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#000000',
    marginBottom: 2,
  },
  proCardSubtitle: {
    fontSize: 12,
    color: '#000000',
    opacity: 0.75,
  },
  aiTipCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  aiTipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  aiTipLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: colors.primary,
  },
  aiTipText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});

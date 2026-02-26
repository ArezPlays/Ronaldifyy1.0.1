import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Dimensions,
  Modal,
  Animated,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Clock, 
  Flame, 
  Lock, 
  Play, 
  CheckCircle,
  Trophy,
  Zap,
  ChevronRight,
  Star,
  Award,
  X,
  Sparkles,
} from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTraining } from '@/contexts/TrainingContext';
import { SKILL_MASTERY_PATHS, getDrillById, SkillMasteryPath, SkillMasteryLevel } from '@/mocks/training';
import { TrainingGoal } from '@/types/user';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function DrillsScreen() {
  const router = useRouter();
  const { openSkill } = useLocalSearchParams<{ openSkill?: string }>();
  const { isPro } = useSubscription();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { 
    progress, 
    dailyWorkout, 
    isDrillCompleted, 
    levelProgress,
    xpToNextLevel,
    getAllSkillsProgress,
    isSkillLevelUnlocked,
    isLevelProLocked,
  } = useTraining();
  
  const [selectedSkill, setSelectedSkill] = useState<TrainingGoal | null>(null);
  const hasOpenedSkillRef = useRef(false);
  const [selectedLevel, setSelectedLevel] = useState<SkillMasteryLevel | null>(null);
  const [showCongrats, setShowCongrats] = useState(false);
  const [completedLevelInfo, setCompletedLevelInfo] = useState<{ skillName: string; levelName: string; xpReward: number } | null>(null);
  const congratsAnim = useRef(new Animated.Value(0)).current;
  const skillModalAnim = useRef(new Animated.Value(0)).current;
  const levelModalAnim = useRef(new Animated.Value(0)).current;
  const previousCompletedRef = useRef<Set<string>>(new Set());

  const selectedSkillPath = useMemo(() => {
    if (!selectedSkill) return null;
    return SKILL_MASTERY_PATHS.find(p => p.id === selectedSkill);
  }, [selectedSkill]);

  useEffect(() => {
    if (openSkill && !hasOpenedSkillRef.current) {
      const validSkills: TrainingGoal[] = ['dribbling', 'shooting', 'passing', 'speed', 'defense', 'fitness'];
      if (validSkills.includes(openSkill as TrainingGoal)) {
        setSelectedSkill(openSkill as TrainingGoal);
        hasOpenedSkillRef.current = true;
      }
    }
  }, [openSkill]);

  useEffect(() => {
    const currentCompleted = new Set(progress.completedDrills);
    
    SKILL_MASTERY_PATHS.forEach(path => {
      path.levels.forEach(level => {
        const allDrillsCompleted = level.drillIds.every(id => currentCompleted.has(id));
        const wasCompleted = level.drillIds.every(id => previousCompletedRef.current.has(id));
        
        if (allDrillsCompleted && !wasCompleted && previousCompletedRef.current.size > 0) {
          setCompletedLevelInfo({
            skillName: path.title,
            levelName: level.title,
            xpReward: level.unlockReward,
          });
          setShowCongrats(true);
          
          if (Platform.OS !== 'web') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
          
          Animated.sequence([
            Animated.timing(congratsAnim, {
              toValue: 1,
              duration: 400,
              useNativeDriver: Platform.OS !== 'web',
            }),
          ]).start();
        }
      });
    });
    
    previousCompletedRef.current = currentCompleted;
  }, [progress.completedDrills, congratsAnim]);

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return t.easy;
      case 'medium': return t.medium;
      case 'hard': return t.hard;
      case 'elite': return t.elite;
      default: return difficulty;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return colors.success;
      case 'medium': return colors.warning;
      case 'hard': return colors.error;
      case 'elite': return '#9B59B6';
      default: return colors.textMuted;
    }
  };

  const handleStartDrill = useCallback((drillId: string, isLocked: boolean) => {
    if (isLocked) {
      router.push('/paywall');
      return;
    }
    router.push({ pathname: '/drill-session', params: { drillId } });
    setTimeout(() => {
      levelModalAnim.setValue(0);
      skillModalAnim.setValue(0);
      setSelectedLevel(null);
      setSelectedSkill(null);
    }, 100);
  }, [router]);

  const handleStartWorkout = useCallback(() => {
    if (dailyWorkout && dailyWorkout.drillIds.length > 0) {
      const firstDrillId = dailyWorkout.drillIds[0];
      const drill = getDrillById(firstDrillId);
      const isLocked = drill?.isPro && !isPro;
      handleStartDrill(firstDrillId, isLocked || false);
    }
  }, [dailyWorkout, isPro, handleStartDrill]);

  const openSkillPath = useCallback((skillId: TrainingGoal) => {
    setSelectedSkill(skillId);
    Animated.timing(skillModalAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  }, [skillModalAnim]);

  const closeSkillModal = useCallback(() => {
    Animated.timing(skillModalAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: Platform.OS !== 'web',
    }).start(() => {
      setSelectedSkill(null);
    });
  }, [skillModalAnim]);

  const openLevel = useCallback((level: SkillMasteryLevel) => {
    setSelectedLevel(level);
    Animated.timing(levelModalAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  }, [levelModalAnim]);

  const closeLevel = useCallback(() => {
    Animated.timing(levelModalAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: Platform.OS !== 'web',
    }).start(() => {
      setSelectedLevel(null);
    });
  }, [levelModalAnim]);

  const getLevelCompletionStatus = useCallback((path: SkillMasteryPath, level: SkillMasteryLevel) => {
    const completedCount = level.drillIds.filter((id: string) => isDrillCompleted(id)).length;
    const isComplete = completedCount === level.drillIds.length;
    const isUnlocked = isSkillLevelUnlocked(path.id, level.level);
    const requiresPro = isLevelProLocked(level.level);
    const isProLocked = requiresPro && !isPro;
    return { completedCount, isComplete, isUnlocked, requiresPro, isProLocked };
  }, [isDrillCompleted, isSkillLevelUnlocked, isLevelProLocked, isPro]);

  const styles = createStyles(colors);

  const renderSkillCard = (skillProgress: any) => {
    const path = SKILL_MASTERY_PATHS.find(p => p.id === skillProgress.id);
    if (!path) return null;

    return (
      <TouchableOpacity
        key={path.id}
        style={styles.skillCard}
        onPress={() => openSkillPath(path.id)}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[`${path.color}25`, `${path.color}10`]}
          style={styles.skillCardGradient}
        >
          <View style={styles.skillCardHeader}>
            <View style={[styles.skillIcon, { backgroundColor: path.color }]}>
              <Text style={styles.skillIconText}>{path.icon}</Text>
            </View>
            <View style={styles.skillLevelBadge}>
              <Text style={styles.skillLevelText}>{t.lvl} {skillProgress.currentLevel}</Text>
            </View>
          </View>
          
          <Text style={styles.skillTitle}>{path.title}</Text>
          <Text style={styles.skillSubtitle}>{path.description}</Text>
          
          <View style={styles.skillProgressContainer}>
            <View style={styles.skillProgressBar}>
              <View 
                style={[
                  styles.skillProgressFill, 
                  { width: `${skillProgress.progress}%`, backgroundColor: path.color }
                ]} 
              />
            </View>
            <Text style={styles.skillProgressText}>
              {skillProgress.drillsCompleted}/{skillProgress.totalDrills} {t.drillsWord}
            </Text>
          </View>

          <View style={styles.skillCardFooter}>
            <Text style={styles.skillLevelsText}>{path.totalLevels} {t.levels}</Text>
            <ChevronRight size={18} color={colors.textMuted} />
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const renderLevelItem = (path: SkillMasteryPath, level: SkillMasteryLevel) => {
    const { completedCount, isComplete, isUnlocked, requiresPro, isProLocked } = getLevelCompletionStatus(path, level);
    const canAccess = isUnlocked && !isProLocked;
    
    return (
      <TouchableOpacity
        key={level.level}
        style={[
          styles.levelCard,
          (!isUnlocked || isProLocked) && styles.levelCardLocked,
          isComplete && styles.levelCardComplete,
        ]}
        onPress={() => {
          if (isProLocked) {
            router.push('/paywall');
          } else if (isUnlocked) {
            closeSkillModal();
            setTimeout(() => openLevel(level), 280);
          }
        }}
        activeOpacity={canAccess ? 0.7 : 0.8}
      >
        <View style={[
          styles.levelNumber,
          isComplete && { backgroundColor: path.color },
          (!isUnlocked || isProLocked) && styles.levelNumberLocked,
        ]}>
          {isComplete ? (
            <CheckCircle size={20} color="#FFFFFF" />
          ) : isProLocked ? (
            <Lock size={16} color="#FFD700" />
          ) : !isUnlocked ? (
            <Lock size={16} color={colors.textMuted} />
          ) : (
            <Text style={styles.levelNumberText}>{level.level}</Text>
          )}
        </View>

        <View style={styles.levelInfo}>
          <View style={styles.levelTitleRow}>
            <Text style={[
              styles.levelTitle,
              (!isUnlocked || isProLocked) && styles.levelTitleLocked,
            ]} numberOfLines={1}>{level.title}</Text>
            {requiresPro && (
              <View style={styles.proLevelBadge}>
                <Lock size={10} color="#000" />
                <Text style={styles.proLevelBadgeText}>PRO</Text>
              </View>
            )}
          </View>
          <Text style={styles.levelDescription}>{level.description}</Text>
          
          <View style={styles.levelMeta}>
            <View style={styles.levelMetaItem}>
              <Play size={12} color={colors.textMuted} />
              <Text style={styles.levelMetaText}>{level.drillIds.length} {t.drillsWord}</Text>
            </View>
            {canAccess && !isComplete && (
              <View style={styles.levelMetaItem}>
                <CheckCircle size={12} color={colors.primary} />
                <Text style={[styles.levelMetaText, { color: colors.primary }]}>
                  {completedCount}/{level.drillIds.length}
                </Text>
              </View>
            )}
            {isComplete && (
              <View style={styles.levelRewardBadge}>
                <Zap size={10} color="#000" />
                <Text style={styles.levelRewardText}>+{level.unlockReward} XP</Text>
              </View>
            )}
          </View>
        </View>

        {canAccess ? (
          <ChevronRight size={20} color={isComplete ? path.color : colors.textMuted} />
        ) : isProLocked ? (
          <View style={styles.unlockProBtn}>
            <Text style={styles.unlockProBtnText}>{t.unlock}</Text>
          </View>
        ) : null}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientMiddle, colors.gradientEnd]}
        style={StyleSheet.absoluteFill}
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Player Progress Card */}
        <View style={styles.progressCard}>
          <LinearGradient
            colors={['#1A1A2E', '#16213E']}
            style={styles.progressGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.progressHeader}>
              <View style={styles.levelBadge}>
                <Award size={18} color={colors.accent} />
                <Text style={styles.levelText}>Level {progress.level}</Text>
              </View>
              <View style={styles.streakBadge}>
                <Flame size={14} color="#FF6B35" />
                <Text style={styles.streakText}>{progress.streak} {t.dayStreak}</Text>
              </View>
            </View>
            
            <View style={styles.xpSection}>
              <View style={styles.xpHeader}>
                <Text style={styles.xpLabel}>{t.xpProgress}</Text>
                <Text style={styles.xpValue}>{xpToNextLevel} {t.xpToLevel} {progress.level + 1}</Text>
              </View>
              <View style={styles.xpBar}>
                <View style={[styles.xpFill, { width: `${levelProgress}%` }]} />
              </View>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Zap size={16} color={colors.primary} />
                <Text style={styles.statValue}>{progress.xp}</Text>
                <Text style={styles.statLabel}>{t.totalXp}</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <CheckCircle size={16} color={colors.success} />
                <Text style={styles.statValue}>{progress.completedDrills.length}</Text>
                <Text style={styles.statLabel}>{t.drillsDone}</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Clock size={16} color={colors.warning} />
                <Text style={styles.statValue}>{progress.totalTrainingMinutes}m</Text>
                <Text style={styles.statLabel}>{t.training}</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Skill Mastery Paths */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t.skillMastery}</Text>
            <Text style={styles.sectionSubtitle}>{t.progressThroughLevels}</Text>
          </View>

          <View style={styles.skillsGrid}>
            {getAllSkillsProgress.map(renderSkillCard)}
          </View>
        </View>

        {/* Random Workout */}
        {dailyWorkout && (
          <View style={styles.randomWorkout}>
            <LinearGradient
              colors={['#2D3436', '#1E272E']}
              style={styles.workoutGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.workoutHeader}>
                <View style={styles.randomWorkoutBadge}>
                  <Sparkles size={14} color={colors.primary} />
                  <Text style={styles.randomWorkoutBadgeText}>{t.randomWorkout}</Text>
                </View>
                <View style={styles.xpRewardBadge}>
                  <Zap size={12} color="#000000" />
                  <Text style={styles.xpRewardText}>+{dailyWorkout.xpReward} XP</Text>
                </View>
              </View>
              
              <Text style={styles.randomWorkoutTitle}>{dailyWorkout.title}</Text>
              <Text style={styles.randomWorkoutDesc}>
                {dailyWorkout.drillIds.length} {t.drillsWord} • {dailyWorkout.duration} {t.min} • {t.mixedSkills}
              </Text>

              <TouchableOpacity 
                style={styles.startRandomWorkoutBtn}
                onPress={handleStartWorkout}
                activeOpacity={0.8}
              >
                <Play size={18} color="#FFFFFF" fill="#FFFFFF" />
                <Text style={styles.startRandomWorkoutText}>{t.startRandomWorkout}</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        )}

        {/* Congrats Modal */}
      <Modal
        visible={showCongrats}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowCongrats(false)}
      >
        <View style={styles.congratsOverlay}>
          <Animated.View 
            style={[
              styles.congratsCard,
              {
                transform: [{
                  scale: congratsAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1],
                  })
                }],
                opacity: congratsAnim,
              }
            ]}
          >
            <LinearGradient
              colors={[colors.primary, '#00A844']}
              style={styles.congratsGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.congratsIconContainer}>
                <Trophy size={48} color="#000000" />
              </View>
              <Text style={styles.congratsTitle}>{t.levelComplete} 🎉</Text>
              <Text style={styles.congratsSubtitle}>
                {completedLevelInfo?.skillName}
              </Text>
              <Text style={styles.congratsLevel}>
                {completedLevelInfo?.levelName}
              </Text>
              <View style={styles.congratsXpBadge}>
                <Zap size={16} color="#000000" />
                <Text style={styles.congratsXpText}>+{completedLevelInfo?.xpReward} {t.xpEarned}</Text>
              </View>
              <TouchableOpacity
                style={styles.congratsButton}
                onPress={() => {
                  setShowCongrats(false);
                  congratsAnim.setValue(0);
                }}
              >
                <Text style={styles.congratsButtonText}>{t.continueTraining}</Text>
              </TouchableOpacity>
            </LinearGradient>
          </Animated.View>
        </View>
      </Modal>

        {/* Pro Upsell */}
        {!isPro && (
          <TouchableOpacity 
            style={styles.proPrompt}
            onPress={() => router.push('/paywall')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#FFD700', '#FF8C00']}
              style={styles.proPromptGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <View style={styles.proPromptContent}>
                <Trophy size={24} color="#000000" />
                <View style={styles.proPromptText}>
                  <Text style={styles.proPromptTitle}>{t.unlockAllProDrills}</Text>
                  <Text style={styles.proPromptSubtitle}>{t.eliteSkillsAdvanced}</Text>
                </View>
              </View>
              <ChevronRight size={24} color="#000000" />
            </LinearGradient>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Skill Path Modal */}
      <Modal
        visible={selectedSkill !== null && selectedLevel === null}
        animationType="none"
        transparent={true}
        onRequestClose={closeSkillModal}
      >
        {selectedSkillPath && (
          <View style={styles.modalOverlay}>
            <Animated.View style={[styles.modalContainer, { backgroundColor: colors.background, opacity: skillModalAnim, transform: [{ translateY: skillModalAnim.interpolate({ inputRange: [0, 1], outputRange: [600, 0] }) }] }]}>
            <LinearGradient
              colors={[`${selectedSkillPath.color}30`, colors.background]}
              style={styles.modalHeader}
            >
              <TouchableOpacity 
                style={styles.modalClose}
                onPress={closeSkillModal}
              >
                <X size={24} color={colors.text} />
              </TouchableOpacity>
              
              <View style={[styles.modalIcon, { backgroundColor: selectedSkillPath.color }]}>
                <Text style={styles.modalIconText}>{selectedSkillPath.icon}</Text>
              </View>
              
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {selectedSkillPath.title}
              </Text>
              <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
                {selectedSkillPath.description}
              </Text>

              <View style={styles.modalProgressContainer}>
                <View style={styles.modalProgressBar}>
                  <View 
                    style={[
                      styles.modalProgressFill, 
                      { 
                        width: `${getAllSkillsProgress.find(s => s.id === selectedSkill)?.progress || 0}%`,
                        backgroundColor: selectedSkillPath.color 
                      }
                    ]} 
                  />
                </View>
                <Text style={[styles.modalProgressText, { color: colors.textMuted }]}>
                  {getAllSkillsProgress.find(s => s.id === selectedSkill)?.drillsCompleted || 0}/
                  {getAllSkillsProgress.find(s => s.id === selectedSkill)?.totalDrills || 0} drills completed
                </Text>
              </View>
            </LinearGradient>

            <ScrollView 
              style={styles.levelsScroll}
              contentContainerStyle={styles.levelsContent}
            >
              <Text style={[styles.levelsTitle, { color: colors.text }]}>
                {t.yourJourney}
              </Text>
              
              {selectedSkillPath.levels.map(level => renderLevelItem(selectedSkillPath, level))}
            </ScrollView>
          </Animated.View>
          </View>
        )}
      </Modal>

      {/* Level Drills Modal */}
      <Modal
        visible={selectedLevel !== null}
        animationType="none"
        transparent={true}
        onRequestClose={closeLevel}
      >
        {selectedLevel && selectedSkillPath && (
          <View style={styles.modalOverlay}>
            <Animated.View style={[styles.modalContainer, { backgroundColor: colors.background, opacity: levelModalAnim, transform: [{ translateY: levelModalAnim.interpolate({ inputRange: [0, 1], outputRange: [600, 0] }) }] }]}>
            <LinearGradient
              colors={[`${selectedSkillPath.color}30`, colors.background]}
              style={styles.modalHeader}
            >
              <TouchableOpacity 
                style={styles.modalClose}
                onPress={closeLevel}
              >
                <X size={24} color={colors.text} />
              </TouchableOpacity>
              
              <View style={[styles.levelBadgeLarge, { backgroundColor: selectedSkillPath.color }]}>
                <Text style={styles.levelBadgeLargeText}>{selectedLevel.level}</Text>
              </View>
              
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {selectedLevel.title}
              </Text>
              <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
                {selectedLevel.description}
              </Text>

              <View style={styles.levelRewardCard}>
                <Star size={16} color={colors.accent} />
                <Text style={[styles.levelRewardCardText, { color: colors.text }]}>
                  {t.completeAllDrillsEarn} +{selectedLevel.unlockReward} XP
                </Text>
              </View>
            </LinearGradient>

            <ScrollView 
              style={styles.levelsScroll}
              contentContainerStyle={styles.levelsContent}
            >
              <Text style={[styles.levelsTitle, { color: colors.text }]}>
                {t.drillsInThisLevel}
              </Text>
              
              {selectedLevel.drillIds.map((drillId: string) => {
                const drill = getDrillById(drillId);
                if (!drill) return null;
                
                const isCompleted = isDrillCompleted(drillId);
                const isLocked = drill.isPro && !isPro;

                return (
                  <TouchableOpacity
                    key={drillId}
                    style={[
                      styles.drillCard,
                      isCompleted && styles.drillCardCompleted,
                      isLocked && styles.drillCardLocked,
                    ]}
                    onPress={() => handleStartDrill(drillId, isLocked)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.drillContent}>
                      <View style={styles.drillHeader}>
                        <Text style={[styles.drillTitle, { color: colors.text }]} numberOfLines={1}>
                          {drill.title}
                        </Text>
                        {isCompleted && (
                          <View style={styles.completedBadge}>
                            <CheckCircle size={14} color={colors.primary} />
                          </View>
                        )}
                        {drill.isPro && !isCompleted && (
                          <View style={styles.proBadge}>
                            {isLocked && <Lock size={10} color="#000" />}
                            <Text style={styles.proBadgeText}>PRO</Text>
                          </View>
                        )}
                      </View>
                      
                      <Text style={[styles.drillDescription, { color: colors.textSecondary }]} numberOfLines={2}>
                        {drill.description}
                      </Text>
                      
                      <View style={styles.drillMeta}>
                        <View style={styles.drillMetaItem}>
                          <Clock size={12} color={colors.textMuted} />
                          <Text style={[styles.drillMetaText, { color: colors.textMuted }]}>
                            {drill.duration}m
                          </Text>
                        </View>
                        <View style={styles.drillMetaItem}>
                          <Flame size={12} color={getDifficultyColor(drill.difficulty)} />
                          <Text style={[styles.drillMetaText, { color: getDifficultyColor(drill.difficulty) }]}>
                            {getDifficultyLabel(drill.difficulty)}
                          </Text>
                        </View>
                        <View style={styles.drillMetaItem}>
                          <Zap size={12} color={colors.accent} />
                          <Text style={[styles.drillMetaText, { color: colors.accent }]}>
                            +{drill.xpReward} XP
                          </Text>
                        </View>
                      </View>
                    </View>
                    
                    <View style={[
                      styles.drillPlayButton,
                      isCompleted && styles.drillPlayButtonCompleted,
                      isLocked && styles.drillPlayButtonLocked,
                    ]}>
                      {isCompleted ? (
                        <CheckCircle size={18} color={colors.primary} />
                      ) : isLocked ? (
                        <Lock size={18} color={colors.textMuted} />
                      ) : (
                        <Play size={18} color={colors.primary} fill={colors.primary} />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </Animated.View>
          </View>
        )}
      </Modal>
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  progressCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressGradient: {
    padding: 18,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: `${colors.accent}20`,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  levelText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: colors.accent,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,107,53,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  streakText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#FF6B35',
  },
  xpSection: {
    marginBottom: 16,
  },
  xpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  xpLabel: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '500' as const,
  },
  xpValue: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600' as const,
  },
  xpBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  xpFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 11,
    color: colors.textMuted,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  randomWorkout: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 24,
    marginTop: 8,
  },
  workoutGradient: {
    padding: 18,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  randomWorkoutBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  randomWorkoutBadgeText: {
    fontSize: 11,
    fontWeight: '800' as const,
    color: colors.primary,
    letterSpacing: 0.5,
  },
  xpRewardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.accent,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  xpRewardText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: '#000000',
  },
  randomWorkoutTitle: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  randomWorkoutDesc: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 16,
  },
  startRandomWorkoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
  },
  startRandomWorkoutText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: colors.text,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: colors.textMuted,
  },
  skillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  skillCard: {
    width: (SCREEN_WIDTH - 44) / 2,
    borderRadius: 18,
    overflow: 'hidden',
  },
  skillCardGradient: {
    padding: 16,
    minHeight: 180,
  },
  skillCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  skillIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skillIconText: {
    fontSize: 22,
  },
  skillLevelBadge: {
    backgroundColor: 'rgba(0,0,0,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  skillLevelText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: colors.text,
  },
  skillTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 4,
  },
  skillSubtitle: {
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: 12,
  },
  skillProgressContainer: {
    marginBottom: 12,
  },
  skillProgressBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 4,
  },
  skillProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  skillProgressText: {
    fontSize: 10,
    color: colors.textMuted,
  },
  skillCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skillLevelsText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  proPrompt: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 8,
  },
  proPromptGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  proPromptContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  proPromptText: {
    gap: 2,
  },
  proPromptTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#000000',
  },
  proPromptSubtitle: {
    fontSize: 13,
    color: 'rgba(0,0,0,0.7)',
  },
  congratsOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  congratsCard: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 24,
    overflow: 'hidden',
  },
  congratsGradient: {
    padding: 32,
    alignItems: 'center',
  },
  congratsIconContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(0,0,0,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  congratsTitle: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: '#000000',
    marginBottom: 8,
    textAlign: 'center',
  },
  congratsSubtitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: 'rgba(0,0,0,0.7)',
    marginBottom: 4,
  },
  congratsLevel: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#000000',
    marginBottom: 20,
  },
  congratsXpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
    marginBottom: 24,
  },
  congratsXpText: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: '#000000',
  },
  congratsButton: {
    backgroundColor: '#000000',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 14,
    width: '100%',
  },
  congratsButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    flex: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    maxHeight: '92%',
  },
  modalHeader: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 24,
    alignItems: 'center',
  },
  modalClose: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 1,
  },
  modalIcon: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  modalIconText: {
    fontSize: 36,
  },
  modalTitle: {
    fontSize: 26,
    fontWeight: '800' as const,
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalProgressContainer: {
    width: '100%',
    paddingHorizontal: 20,
  },
  modalProgressBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  modalProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  modalProgressText: {
    fontSize: 13,
    textAlign: 'center',
  },
  levelsScroll: {
    flex: 1,
  },
  levelsContent: {
    padding: 20,
  },
  levelsTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    marginBottom: 16,
  },
  levelCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    gap: 14,
  },
  levelCardLocked: {
    opacity: 0.6,
  },
  levelCardComplete: {
    borderWidth: 1,
    borderColor: `${colors.primary}40`,
  },
  levelNumber: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelNumberLocked: {
    backgroundColor: colors.surfaceLight,
  },
  levelNumberText: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: colors.text,
  },
  levelInfo: {
    flex: 1,
  },
  levelTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.text,
    flex: 1,
  },
  levelTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  proLevelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD700',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 3,
  },
  proLevelBadgeText: {
    fontSize: 9,
    fontWeight: '800' as const,
    color: '#000',
  },
  unlockProBtn: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  unlockProBtnText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: '#000',
  },
  levelTitleLocked: {
    color: colors.textMuted,
  },
  levelDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  levelMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  levelMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  levelMetaText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  levelRewardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  levelRewardText: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: '#000',
  },
  levelBadgeLarge: {
    width: 64,
    height: 64,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  levelBadgeLargeText: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: '#FFFFFF',
  },
  levelRewardCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
    marginTop: 8,
  },
  levelRewardCardText: {
    fontSize: 13,
    fontWeight: '500' as const,
  },
  drillCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  drillCardCompleted: {
    borderWidth: 1,
    borderColor: `${colors.primary}40`,
  },
  drillCardLocked: {
    opacity: 0.7,
  },
  drillContent: {
    flex: 1,
  },
  drillHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  drillTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    flex: 1,
  },
  drillDescription: {
    fontSize: 13,
    marginBottom: 10,
    lineHeight: 18,
  },
  drillMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  drillMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  drillMetaText: {
    fontSize: 12,
  },
  drillPlayButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: `${colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  drillPlayButtonCompleted: {
    backgroundColor: `${colors.primary}20`,
  },
  drillPlayButtonLocked: {
    backgroundColor: colors.surfaceLight,
  },
  completedBadge: {
    backgroundColor: `${colors.primary}20`,
    padding: 4,
    borderRadius: 8,
  },
  proBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  proBadgeText: {
    fontSize: 10,
    fontWeight: '800' as const,
    color: '#000',
  },
});

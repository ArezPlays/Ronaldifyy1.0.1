import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { generateDailyWorkout, DailyWorkout, DRILLS, TRAINING_PROGRAMS, SKILL_MASTERY_PATHS, getCurrentSkillLevel, isLevelUnlocked } from '@/mocks/training';
import { TrainingGoal } from '@/types/user';
import { useUser } from './UserContext';

const TRAINING_STORAGE_KEY = '@ronaldify_training';

export interface TrainingProgress {
  xp: number;
  level: number;
  streak: number;
  lastTrainingDate: string | null;
  completedDrills: string[];
  completedWorkouts: string[];
  enrolledPrograms: string[];
  programProgress: Record<string, number>;
  totalTrainingMinutes: number;
  drillsCompletedToday: number;
  weeklyGoal: number;
  weeklyProgress: number;
  weekStartDate: string | null;
  weeklyMinutes: number;
  sessionsThisWeek: number;
  sessionDates: string[];
  appOpenMinutesThisWeek: number; // Track actual minutes app is open
}

const DEFAULT_PROGRESS: TrainingProgress = {
  xp: 0,
  level: 1,
  streak: 0,
  lastTrainingDate: null,
  completedDrills: [],
  completedWorkouts: [],
  enrolledPrograms: [],
  programProgress: {},
  totalTrainingMinutes: 0,
  drillsCompletedToday: 0,
  weeklyGoal: 5,
  weeklyProgress: 0,
  weekStartDate: null,
  weeklyMinutes: 0,
  sessionsThisWeek: 0,
  sessionDates: [],
  appOpenMinutesThisWeek: 0,
};

const getWeekStartDate = (): string => {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  return monday.toISOString().split('T')[0];
};

const XP_PER_LEVEL = 500;

export const [TrainingProvider, useTraining] = createContextHook(() => {
  const { profile } = useUser();
  const [progress, setProgress] = useState<TrainingProgress>(DEFAULT_PROGRESS);
  const [isLoading, setIsLoading] = useState(true);
  const [dailyWorkout, setDailyWorkout] = useState<DailyWorkout | null>(null);

  useEffect(() => {
    loadProgress();
  }, []);

  // Timer to track app open minutes
  useEffect(() => {
    if (isLoading) return;
    
    const interval = setInterval(() => {
      setProgress(prev => {
        const currentWeekStart = getWeekStartDate();
        const isNewWeek = prev.weekStartDate !== currentWeekStart;
        
        const newProgress = {
          ...prev,
          appOpenMinutesThisWeek: isNewWeek ? 1 : prev.appOpenMinutesThisWeek + 1,
          weekStartDate: currentWeekStart,
        };
        
        // Save in background
        AsyncStorage.setItem(TRAINING_STORAGE_KEY, JSON.stringify(newProgress)).catch(err => 
          console.log('Error saving app open time:', err)
        );
        
        return newProgress;
      });
    }, 60000); // Every minute
    
    return () => clearInterval(interval);
  }, [isLoading]);

  useEffect(() => {
    if (!isLoading && profile) {
      const workout = generateDailyWorkout(
        profile.position,
        profile.goals || [],
        profile.skillLevel,
        progress.completedDrills
      );
      setDailyWorkout(workout);
    }
  }, [isLoading, profile, progress.completedDrills]);

  const loadProgress = async () => {
    try {
      const stored = await AsyncStorage.getItem(TRAINING_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        const currentWeekStart = getWeekStartDate();
        
        // Check if streak should be reset (missed a day)
        if (parsed.lastTrainingDate && 
            parsed.lastTrainingDate !== today && 
            parsed.lastTrainingDate !== yesterday) {
          parsed.streak = 0;
        }
        
        // Reset daily counter if it's a new day
        if (parsed.lastTrainingDate !== today) {
          parsed.drillsCompletedToday = 0;
        }
        
        // Reset weekly stats if it's a new week
        if (parsed.weekStartDate !== currentWeekStart) {
          parsed.weekStartDate = currentWeekStart;
          parsed.weeklyMinutes = 0;
          parsed.sessionsThisWeek = 0;
          parsed.weeklyProgress = 0;
          parsed.sessionDates = [];
        }
        
        // Ensure sessionDates exists for older data
        if (!parsed.sessionDates) {
          parsed.sessionDates = [];
        }
        
        // Ensure appOpenMinutesThisWeek exists for older data
        if (typeof parsed.appOpenMinutesThisWeek !== 'number') {
          parsed.appOpenMinutesThisWeek = 0;
        }
        
        // Recalculate sessions this week from sessionDates
        parsed.sessionsThisWeek = parsed.sessionDates.length;
        
        setProgress(parsed);
      } else {
        // Initialize with current week start date
        const initialProgress = {
          ...DEFAULT_PROGRESS,
          weekStartDate: getWeekStartDate(),
        };
        setProgress(initialProgress);
      }
    } catch (error) {
      console.log('Error loading training progress:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveProgress = async (newProgress: TrainingProgress) => {
    try {
      await AsyncStorage.setItem(TRAINING_STORAGE_KEY, JSON.stringify(newProgress));
    } catch (error) {
      console.log('Error saving training progress:', error);
    }
  };

  const completeDrill = useCallback(async (drillId: string, duration: number) => {
    const drill = DRILLS.find(d => d.id === drillId);
    if (!drill) return;

    const today = new Date().toISOString().split('T')[0];
    const isNewDay = progress.lastTrainingDate !== today;
    
    const newXp = progress.xp + drill.xpReward;
    const newLevel = Math.floor(newXp / XP_PER_LEVEL) + 1;
    
    const currentWeekStart = getWeekStartDate();
    const isNewWeek = progress.weekStartDate !== currentWeekStart;
    
    // Get current session dates, reset if new week
    const currentSessionDates = isNewWeek ? [] : (progress.sessionDates || []);
    
    // Check if today is already counted as a session
    const isTodayAlreadyCounted = currentSessionDates.includes(today);
    
    // Add today to session dates if not already counted
    const newSessionDates = isTodayAlreadyCounted 
      ? currentSessionDates 
      : [...currentSessionDates, today];
    
    const newProgress: TrainingProgress = {
      ...progress,
      xp: newXp,
      level: newLevel,
      streak: isNewDay ? progress.streak + 1 : progress.streak,
      lastTrainingDate: today,
      completedDrills: progress.completedDrills.includes(drillId) 
        ? progress.completedDrills 
        : [...progress.completedDrills, drillId],
      totalTrainingMinutes: progress.totalTrainingMinutes + duration,
      drillsCompletedToday: isNewDay ? 1 : progress.drillsCompletedToday + 1,
      weeklyProgress: isNewWeek ? 1 : progress.weeklyProgress + 1,
      weekStartDate: currentWeekStart,
      weeklyMinutes: isNewWeek ? duration : progress.weeklyMinutes + duration,
      sessionsThisWeek: newSessionDates.length,
      sessionDates: newSessionDates,
    };

    // Update program progress
    TRAINING_PROGRAMS.forEach(program => {
      if (progress.enrolledPrograms.includes(program.id)) {
        const allDrillIds = program.phases.flatMap(p => p.drillIds);
        const completed = allDrillIds.filter(id => 
          newProgress.completedDrills.includes(id)
        ).length;
        newProgress.programProgress[program.id] = Math.round((completed / allDrillIds.length) * 100);
      }
    });

    setProgress(newProgress);
    await saveProgress(newProgress);
    
    console.log('Drill completed:', drillId, 'XP earned:', drill.xpReward);
    
    return { xpEarned: drill.xpReward, newLevel: newLevel > progress.level };
  }, [progress]);

  const completeWorkout = useCallback(async (workoutId: string, totalDuration: number, xpReward: number) => {
    const today = new Date().toISOString().split('T')[0];
    const isNewDay = progress.lastTrainingDate !== today;
    
    const newXp = progress.xp + xpReward;
    const newLevel = Math.floor(newXp / XP_PER_LEVEL) + 1;
    
    const newProgress: TrainingProgress = {
      ...progress,
      xp: newXp,
      level: newLevel,
      streak: isNewDay ? progress.streak + 1 : progress.streak,
      lastTrainingDate: today,
      completedWorkouts: [...progress.completedWorkouts, workoutId],
      totalTrainingMinutes: progress.totalTrainingMinutes + totalDuration,
      weeklyProgress: progress.weeklyProgress + 1,
    };

    setProgress(newProgress);
    await saveProgress(newProgress);
    
    return { xpEarned: xpReward, newLevel: newLevel > progress.level };
  }, [progress]);

  const enrollInProgram = useCallback(async (programId: string) => {
    if (progress.enrolledPrograms.includes(programId)) return;
    
    const newProgress: TrainingProgress = {
      ...progress,
      enrolledPrograms: [...progress.enrolledPrograms, programId],
      programProgress: { ...progress.programProgress, [programId]: 0 },
    };

    setProgress(newProgress);
    await saveProgress(newProgress);
    console.log('Enrolled in program:', programId);
  }, [progress]);

  const unenrollFromProgram = useCallback(async (programId: string) => {
    const newProgress: TrainingProgress = {
      ...progress,
      enrolledPrograms: progress.enrolledPrograms.filter(id => id !== programId),
    };

    setProgress(newProgress);
    await saveProgress(newProgress);
  }, [progress]);

  const xpToNextLevel = useMemo(() => {
    return XP_PER_LEVEL - (progress.xp % XP_PER_LEVEL);
  }, [progress.xp]);

  const levelProgress = useMemo(() => {
    return ((progress.xp % XP_PER_LEVEL) / XP_PER_LEVEL) * 100;
  }, [progress.xp]);

  const isDrillCompleted = useCallback((drillId: string) => {
    return progress.completedDrills.includes(drillId);
  }, [progress.completedDrills]);

  const getEnrolledProgramDetails = useMemo(() => {
    return progress.enrolledPrograms.map(programId => {
      const program = TRAINING_PROGRAMS.find(p => p.id === programId);
      return {
        ...program,
        progress: progress.programProgress[programId] || 0,
      };
    }).filter(Boolean);
  }, [progress.enrolledPrograms, progress.programProgress]);

  const resetWeeklyProgress = useCallback(async () => {
    const currentWeekStart = getWeekStartDate();
    const newProgress: TrainingProgress = {
      ...progress,
      weeklyProgress: 0,
      weeklyMinutes: 0,
      sessionsThisWeek: 0,
      sessionDates: [],
      weekStartDate: currentWeekStart,
    };
    setProgress(newProgress);
    await saveProgress(newProgress);
    console.log('Weekly progress reset');
  }, [progress]);

  const resetAllProgress = useCallback(async () => {
    const initialProgress = {
      ...DEFAULT_PROGRESS,
      weekStartDate: getWeekStartDate(),
    };
    setProgress(initialProgress);
    await saveProgress(initialProgress);
    console.log('All progress reset');
  }, []);

  const getSkillProgress = useCallback((skillId: TrainingGoal) => {
    return getCurrentSkillLevel(skillId, progress.completedDrills);
  }, [progress.completedDrills]);

  const isSkillLevelUnlocked = useCallback((skillId: TrainingGoal, levelNumber: number) => {
    return isLevelUnlocked(skillId, levelNumber, progress.completedDrills);
  }, [progress.completedDrills]);

  const isLevelProLocked = useCallback((levelNumber: number) => {
    // First 2 levels are free, rest require Pro
    return levelNumber > 2;
  }, []);

  const getAllSkillsProgress = useMemo(() => {
    return SKILL_MASTERY_PATHS.map(path => ({
      ...path,
      ...getCurrentSkillLevel(path.id, progress.completedDrills),
    }));
  }, [progress.completedDrills]);

  return {
    progress,
    isLoading,
    dailyWorkout,
    completeDrill,
    completeWorkout,
    enrollInProgram,
    unenrollFromProgram,
    isDrillCompleted,
    xpToNextLevel,
    levelProgress,
    getEnrolledProgramDetails,
    resetWeeklyProgress,
    resetAllProgress,
    getSkillProgress,
    isSkillLevelUnlocked,
    isLevelProLocked,
    getAllSkillsProgress,
  };
});

import { SkillLevel, TrainingGoal } from '@/types/user';

export interface SkillLevelOption {
  id: SkillLevel;
  label: string;
  description: string;
  icon: string;
}

export const SKILL_LEVELS: SkillLevelOption[] = [
  { 
    id: 'beginner', 
    label: 'Beginner', 
    description: 'Just starting out or playing casually',
    icon: '🌱'
  },
  { 
    id: 'intermediate', 
    label: 'Intermediate', 
    description: 'Regular player with solid fundamentals',
    icon: '⚽'
  },
  { 
    id: 'advanced', 
    label: 'Advanced', 
    description: 'Competitive player looking to excel',
    icon: '🏆'
  },
];

export interface TrainingGoalOption {
  id: TrainingGoal;
  label: string;
  description: string;
  icon: string;
}

export const TRAINING_GOALS: TrainingGoalOption[] = [
  { id: 'shooting', label: 'Shooting', description: 'Improve accuracy and power', icon: '🎯' },
  { id: 'dribbling', label: 'Dribbling', description: 'Master ball control and skills', icon: '⚡' },
  { id: 'passing', label: 'Passing', description: 'Better vision and accuracy', icon: '🎯' },
  { id: 'speed', label: 'Speed', description: 'Get faster on the pitch', icon: '🏃' },
  { id: 'fitness', label: 'Fitness', description: 'Build endurance and strength', icon: '💪' },
  { id: 'defense', label: 'Defense', description: 'Improve tackling and positioning', icon: '🛡️' },
];

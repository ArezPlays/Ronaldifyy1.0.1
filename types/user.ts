export type Position = 
  | 'ST' 
  | 'LW' 
  | 'RW' 
  | 'CAM' 
  | 'CM' 
  | 'CDM' 
  | 'LB' 
  | 'RB' 
  | 'CB' 
  | 'GK';

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced';

export type TrainingGoal = 
  | 'shooting' 
  | 'dribbling' 
  | 'passing' 
  | 'speed' 
  | 'fitness' 
  | 'defense';

export type SubscriptionStatus = 'free' | 'pro';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  age: number | null;
  position: Position | null;
  skillLevel: SkillLevel | null;
  goals: TrainingGoal[];
  onboardingCompleted: boolean;
  hasSeenWelcome: boolean;
  subscriptionStatus: SubscriptionStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface OnboardingData {
  position: Position | null;
  skillLevel: SkillLevel | null;
  goals: TrainingGoal[];
}

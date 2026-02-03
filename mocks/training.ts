import { Position, TrainingGoal, SkillLevel as UserSkillLevel } from '@/types/user';

export interface Drill {
  id: string;
  title: string;
  description: string;
  duration: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'elite';
  category: TrainingGoal;
  positions: Position[];
  isPro: boolean;
  equipment: string[];
  steps: string[];
  xpReward: number;
  videoTip?: string;
}

export interface TrainingProgram {
  id: string;
  title: string;
  description: string;
  category: TrainingGoal;
  difficulty: UserSkillLevel;
  weeks: number;
  totalDrills: number;
  isPro: boolean;
  icon: string;
  color: string;
  phases: ProgramPhase[];
}

export interface ProgramPhase {
  week: number;
  title: string;
  description: string;
  drillIds: string[];
}

export interface DailyWorkout {
  id: string;
  title: string;
  description: string;
  duration: number;
  drillIds: string[];
  focusArea: TrainingGoal;
  difficulty: 'easy' | 'medium' | 'hard';
  xpReward: number;
}

export interface SkillMasteryLevel {
  level: number;
  title: string;
  description: string;
  drillIds: string[];
  xpRequired: number;
  unlockReward: number;
}

export interface SkillMasteryPath {
  id: TrainingGoal;
  title: string;
  description: string;
  icon: string;
  color: string;
  levels: SkillMasteryLevel[];
  totalLevels: number;
}

// Comprehensive drill library - 60+ drills
export const DRILLS: Drill[] = [
  // SHOOTING DRILLS (12 drills)
  {
    id: 'shoot-1',
    title: 'Target Practice Basics',
    description: 'Learn to place your shots in the corners of the goal',
    duration: 10,
    difficulty: 'easy',
    category: 'shooting',
    positions: ['ST', 'LW', 'RW', 'CAM'],
    isPro: false,
    equipment: ['Ball', 'Goal', 'Targets/Cones'],
    steps: [
      'Set up targets in all 4 corners of the goal',
      'Take 5 shots from 16 yards aiming bottom left',
      'Take 5 shots aiming bottom right',
      'Take 5 shots aiming top left',
      'Take 5 shots aiming top right',
      'Record your success rate'
    ],
    xpReward: 50,
  },
  {
    id: 'shoot-2',
    title: 'First Touch Finish',
    description: 'Master receiving and shooting in one fluid motion',
    duration: 12,
    difficulty: 'medium',
    category: 'shooting',
    positions: ['ST', 'LW', 'RW', 'CAM'],
    isPro: false,
    equipment: ['Ball', 'Goal', 'Wall/Partner'],
    steps: [
      'Have partner pass the ball to you from different angles',
      'Control with first touch, shoot with second',
      'Practice receiving on left foot, shooting with right',
      'Practice receiving on right foot, shooting with left',
      'Increase pass speed progressively'
    ],
    xpReward: 75,
  },
  {
    id: 'shoot-3',
    title: 'Volley Mastery',
    description: 'Perfect your volleys from crosses and through balls',
    duration: 15,
    difficulty: 'hard',
    category: 'shooting',
    positions: ['ST', 'LW', 'RW', 'CAM'],
    isPro: false,
    equipment: ['Ball', 'Goal'],
    steps: [
      'Toss ball up and volley with laces',
      'Practice side volleys from waist height',
      'Have partner cross balls for half-volleys',
      'Work on timing your run and contact',
      'Focus on keeping the ball down'
    ],
    xpReward: 100,
  },
  {
    id: 'shoot-4',
    title: 'Power Knuckleball',
    description: 'Master the devastating knuckleball technique',
    duration: 20,
    difficulty: 'hard',
    category: 'shooting',
    positions: ['ST', 'LW', 'RW', 'CAM'],
    isPro: true,
    equipment: ['Ball', 'Goal'],
    steps: [
      'Position the ball with valve facing you',
      'Approach at 45-degree angle',
      'Lock your ankle completely',
      'Strike through the center of the ball',
      'Minimize follow-through for knuckle effect',
      'Practice from 25-30 yards'
    ],
    xpReward: 150,
    videoTip: 'Watch professional free kick tutorials for technique reference',
  },
  {
    id: 'shoot-5',
    title: 'Finesse Shot Curler',
    description: 'Bend the ball around defenders into the far corner',
    duration: 15,
    difficulty: 'medium',
    category: 'shooting',
    positions: ['ST', 'LW', 'RW', 'CAM', 'CM'],
    isPro: false,
    equipment: ['Ball', 'Goal', 'Mannequin/Cone'],
    steps: [
      'Set up a mannequin representing a defender',
      'Approach at a slight angle',
      'Strike across the ball with inside of foot',
      'Follow through across your body',
      'Aim for the far post'
    ],
    xpReward: 80,
  },
  {
    id: 'shoot-6',
    title: 'One-on-One Finishing',
    description: 'Stay composed when facing the goalkeeper alone',
    duration: 18,
    difficulty: 'medium',
    category: 'shooting',
    positions: ['ST', 'LW', 'RW'],
    isPro: true,
    equipment: ['Ball', 'Goal', 'Cones'],
    steps: [
      'Start 30 yards from goal with ball',
      'Dribble towards goal at pace',
      'Practice lifting the ball over imaginary keeper',
      'Practice side-footing into corners',
      'Work on the chip and the slot finish',
      'Add pressure by timing your runs'
    ],
    xpReward: 120,
  },
  {
    id: 'shoot-7',
    title: 'Header Accuracy',
    description: 'Score headers from crosses with precision',
    duration: 15,
    difficulty: 'medium',
    category: 'shooting',
    positions: ['ST', 'CB', 'CAM'],
    isPro: false,
    equipment: ['Ball', 'Goal'],
    steps: [
      'Practice heading stationary balls into goal',
      'Have partner toss balls for headed finishes',
      'Work on directing headers down',
      'Practice glancing headers',
      'Time your jumps with incoming crosses'
    ],
    xpReward: 75,
  },
  {
    id: 'shoot-8',
    title: 'Weak Foot Development',
    description: 'Build confidence shooting with your weaker foot',
    duration: 20,
    difficulty: 'hard',
    category: 'shooting',
    positions: ['ST', 'LW', 'RW', 'CAM', 'CM'],
    isPro: true,
    equipment: ['Ball', 'Goal'],
    steps: [
      'Start with 10 simple passes against wall with weak foot',
      'Progress to shooting from 10 yards',
      'Move back to 16 yards',
      'Practice driven shots and placed shots',
      'End with 10 pressure shots'
    ],
    xpReward: 130,
  },
  {
    id: 'shoot-9',
    title: 'Long Range Thunder',
    description: 'Strike powerful shots from outside the box',
    duration: 15,
    difficulty: 'hard',
    category: 'shooting',
    positions: ['CM', 'CAM', 'CDM'],
    isPro: true,
    equipment: ['Ball', 'Goal'],
    steps: [
      'Set ball 25 yards from goal',
      'Focus on a clean strike through the ball',
      'Keep body over the ball',
      'Drive through with your laces',
      'Practice hitting both sides of goal'
    ],
    xpReward: 110,
  },
  {
    id: 'shoot-10',
    title: 'Quick Reactions Finishing',
    description: 'Score from rebounds and deflections',
    duration: 12,
    difficulty: 'medium',
    category: 'shooting',
    positions: ['ST', 'CAM'],
    isPro: false,
    equipment: ['Ball', 'Goal', 'Wall'],
    steps: [
      'Kick ball hard against post/wall',
      'React to the rebound and finish',
      'Practice first-time finishes',
      'Work on redirecting the ball',
      'Increase shot power for harder rebounds'
    ],
    xpReward: 70,
  },
  {
    id: 'shoot-11',
    title: 'Penalty Masterclass',
    description: 'Become ice-cold from the penalty spot',
    duration: 15,
    difficulty: 'medium',
    category: 'shooting',
    positions: ['ST', 'LW', 'RW', 'CAM', 'CM', 'CDM', 'LB', 'RB', 'CB', 'GK'],
    isPro: false,
    equipment: ['Ball', 'Goal'],
    steps: [
      'Develop a consistent run-up routine',
      'Practice placing to all four corners',
      'Work on disguising your shot direction',
      'Practice under pressure (timer, crowd noise)',
      'Take 10 penalties, aim for 8/10 success'
    ],
    xpReward: 85,
  },
  {
    id: 'shoot-12',
    title: 'Elite Striker Finishing Circuit',
    description: 'Complete finishing workout like a professional striker',
    duration: 30,
    difficulty: 'elite',
    category: 'shooting',
    positions: ['ST', 'LW', 'RW'],
    isPro: true,
    equipment: ['Ball', 'Goal', 'Cones', 'Mannequins'],
    steps: [
      'Warm up with 10 easy finishes',
      'One-touch finishes from crosses (10 reps)',
      'Turn and shoot drills (10 reps)',
      'Dribble past cone, finish (10 reps)',
      'Headers from crosses (10 reps)',
      'Pressure finishing with timer (10 reps)',
      'Cool down with placement practice'
    ],
    xpReward: 200,
  },

  // Additional Shooting Drills (13-20)
  {
    id: 'shoot-13',
    title: 'Chip Shot Mastery',
    description: 'Perfect the delicate chip over advancing keepers',
    duration: 15,
    difficulty: 'hard',
    category: 'shooting',
    positions: ['ST', 'LW', 'RW', 'CAM'],
    isPro: true,
    equipment: ['Ball', 'Goal'],
    steps: [
      'Start 20 yards from goal',
      'Imagine keeper rushing out',
      'Get underneath the ball with your laces',
      'Lift with a scooping motion',
      'Practice varying the distance',
      'Add movement before the chip'
    ],
    xpReward: 125,
  },
  {
    id: 'shoot-14',
    title: 'Driven Low Shot',
    description: 'Keep shots low and powerful into corners',
    duration: 12,
    difficulty: 'medium',
    category: 'shooting',
    positions: ['ST', 'LW', 'RW', 'CAM', 'CM'],
    isPro: false,
    equipment: ['Ball', 'Goal'],
    steps: [
      'Position body over the ball',
      'Strike through the middle of the ball',
      'Keep your knee over the ball on contact',
      'Follow through low',
      'Aim for bottom corners'
    ],
    xpReward: 70,
  },
  {
    id: 'shoot-15',
    title: 'Bicycle Kick Basics',
    description: 'Learn the spectacular overhead kick safely',
    duration: 20,
    difficulty: 'elite',
    category: 'shooting',
    positions: ['ST', 'CAM'],
    isPro: true,
    equipment: ['Ball', 'Soft Surface/Mat'],
    steps: [
      'Practice falling technique first',
      'Toss ball up gently',
      'Jump off non-kicking foot',
      'Swing kicking leg over your head',
      'Make contact at highest point',
      'Land safely on your back/side'
    ],
    xpReward: 200,
  },
  {
    id: 'shoot-16',
    title: 'Back to Goal Finishing',
    description: 'Score with your back to goal like a target man',
    duration: 18,
    difficulty: 'hard',
    category: 'shooting',
    positions: ['ST'],
    isPro: true,
    equipment: ['Ball', 'Goal', 'Partner'],
    steps: [
      'Receive with back to goal',
      'Practice spin and shoot',
      'Practice layoff and turn',
      'Work on flick-ons',
      'Add defender pressure'
    ],
    xpReward: 130,
  },
  {
    id: 'shoot-17',
    title: 'Outside Foot Curler',
    description: 'Bend the ball with the outside of your foot',
    duration: 15,
    difficulty: 'hard',
    category: 'shooting',
    positions: ['LW', 'RW', 'CAM'],
    isPro: true,
    equipment: ['Ball', 'Goal'],
    steps: [
      'Approach at an angle',
      'Strike with outside of foot',
      'Wrap your foot around the ball',
      'Follow through across your body',
      'Practice from different angles'
    ],
    xpReward: 140,
  },
  {
    id: 'shoot-18',
    title: 'Quick Release Shooting',
    description: 'Shoot faster than defenders can react',
    duration: 15,
    difficulty: 'medium',
    category: 'shooting',
    positions: ['ST', 'CAM', 'CM'],
    isPro: false,
    equipment: ['Ball', 'Goal'],
    steps: [
      'Minimize backswing',
      'Shoot on first or second touch',
      'Focus on placement over power',
      'Practice with balls at different speeds',
      'Add time pressure'
    ],
    xpReward: 85,
  },
  {
    id: 'shoot-19',
    title: 'Free Kick Specialist',
    description: 'Become deadly from set pieces',
    duration: 25,
    difficulty: 'hard',
    category: 'shooting',
    positions: ['ST', 'LW', 'RW', 'CAM', 'CM', 'CDM'],
    isPro: true,
    equipment: ['Ball', 'Goal', 'Wall/Mannequins'],
    steps: [
      'Develop consistent run-up',
      'Practice dipping technique',
      'Practice curling technique',
      'Vary placement and power',
      'Practice from different distances'
    ],
    xpReward: 150,
  },
  {
    id: 'shoot-20',
    title: 'Near Post Finishes',
    description: 'Master the clinical near post finish',
    duration: 12,
    difficulty: 'medium',
    category: 'shooting',
    positions: ['ST', 'LW', 'RW'],
    isPro: false,
    equipment: ['Ball', 'Goal'],
    steps: [
      'Attack the near post area',
      'Keep shot low and hard',
      'Aim inside the post',
      'Practice from tight angles',
      'Work on first-time finishes'
    ],
    xpReward: 75,
  },

  // DRIBBLING DRILLS (12 drills)
  {
    id: 'drib-1',
    title: 'Cone Weave Basics',
    description: 'Master close control through tight spaces',
    duration: 10,
    difficulty: 'easy',
    category: 'dribbling',
    positions: ['ST', 'LW', 'RW', 'CAM', 'CM'],
    isPro: false,
    equipment: ['Ball', 'Cones'],
    steps: [
      'Set up 8 cones in a line, 1 meter apart',
      'Dribble through using inside of foot only',
      'Dribble through using outside of foot only',
      'Alternate inside/outside touches',
      'Time yourself and try to improve'
    ],
    xpReward: 50,
  },
  {
    id: 'drib-2',
    title: 'The Messi Touch',
    description: 'Develop quick, small touches for close control',
    duration: 12,
    difficulty: 'medium',
    category: 'dribbling',
    positions: ['ST', 'LW', 'RW', 'CAM'],
    isPro: false,
    equipment: ['Ball', 'Cones'],
    steps: [
      'Set up a 5x5 meter box with cones',
      'Dribble inside the box with quick touches',
      'Keep the ball within 1 foot of you at all times',
      'Practice sudden direction changes',
      'Maintain head up as much as possible'
    ],
    xpReward: 75,
  },
  {
    id: 'drib-3',
    title: 'Stepover Master',
    description: 'Perfect the classic stepover to beat defenders',
    duration: 15,
    difficulty: 'medium',
    category: 'dribbling',
    positions: ['ST', 'LW', 'RW', 'CAM'],
    isPro: false,
    equipment: ['Ball', 'Cones'],
    steps: [
      'Practice stationary stepovers (both directions)',
      'Add forward movement after the stepover',
      'Set up a cone as a defender',
      'Stepover and accelerate past the cone',
      'Practice double and triple stepovers'
    ],
    xpReward: 80,
  },
  {
    id: 'drib-4',
    title: 'Elastico Technique',
    description: 'Learn the devastating elastico skill move',
    duration: 20,
    difficulty: 'hard',
    category: 'dribbling',
    positions: ['ST', 'LW', 'RW', 'CAM'],
    isPro: true,
    equipment: ['Ball', 'Cones'],
    steps: [
      'Practice the motion without the ball',
      'Push ball with outside of foot',
      'Quickly snap inside of same foot around ball',
      'The motion should be one fluid movement',
      'Practice at walking pace, then jogging',
      'Use against cone defenders'
    ],
    xpReward: 140,
  },
  {
    id: 'drib-5',
    title: 'Cruyff Turn Perfection',
    description: 'Master Johan Cruyff\'s legendary turn',
    duration: 12,
    difficulty: 'medium',
    category: 'dribbling',
    positions: ['ST', 'LW', 'RW', 'CAM', 'CM'],
    isPro: false,
    equipment: ['Ball', 'Cones'],
    steps: [
      'Dribble towards a cone (defender)',
      'Shape body as if to pass or shoot',
      'Drag ball behind standing leg with inside of foot',
      'Accelerate in the new direction',
      'Practice on both feet'
    ],
    xpReward: 85,
  },
  {
    id: 'drib-6',
    title: 'Speed Dribble Drill',
    description: 'Maintain control while dribbling at full speed',
    duration: 15,
    difficulty: 'medium',
    category: 'dribbling',
    positions: ['ST', 'LW', 'RW', 'LB', 'RB'],
    isPro: false,
    equipment: ['Ball', 'Cones'],
    steps: [
      'Set up cones 30 meters apart',
      'Sprint with ball using big touches',
      'Touch ball every 3-4 steps',
      'Keep ball in front but under control',
      'Time your runs, aim to improve'
    ],
    xpReward: 70,
  },
  {
    id: 'drib-7',
    title: 'La Croqueta',
    description: 'Iniesta\'s signature move to evade tackles',
    duration: 15,
    difficulty: 'hard',
    category: 'dribbling',
    positions: ['CAM', 'CM', 'CDM'],
    isPro: true,
    equipment: ['Ball', 'Cones'],
    steps: [
      'Start with ball at your feet',
      'Push ball sideways with inside of one foot',
      'Immediately control with inside of other foot',
      'The ball moves horizontally across your body',
      'Practice in tight spaces with cones'
    ],
    xpReward: 110,
  },
  {
    id: 'drib-8',
    title: 'Explosive Chop',
    description: 'Learn the explosive chop to change direction',
    duration: 12,
    difficulty: 'medium',
    category: 'dribbling',
    positions: ['ST', 'LW', 'RW'],
    isPro: false,
    equipment: ['Ball', 'Cones'],
    steps: [
      'Dribble at pace towards cone',
      'Jump slightly and chop ball behind you',
      'Use inside of foot to cut ball sharply',
      'Turn body 180 degrees',
      'Accelerate away in new direction'
    ],
    xpReward: 80,
  },
  {
    id: 'drib-9',
    title: '1v1 Domination',
    description: 'Beat defenders consistently in isolation',
    duration: 20,
    difficulty: 'hard',
    category: 'dribbling',
    positions: ['ST', 'LW', 'RW', 'CAM'],
    isPro: true,
    equipment: ['Ball', 'Cones'],
    steps: [
      'Set up cone gates representing defenders',
      'Approach at match speed',
      'Read the defender\'s body position',
      'Choose and execute appropriate skill',
      'Accelerate through the gate',
      'Practice multiple approach angles'
    ],
    xpReward: 130,
  },
  {
    id: 'drib-10',
    title: 'Ball Mastery Routine',
    description: 'Daily routine for exceptional ball control',
    duration: 15,
    difficulty: 'easy',
    category: 'dribbling',
    positions: ['ST', 'LW', 'RW', 'CAM', 'CM', 'CDM', 'LB', 'RB', 'CB', 'GK'],
    isPro: false,
    equipment: ['Ball'],
    steps: [
      'Toe taps - 30 seconds each foot',
      'Sole rolls - 30 seconds each foot',
      'Inside-outside touches - 1 minute',
      'Figure 8 around legs - 1 minute',
      'Juggling - 2 minutes',
      'Free dribbling in small area - 2 minutes'
    ],
    xpReward: 60,
  },
  {
    id: 'drib-11',
    title: 'Skill Move Combination',
    description: 'Chain multiple skills together fluently',
    duration: 25,
    difficulty: 'elite',
    category: 'dribbling',
    positions: ['ST', 'LW', 'RW', 'CAM'],
    isPro: true,
    equipment: ['Ball', 'Cones'],
    steps: [
      'Stepover into body feint',
      'Elastico into Cruyff turn',
      'La Croqueta into acceleration',
      'Practice each combination 10 times',
      'Create your own signature combo'
    ],
    xpReward: 180,
  },
  {
    id: 'drib-12',
    title: 'Pressure Dribbling',
    description: 'Keep composure when pressed by defenders',
    duration: 18,
    difficulty: 'hard',
    category: 'dribbling',
    positions: ['CM', 'CAM', 'CDM'],
    isPro: true,
    equipment: ['Ball', 'Cones'],
    steps: [
      'Set up 4 cones as closing defenders',
      'Dribble into the box they create',
      'Use body to shield the ball',
      'Find space to dribble out',
      'Practice quick turns and direction changes',
      'Increase pressure by shrinking the box'
    ],
    xpReward: 120,
  },

  // Additional Dribbling Drills (13-20)
  {
    id: 'drib-13',
    title: 'Maradona Turn',
    description: 'Master the 360-degree spin move',
    duration: 15,
    difficulty: 'hard',
    category: 'dribbling',
    positions: ['ST', 'LW', 'RW', 'CAM', 'CM'],
    isPro: true,
    equipment: ['Ball', 'Cones'],
    steps: [
      'Place foot on top of ball',
      'Drag ball back with sole',
      'Spin body 360 degrees',
      'Keep ball close throughout',
      'Accelerate away'
    ],
    xpReward: 120,
  },
  {
    id: 'drib-14',
    title: 'Shoulder Drop Feint',
    description: 'Use body feints to fool defenders',
    duration: 12,
    difficulty: 'medium',
    category: 'dribbling',
    positions: ['ST', 'LW', 'RW', 'CAM'],
    isPro: false,
    equipment: ['Ball', 'Cones'],
    steps: [
      'Dip shoulder one direction',
      'Shift weight convincingly',
      'Push ball the opposite way',
      'Explode past the defender',
      'Practice both directions'
    ],
    xpReward: 80,
  },
  {
    id: 'drib-15',
    title: 'Nutmeg Training',
    description: 'Perfect the art of playing through legs',
    duration: 15,
    difficulty: 'hard',
    category: 'dribbling',
    positions: ['ST', 'LW', 'RW', 'CAM'],
    isPro: true,
    equipment: ['Ball', 'Partner'],
    steps: [
      'Read defender stance',
      'Wait for legs to open',
      'Push ball through quickly',
      'Accelerate around defender',
      'Practice timing'
    ],
    xpReward: 110,
  },
  {
    id: 'drib-16',
    title: 'Tight Space Survival',
    description: 'Keep possession when surrounded',
    duration: 18,
    difficulty: 'hard',
    category: 'dribbling',
    positions: ['CM', 'CAM', 'CDM'],
    isPro: true,
    equipment: ['Ball', 'Cones'],
    steps: [
      'Set up small box with cones',
      'Dribble inside under pressure',
      'Use all surfaces of foot',
      'Shield ball with body',
      'Find escape routes'
    ],
    xpReward: 125,
  },
  {
    id: 'drib-17',
    title: 'Stop-Start Acceleration',
    description: 'Master sudden changes in pace',
    duration: 12,
    difficulty: 'medium',
    category: 'dribbling',
    positions: ['ST', 'LW', 'RW', 'LB', 'RB'],
    isPro: false,
    equipment: ['Ball', 'Cones'],
    steps: [
      'Dribble at moderate pace',
      'Stop ball dead with sole',
      'Pause momentarily',
      'Explode forward',
      'Repeat in sequences'
    ],
    xpReward: 70,
  },
  {
    id: 'drib-18',
    title: 'Rainbow Flick',
    description: 'Learn the showboat rainbow over defenders',
    duration: 20,
    difficulty: 'elite',
    category: 'dribbling',
    positions: ['ST', 'LW', 'RW'],
    isPro: true,
    equipment: ['Ball'],
    steps: [
      'Roll ball up back of leg',
      'Flick with heel over head',
      'Let ball arc over defender',
      'Collect on other side',
      'Practice stationary first'
    ],
    xpReward: 180,
  },
  {
    id: 'drib-19',
    title: 'Winger Cut Inside',
    description: 'Perfect the trademark cut inside move',
    duration: 15,
    difficulty: 'medium',
    category: 'dribbling',
    positions: ['LW', 'RW'],
    isPro: false,
    equipment: ['Ball', 'Cones'],
    steps: [
      'Dribble down the wing',
      'Drop shoulder outside',
      'Cut sharply inside',
      'Create shooting angle',
      'Practice both wings'
    ],
    xpReward: 85,
  },
  {
    id: 'drib-20',
    title: 'Reverse Direction Mastery',
    description: 'Quickly reverse when running into trouble',
    duration: 14,
    difficulty: 'medium',
    category: 'dribbling',
    positions: ['CM', 'CAM', 'CDM', 'LB', 'RB'],
    isPro: false,
    equipment: ['Ball', 'Cones'],
    steps: [
      'Dribble forward at pace',
      'Drag ball back with sole',
      'Turn 180 degrees',
      'Accelerate away',
      'Practice both feet'
    ],
    xpReward: 75,
  },

  // PASSING DRILLS (10 drills)
  {
    id: 'pass-1',
    title: 'Wall Pass Fundamentals',
    description: 'Perfect your short passing technique',
    duration: 10,
    difficulty: 'easy',
    category: 'passing',
    positions: ['CM', 'CAM', 'CDM', 'CB'],
    isPro: false,
    equipment: ['Ball', 'Wall'],
    steps: [
      'Stand 5 meters from wall',
      'Pass with inside of right foot, receive with left',
      'Pass with inside of left foot, receive with right',
      '50 passes each foot',
      'Focus on weight and accuracy of pass'
    ],
    xpReward: 45,
  },
  {
    id: 'pass-2',
    title: 'One-Two Combinations',
    description: 'Master the give-and-go play',
    duration: 15,
    difficulty: 'medium',
    category: 'passing',
    positions: ['CM', 'CAM', 'ST'],
    isPro: false,
    equipment: ['Ball', 'Wall/Partner'],
    steps: [
      'Pass to wall/partner and move',
      'Receive the return pass in stride',
      'Practice different angles',
      'Add a finish after the combination',
      'Increase speed of the exchange'
    ],
    xpReward: 75,
  },
  {
    id: 'pass-3',
    title: 'Long Ball Accuracy',
    description: 'Hit accurate long passes to switch play',
    duration: 18,
    difficulty: 'hard',
    category: 'passing',
    positions: ['CB', 'CDM', 'CM'],
    isPro: true,
    equipment: ['Ball', 'Cones/Targets'],
    steps: [
      'Set target 40 meters away',
      'Practice driven long passes',
      'Practice lofted long passes',
      'Aim for different targets',
      'Work on both feet'
    ],
    xpReward: 110,
  },
  {
    id: 'pass-4',
    title: 'Through Ball Vision',
    description: 'Thread killer passes through defenses',
    duration: 20,
    difficulty: 'hard',
    category: 'passing',
    positions: ['CAM', 'CM'],
    isPro: true,
    equipment: ['Ball', 'Cones', 'Partner'],
    steps: [
      'Set up cones as defensive line',
      'Partner makes runs behind',
      'Weight the pass perfectly',
      'Lead the runner with your pass',
      'Practice from different positions'
    ],
    xpReward: 130,
  },
  {
    id: 'pass-5',
    title: 'First Time Passing',
    description: 'Keep the ball moving with one-touch play',
    duration: 12,
    difficulty: 'medium',
    category: 'passing',
    positions: ['CM', 'CAM', 'CDM'],
    isPro: false,
    equipment: ['Ball', 'Wall'],
    steps: [
      'Pass against wall continuously without stopping ball',
      'Vary the pace of passes',
      'Move side to side between passes',
      'Use both feet',
      'Set a target of 50 consecutive passes'
    ],
    xpReward: 70,
  },
  {
    id: 'pass-6',
    title: 'Disguised Pass',
    description: 'Fool defenders with deceptive passing',
    duration: 15,
    difficulty: 'hard',
    category: 'passing',
    positions: ['CAM', 'CM'],
    isPro: true,
    equipment: ['Ball', 'Partner'],
    steps: [
      'Shape body as if passing one direction',
      'Play the pass the opposite way',
      'Practice the no-look pass',
      'Use body feints before passing',
      'Practice in game-like scenarios'
    ],
    xpReward: 100,
  },
  {
    id: 'pass-7',
    title: 'Crossing Accuracy',
    description: 'Deliver dangerous crosses into the box',
    duration: 18,
    difficulty: 'medium',
    category: 'passing',
    positions: ['LW', 'RW', 'LB', 'RB'],
    isPro: false,
    equipment: ['Ball', 'Cones'],
    steps: [
      'Practice driven low crosses',
      'Practice floated crosses to far post',
      'Practice whipped crosses to near post',
      'Hit targets in the box',
      'Cross while running at full pace'
    ],
    xpReward: 85,
  },
  {
    id: 'pass-8',
    title: 'Receiving Under Pressure',
    description: 'Control and release quickly when marked',
    duration: 15,
    difficulty: 'medium',
    category: 'passing',
    positions: ['CM', 'CAM', 'CDM', 'ST'],
    isPro: false,
    equipment: ['Ball', 'Cones', 'Wall'],
    steps: [
      'Set up cone behind you as defender',
      'Receive pass from wall',
      'Turn away from pressure',
      'Play pass back first time',
      'Practice both directions'
    ],
    xpReward: 80,
  },
  {
    id: 'pass-9',
    title: 'Pirlo Passing Range',
    description: 'Dictate play with varied passing range',
    duration: 25,
    difficulty: 'elite',
    category: 'passing',
    positions: ['CDM', 'CM', 'CB'],
    isPro: true,
    equipment: ['Ball', 'Cones'],
    steps: [
      'Set targets at 10, 20, 30, and 40 meters',
      'Hit each target 5 times',
      'Vary between driven and lofted',
      'Use both feet',
      'Focus on disguise and weight'
    ],
    xpReward: 160,
  },
  {
    id: 'pass-10',
    title: 'Backpass & Build-up',
    description: 'Play confidently from the back',
    duration: 15,
    difficulty: 'medium',
    category: 'passing',
    positions: ['CB', 'CDM', 'GK'],
    isPro: false,
    equipment: ['Ball', 'Cones'],
    steps: [
      'Practice passing patterns from defense',
      'Play under imaginary pressure',
      'Use both feet equally',
      'Vary pass length and direction',
      'Keep the ball moving'
    ],
    xpReward: 75,
  },

  // Additional Passing Drills (11-18)
  {
    id: 'pass-11',
    title: 'Chip Pass Accuracy',
    description: 'Float the ball over defenders precisely',
    duration: 15,
    difficulty: 'hard',
    category: 'passing',
    positions: ['CAM', 'CM', 'CDM'],
    isPro: true,
    equipment: ['Ball', 'Cones', 'Partner'],
    steps: [
      'Set up targets at various distances',
      'Practice lofted chip passes',
      'Work on backspin for control',
      'Vary the height and distance',
      'Add movement'
    ],
    xpReward: 100,
  },
  {
    id: 'pass-12',
    title: 'No-Look Pass',
    description: 'Deceive opponents with eye manipulation',
    duration: 18,
    difficulty: 'hard',
    category: 'passing',
    positions: ['CAM', 'CM'],
    isPro: true,
    equipment: ['Ball', 'Partner'],
    steps: [
      'Look one direction',
      'Pass the opposite way',
      'Use peripheral vision',
      'Practice with multiple targets',
      'Build confidence gradually'
    ],
    xpReward: 120,
  },
  {
    id: 'pass-13',
    title: 'Outside Foot Pass',
    description: 'Add the outside foot to your passing arsenal',
    duration: 12,
    difficulty: 'medium',
    category: 'passing',
    positions: ['CM', 'CAM', 'CDM', 'LB', 'RB'],
    isPro: false,
    equipment: ['Ball', 'Wall'],
    steps: [
      'Practice against wall',
      'Use outside of foot',
      'Focus on accuracy',
      'Build up distance',
      'Use both feet'
    ],
    xpReward: 70,
  },
  {
    id: 'pass-14',
    title: 'Rabona Cross',
    description: 'Learn the flashy rabona technique',
    duration: 20,
    difficulty: 'elite',
    category: 'passing',
    positions: ['LW', 'RW', 'LB', 'RB'],
    isPro: true,
    equipment: ['Ball', 'Cones'],
    steps: [
      'Wrap kicking leg behind standing leg',
      'Strike ball with inside of foot',
      'Follow through naturally',
      'Practice stationary first',
      'Add movement gradually'
    ],
    xpReward: 160,
  },
  {
    id: 'pass-15',
    title: 'Switching Play Drill',
    description: 'Move the ball quickly from side to side',
    duration: 15,
    difficulty: 'medium',
    category: 'passing',
    positions: ['CB', 'CDM', 'CM'],
    isPro: false,
    equipment: ['Ball', 'Cones'],
    steps: [
      'Set up wide targets',
      'Receive and scan quickly',
      'Play diagonal switches',
      'Focus on first touch setup',
      'Increase tempo'
    ],
    xpReward: 80,
  },
  {
    id: 'pass-16',
    title: 'Killer Ball Training',
    description: 'Thread defense-splitting passes',
    duration: 20,
    difficulty: 'hard',
    category: 'passing',
    positions: ['CAM', 'CM'],
    isPro: true,
    equipment: ['Ball', 'Cones', 'Partner'],
    steps: [
      'Set up cone gates as defenders',
      'Play passes between gates',
      'Weight the pass for runner',
      'Practice timing',
      'Add movement patterns'
    ],
    xpReward: 130,
  },
  {
    id: 'pass-17',
    title: 'Quick Combination Play',
    description: 'Execute rapid passing sequences',
    duration: 15,
    difficulty: 'medium',
    category: 'passing',
    positions: ['CM', 'CAM', 'ST'],
    isPro: false,
    equipment: ['Ball', 'Wall/Partner'],
    steps: [
      'One-two against wall',
      'Add third pass',
      'Create passing triangles',
      'Increase speed',
      'Move while passing'
    ],
    xpReward: 85,
  },
  {
    id: 'pass-18',
    title: 'Ground Through Ball',
    description: 'Perfect the weighted ground pass',
    duration: 14,
    difficulty: 'medium',
    category: 'passing',
    positions: ['CM', 'CAM', 'CDM'],
    isPro: false,
    equipment: ['Ball', 'Cones'],
    steps: [
      'Set target area between cones',
      'Play firm ground passes',
      'Weight for runner to collect',
      'Practice various distances',
      'Add timing element'
    ],
    xpReward: 75,
  },

  // SPEED DRILLS (8 drills)
  {
    id: 'speed-1',
    title: 'Sprint Intervals',
    description: 'Build explosive acceleration',
    duration: 15,
    difficulty: 'medium',
    category: 'speed',
    positions: ['ST', 'LW', 'RW', 'LB', 'RB'],
    isPro: false,
    equipment: ['Cones'],
    steps: [
      'Set cones 20 meters apart',
      'Sprint to cone and jog back - 10 times',
      'Rest 30 seconds between sets',
      'Complete 3 sets',
      'Focus on explosive starts'
    ],
    xpReward: 65,
  },
  {
    id: 'speed-2',
    title: 'Agility Ladder Mastery',
    description: 'Improve footwork and coordination',
    duration: 15,
    difficulty: 'medium',
    category: 'speed',
    positions: ['ST', 'LW', 'RW', 'LB', 'RB', 'CM'],
    isPro: true,
    equipment: ['Agility Ladder'],
    steps: [
      'Two feet in each square - 3 times',
      'Lateral shuffle through ladder - 3 times',
      'Icky shuffle pattern - 3 times',
      'In-in-out-out pattern - 3 times',
      'Increase speed each round'
    ],
    xpReward: 90,
  },
  {
    id: 'speed-3',
    title: 'Acceleration Bursts',
    description: 'Develop first-step quickness',
    duration: 12,
    difficulty: 'easy',
    category: 'speed',
    positions: ['ST', 'LW', 'RW', 'LB', 'RB', 'CM', 'CDM', 'CAM', 'CB', 'GK'],
    isPro: false,
    equipment: ['Cones'],
    steps: [
      'Start in athletic stance',
      'Explode forward for 5 meters',
      'Decelerate and return',
      'Repeat 15 times',
      'Rest 20 seconds between reps'
    ],
    xpReward: 55,
  },
  {
    id: 'speed-4',
    title: 'Change of Direction',
    description: 'Cut and accelerate like the pros',
    duration: 18,
    difficulty: 'hard',
    category: 'speed',
    positions: ['ST', 'LW', 'RW', 'LB', 'RB'],
    isPro: true,
    equipment: ['Cones'],
    steps: [
      'Set up zigzag cone pattern',
      'Sprint to cone, sharp cut, sprint to next',
      'Focus on low center of gravity',
      'Push off explosively from cuts',
      'Complete pattern 10 times'
    ],
    xpReward: 120,
  },
  {
    id: 'speed-5',
    title: 'Speed with Ball',
    description: 'Maintain pace while dribbling',
    duration: 15,
    difficulty: 'medium',
    category: 'speed',
    positions: ['ST', 'LW', 'RW', 'LB', 'RB'],
    isPro: false,
    equipment: ['Ball', 'Cones'],
    steps: [
      'Sprint 30 meters without ball - time it',
      'Sprint 30 meters with ball - time it',
      'Work to close the gap between times',
      'Use bigger touches at speed',
      'Keep ball in front of you'
    ],
    xpReward: 75,
  },
  {
    id: 'speed-6',
    title: 'Reaction Sprint Drill',
    description: 'React quickly to visual cues',
    duration: 12,
    difficulty: 'medium',
    category: 'speed',
    positions: ['ST', 'LW', 'RW', 'LB', 'RB', 'CM', 'CDM', 'CAM', 'CB', 'GK'],
    isPro: false,
    equipment: ['Cones'],
    steps: [
      'Start in ready position',
      'Partner points direction to sprint',
      'Explode in that direction for 5 meters',
      'Return to start immediately',
      'Repeat 20 times'
    ],
    xpReward: 70,
  },
  {
    id: 'speed-7',
    title: 'Bale Sprint Training',
    description: 'Build devastating straight-line speed',
    duration: 25,
    difficulty: 'hard',
    category: 'speed',
    positions: ['LW', 'RW', 'LB', 'RB'],
    isPro: true,
    equipment: ['Cones'],
    steps: [
      '40 meter sprints x 5',
      '60 meter sprints x 3',
      '80 meter sprints x 2',
      'Full recovery between sprints',
      'Focus on running form'
    ],
    xpReward: 140,
  },
  {
    id: 'speed-8',
    title: 'Match Simulation Runs',
    description: 'Replicate match running patterns',
    duration: 20,
    difficulty: 'hard',
    category: 'speed',
    positions: ['ST', 'LW', 'RW', 'LB', 'RB', 'CM', 'CDM', 'CAM', 'CB', 'GK'],
    isPro: true,
    equipment: ['Cones'],
    steps: [
      'Jog 30 seconds, sprint 10 seconds',
      'Repeat for 10 minutes',
      'Include direction changes',
      'Add backward running',
      'Finish with 3 full sprints'
    ],
    xpReward: 130,
  },

  // Additional Speed Drills (9-14)
  {
    id: 'speed-9',
    title: 'Curved Run Training',
    description: 'Sprint in arcs like attacking runs',
    duration: 15,
    difficulty: 'medium',
    category: 'speed',
    positions: ['ST', 'LW', 'RW', 'CAM'],
    isPro: false,
    equipment: ['Cones'],
    steps: [
      'Set up curved cone path',
      'Sprint along the curve',
      'Maintain speed through turn',
      'Practice both directions',
      'Increase curve sharpness'
    ],
    xpReward: 75,
  },
  {
    id: 'speed-10',
    title: 'Box-to-Box Shuttles',
    description: 'Build midfielder endurance and speed',
    duration: 20,
    difficulty: 'hard',
    category: 'speed',
    positions: ['CM', 'CDM', 'CAM'],
    isPro: true,
    equipment: ['Cones'],
    steps: [
      'Sprint full pitch length',
      'Touch each penalty area',
      'Recover with light jog',
      'Repeat 8-10 times',
      'Time your runs'
    ],
    xpReward: 110,
  },
  {
    id: 'speed-11',
    title: 'Defender Recovery Runs',
    description: 'Sprint back to recover position',
    duration: 15,
    difficulty: 'hard',
    category: 'speed',
    positions: ['CB', 'LB', 'RB', 'CDM'],
    isPro: true,
    equipment: ['Cones'],
    steps: [
      'Start at halfway line',
      'Sprint back to goal line',
      'Turn and sprint to 18-yard box',
      'Repeat 6 times',
      'Full recovery between sets'
    ],
    xpReward: 100,
  },
  {
    id: 'speed-12',
    title: 'First Yard Explosion',
    description: 'Win the crucial first step',
    duration: 12,
    difficulty: 'medium',
    category: 'speed',
    positions: ['ST', 'LW', 'RW', 'LB', 'RB', 'CM', 'CDM', 'CAM', 'CB', 'GK'],
    isPro: false,
    equipment: ['Cones'],
    steps: [
      'Start from various positions',
      'React to signal',
      'Explode for 3 yards only',
      'Focus on arm drive',
      '20 reps with rest'
    ],
    xpReward: 65,
  },
  {
    id: 'speed-13',
    title: 'Deceleration Control',
    description: 'Stop quickly without losing balance',
    duration: 14,
    difficulty: 'medium',
    category: 'speed',
    positions: ['ST', 'LW', 'RW', 'LB', 'RB', 'CM', 'CDM', 'CAM', 'CB', 'GK'],
    isPro: false,
    equipment: ['Cones'],
    steps: [
      'Sprint 20 meters',
      'Stop within 2 meters',
      'Stay balanced',
      'Add direction change after stop',
      'Practice at max speed'
    ],
    xpReward: 70,
  },
  {
    id: 'speed-14',
    title: 'Attacking Run Patterns',
    description: 'Perfect striker movement patterns',
    duration: 18,
    difficulty: 'hard',
    category: 'speed',
    positions: ['ST', 'LW', 'RW'],
    isPro: true,
    equipment: ['Cones'],
    steps: [
      'Practice diagonal runs',
      'Practice curved runs behind defense',
      'Work on checking movements',
      'Combine patterns',
      'Add sprint at end of each'
    ],
    xpReward: 120,
  },

  // DEFENSE DRILLS (8 drills)
  {
    id: 'def-1',
    title: 'Jockeying Basics',
    description: 'Stay on your feet and contain attackers',
    duration: 12,
    difficulty: 'easy',
    category: 'defense',
    positions: ['CB', 'CDM', 'LB', 'RB'],
    isPro: false,
    equipment: ['Cones'],
    steps: [
      'Practice side-to-side shuffling',
      'Stay on balls of feet',
      'Keep low center of gravity',
      'Arms out for balance',
      'Mirror partner movements'
    ],
    xpReward: 50,
  },
  {
    id: 'def-2',
    title: '1v1 Defending',
    description: 'Win individual battles against attackers',
    duration: 18,
    difficulty: 'hard',
    category: 'defense',
    positions: ['CB', 'CDM', 'LB', 'RB'],
    isPro: true,
    equipment: ['Ball', 'Cones'],
    steps: [
      'Set up a gate to defend',
      'Partner attempts to dribble through',
      'Stay patient, don\'t dive in',
      'Show attacker to weaker side',
      'Time your tackle perfectly'
    ],
    xpReward: 120,
  },
  {
    id: 'def-3',
    title: 'Interception Training',
    description: 'Read the game and steal passes',
    duration: 15,
    difficulty: 'medium',
    category: 'defense',
    positions: ['CDM', 'CM', 'CB'],
    isPro: false,
    equipment: ['Ball', 'Partner'],
    steps: [
      'Watch passer\'s body shape',
      'Anticipate pass direction',
      'Move early to intercept',
      'Practice timing your runs',
      'Intercept and transition quickly'
    ],
    xpReward: 80,
  },
  {
    id: 'def-4',
    title: 'Tackling Technique',
    description: 'Win the ball cleanly and safely',
    duration: 15,
    difficulty: 'medium',
    category: 'defense',
    positions: ['CB', 'CDM', 'LB', 'RB', 'CM'],
    isPro: false,
    equipment: ['Ball'],
    steps: [
      'Practice standing tackles',
      'Time the block tackle',
      'Use your body weight',
      'Stay on your feet',
      'Practice slide tackles last resort'
    ],
    xpReward: 75,
  },
  {
    id: 'def-5',
    title: 'Defensive Heading',
    description: 'Clear the ball under pressure',
    duration: 12,
    difficulty: 'medium',
    category: 'defense',
    positions: ['CB', 'CDM'],
    isPro: false,
    equipment: ['Ball'],
    steps: [
      'Practice heading for distance',
      'Attack the ball aggressively',
      'Time your jumps',
      'Direct headers wide',
      'Clear with power and purpose'
    ],
    xpReward: 70,
  },
  {
    id: 'def-6',
    title: 'Recovery Runs',
    description: 'Sprint back and recover defensive position',
    duration: 15,
    difficulty: 'hard',
    category: 'defense',
    positions: ['CB', 'LB', 'RB', 'CDM'],
    isPro: true,
    equipment: ['Cones'],
    steps: [
      'Start at halfway line',
      'Sprint back to penalty area',
      'Simulate tracking a runner',
      'Get goalside immediately',
      'Practice recovery and tackle'
    ],
    xpReward: 100,
  },
  {
    id: 'def-7',
    title: 'Pressing Triggers',
    description: 'Know when to press and win the ball high',
    duration: 18,
    difficulty: 'hard',
    category: 'defense',
    positions: ['ST', 'LW', 'RW', 'CAM', 'CM'],
    isPro: true,
    equipment: ['Ball', 'Cones'],
    steps: [
      'Identify poor touches as triggers',
      'Press backward passes',
      'Cut off passing lanes while pressing',
      'Work in coordination with teammates',
      'Practice controlled aggression'
    ],
    xpReward: 110,
  },
  {
    id: 'def-8',
    title: 'Defensive Shape',
    description: 'Maintain organization as a unit',
    duration: 20,
    difficulty: 'medium',
    category: 'defense',
    positions: ['CB', 'LB', 'RB', 'CDM'],
    isPro: false,
    equipment: ['Cones'],
    steps: [
      'Practice shifting as a line',
      'Maintain proper distances',
      'Communicate constantly',
      'Drop and push together',
      'Cover for teammates'
    ],
    xpReward: 85,
  },

  // Additional Defense Drills (9-14)
  {
    id: 'def-9',
    title: 'Zonal Marking',
    description: 'Protect your zone effectively',
    duration: 18,
    difficulty: 'hard',
    category: 'defense',
    positions: ['CB', 'CDM', 'LB', 'RB'],
    isPro: true,
    equipment: ['Cones', 'Ball'],
    steps: [
      'Define your zone with cones',
      'Track ball movement',
      'Adjust position accordingly',
      'Communicate with teammates',
      'Practice closing down space'
    ],
    xpReward: 110,
  },
  {
    id: 'def-10',
    title: 'Aerial Duel Dominance',
    description: 'Win headers in defensive situations',
    duration: 15,
    difficulty: 'medium',
    category: 'defense',
    positions: ['CB', 'CDM'],
    isPro: false,
    equipment: ['Ball'],
    steps: [
      'Practice jump timing',
      'Use arms for balance',
      'Attack the ball at highest point',
      'Direct header away from goal',
      'Add opposition'
    ],
    xpReward: 80,
  },
  {
    id: 'def-11',
    title: 'Slide Tackle Technique',
    description: 'Last-ditch defending done right',
    duration: 15,
    difficulty: 'hard',
    category: 'defense',
    positions: ['CB', 'LB', 'RB', 'CDM'],
    isPro: true,
    equipment: ['Ball', 'Soft Surface'],
    steps: [
      'Only use as last resort',
      'Get low and slide',
      'Lead with far foot',
      'Win the ball cleanly',
      'Recover quickly'
    ],
    xpReward: 100,
  },
  {
    id: 'def-12',
    title: 'Counter-Attack Prevention',
    description: 'Stop fast breaks before they start',
    duration: 18,
    difficulty: 'hard',
    category: 'defense',
    positions: ['CB', 'CDM', 'CM'],
    isPro: true,
    equipment: ['Cones'],
    steps: [
      'Read loss of possession',
      'Sprint back immediately',
      'Get goalside of attacker',
      'Delay the attack',
      'Practice transition scenarios'
    ],
    xpReward: 115,
  },
  {
    id: 'def-13',
    title: 'Fullback Defending',
    description: 'Stop wingers in wide areas',
    duration: 16,
    difficulty: 'medium',
    category: 'defense',
    positions: ['LB', 'RB'],
    isPro: false,
    equipment: ['Cones', 'Ball'],
    steps: [
      'Show winger outside',
      'Stay goal-side',
      'Time your challenges',
      'Block crossing lanes',
      'Practice recovery runs'
    ],
    xpReward: 85,
  },
  {
    id: 'def-14',
    title: 'Offside Trap Timing',
    description: 'Catch attackers offside as a unit',
    duration: 15,
    difficulty: 'hard',
    category: 'defense',
    positions: ['CB', 'LB', 'RB'],
    isPro: true,
    equipment: ['Cones'],
    steps: [
      'Practice line movement',
      'Step up on trigger',
      'Communicate constantly',
      'Hold the line',
      'Practice with attackers'
    ],
    xpReward: 105,
  },

  // FITNESS DRILLS (10 drills)
  {
    id: 'fit-1',
    title: 'Football HIIT Circuit',
    description: 'High intensity interval training',
    duration: 20,
    difficulty: 'hard',
    category: 'fitness',
    positions: ['ST', 'LW', 'RW', 'CAM', 'CM', 'CDM', 'LB', 'RB', 'CB', 'GK'],
    isPro: false,
    equipment: ['Ball', 'Cones'],
    steps: [
      '40 seconds work, 20 seconds rest',
      'Station 1: Ball touches',
      'Station 2: Burpees',
      'Station 3: Sprint shuttles',
      'Station 4: Jumping jacks',
      'Complete 4 rounds'
    ],
    xpReward: 100,
  },
  {
    id: 'fit-2',
    title: 'Core Strength for Football',
    description: 'Build a strong stable core',
    duration: 15,
    difficulty: 'medium',
    category: 'fitness',
    positions: ['ST', 'LW', 'RW', 'CAM', 'CM', 'CDM', 'LB', 'RB', 'CB', 'GK'],
    isPro: false,
    equipment: [],
    steps: [
      'Plank - 45 seconds',
      'Side plank each side - 30 seconds',
      'Bicycle crunches - 20 reps',
      'Leg raises - 15 reps',
      'Russian twists - 20 reps',
      'Complete 3 rounds'
    ],
    xpReward: 70,
  },
  {
    id: 'fit-3',
    title: 'Match Endurance Builder',
    description: 'Build 90-minute stamina',
    duration: 30,
    difficulty: 'hard',
    category: 'fitness',
    positions: ['ST', 'LW', 'RW', 'CAM', 'CM', 'CDM', 'LB', 'RB', 'CB', 'GK'],
    isPro: true,
    equipment: ['Cones'],
    steps: [
      'Jog for 5 minutes',
      '3/4 pace run for 3 minutes',
      'Sprint 30 seconds',
      'Jog recovery 1 minute',
      'Repeat cycle 5 times'
    ],
    xpReward: 130,
  },
  {
    id: 'fit-4',
    title: 'Leg Power Training',
    description: 'Build explosive leg strength',
    duration: 20,
    difficulty: 'hard',
    category: 'fitness',
    positions: ['ST', 'LW', 'RW', 'CAM', 'CM', 'CDM', 'LB', 'RB', 'CB', 'GK'],
    isPro: true,
    equipment: [],
    steps: [
      'Jump squats - 15 reps',
      'Lunges - 12 each leg',
      'Box jumps or tuck jumps - 10 reps',
      'Single leg hops - 10 each',
      'Wall sits - 45 seconds',
      'Complete 3 rounds'
    ],
    xpReward: 110,
  },
  {
    id: 'fit-5',
    title: 'Dynamic Warm-up Routine',
    description: 'Prepare your body for training',
    duration: 10,
    difficulty: 'easy',
    category: 'fitness',
    positions: ['ST', 'LW', 'RW', 'CAM', 'CM', 'CDM', 'LB', 'RB', 'CB', 'GK'],
    isPro: false,
    equipment: [],
    steps: [
      'Light jog - 2 minutes',
      'High knees - 30 seconds',
      'Butt kicks - 30 seconds',
      'Leg swings - 10 each leg',
      'Arm circles - 20 each direction',
      'Dynamic stretches - 3 minutes'
    ],
    xpReward: 40,
  },
  {
    id: 'fit-6',
    title: 'Recovery Session',
    description: 'Active recovery and flexibility',
    duration: 20,
    difficulty: 'easy',
    category: 'fitness',
    positions: ['ST', 'LW', 'RW', 'CAM', 'CM', 'CDM', 'LB', 'RB', 'CB', 'GK'],
    isPro: false,
    equipment: [],
    steps: [
      'Light walk - 5 minutes',
      'Static stretching routine',
      'Focus on hamstrings, quads, hip flexors',
      'Hold each stretch 30 seconds',
      'Deep breathing throughout'
    ],
    xpReward: 35,
  },
  {
    id: 'fit-7',
    title: 'Plyometric Power',
    description: 'Develop explosive movements',
    duration: 25,
    difficulty: 'elite',
    category: 'fitness',
    positions: ['ST', 'LW', 'RW', 'CAM', 'CM', 'CDM', 'LB', 'RB', 'CB', 'GK'],
    isPro: true,
    equipment: ['Box/Step'],
    steps: [
      'Depth jumps - 8 reps',
      'Broad jumps - 8 reps',
      'Single leg bounds - 6 each',
      'Lateral hops - 10 each side',
      'Tuck jumps - 8 reps',
      'Rest 90 seconds between exercises'
    ],
    xpReward: 150,
  },
  {
    id: 'fit-8',
    title: 'Upper Body Strength',
    description: 'Build strength for physical battles',
    duration: 20,
    difficulty: 'medium',
    category: 'fitness',
    positions: ['ST', 'LW', 'RW', 'CAM', 'CM', 'CDM', 'LB', 'RB', 'CB', 'GK'],
    isPro: false,
    equipment: [],
    steps: [
      'Push-ups - 15 reps',
      'Diamond push-ups - 10 reps',
      'Plank shoulder taps - 20 reps',
      'Superman holds - 30 seconds',
      'Complete 3 rounds'
    ],
    xpReward: 75,
  },
  {
    id: 'fit-9',
    title: 'Sprint Stamina',
    description: 'Maintain speed throughout the match',
    duration: 25,
    difficulty: 'hard',
    category: 'fitness',
    positions: ['ST', 'LW', 'RW', 'LB', 'RB'],
    isPro: true,
    equipment: ['Cones'],
    steps: [
      'Sprint 100m at 80% effort',
      'Walk back recovery',
      'Repeat 10 times',
      'Rest 2 minutes',
      'Sprint 50m at 100% - 5 times'
    ],
    xpReward: 120,
  },
  {
    id: 'fit-10',
    title: 'Football-Specific Mobility',
    description: 'Improve range of motion for football',
    duration: 15,
    difficulty: 'easy',
    category: 'fitness',
    positions: ['ST', 'LW', 'RW', 'CAM', 'CM', 'CDM', 'LB', 'RB', 'CB', 'GK'],
    isPro: false,
    equipment: [],
    steps: [
      'Hip circles - 10 each direction',
      'Ankle rotations - 10 each',
      'Groin stretch - 30 seconds each',
      'Hip flexor stretch - 30 seconds each',
      'World\'s greatest stretch - 5 each side'
    ],
    xpReward: 45,
  },

  // Additional Fitness Drills (11-16)
  {
    id: 'fit-11',
    title: 'Balance & Stability',
    description: 'Improve balance for better control',
    duration: 15,
    difficulty: 'easy',
    category: 'fitness',
    positions: ['ST', 'LW', 'RW', 'CAM', 'CM', 'CDM', 'LB', 'RB', 'CB', 'GK'],
    isPro: false,
    equipment: [],
    steps: [
      'Single leg stands - 30 seconds each',
      'Single leg squats - 8 each',
      'Balance on unstable surface',
      'Eyes closed balance - 20 seconds',
      'Complete 2 rounds'
    ],
    xpReward: 50,
  },
  {
    id: 'fit-12',
    title: 'Flexibility Routine',
    description: 'Increase range of motion',
    duration: 20,
    difficulty: 'easy',
    category: 'fitness',
    positions: ['ST', 'LW', 'RW', 'CAM', 'CM', 'CDM', 'LB', 'RB', 'CB', 'GK'],
    isPro: false,
    equipment: [],
    steps: [
      'Hip flexor stretches - 1 min each',
      'Hamstring stretches - 1 min each',
      'Groin stretches - 2 min',
      'Quad stretches - 1 min each',
      'Calf stretches - 1 min each'
    ],
    xpReward: 45,
  },
  {
    id: 'fit-13',
    title: 'Football-Specific Cardio',
    description: 'Build match-ready cardiovascular fitness',
    duration: 25,
    difficulty: 'hard',
    category: 'fitness',
    positions: ['ST', 'LW', 'RW', 'CAM', 'CM', 'CDM', 'LB', 'RB', 'CB', 'GK'],
    isPro: true,
    equipment: ['Cones'],
    steps: [
      '5 min warm-up jog',
      'Fartlek training - 15 min',
      'Vary pace every 30-60 seconds',
      'Include backward running',
      'Cool down - 5 min'
    ],
    xpReward: 120,
  },
  {
    id: 'fit-14',
    title: 'Goalkeeper Fitness',
    description: 'Specialized fitness for keepers',
    duration: 20,
    difficulty: 'hard',
    category: 'fitness',
    positions: ['GK'],
    isPro: true,
    equipment: ['Ball'],
    steps: [
      'Lateral shuffles - 3 sets',
      'Explosive jumps - 15 reps',
      'Dive and recover - 10 each side',
      'Quick feet drills - 2 min',
      'Reaction saves - 5 min'
    ],
    xpReward: 110,
  },
  {
    id: 'fit-15',
    title: 'Pre-Match Activation',
    description: 'Get your body ready to perform',
    duration: 15,
    difficulty: 'easy',
    category: 'fitness',
    positions: ['ST', 'LW', 'RW', 'CAM', 'CM', 'CDM', 'LB', 'RB', 'CB', 'GK'],
    isPro: false,
    equipment: ['Ball'],
    steps: [
      'Dynamic stretches - 5 min',
      'Progressive sprints - 4 reps',
      'Ball touches - 2 min',
      'Passing drill - 3 min',
      'Short sprints - 5 reps'
    ],
    xpReward: 55,
  },
  {
    id: 'fit-16',
    title: 'Injury Prevention',
    description: 'Strengthen vulnerable areas',
    duration: 20,
    difficulty: 'medium',
    category: 'fitness',
    positions: ['ST', 'LW', 'RW', 'CAM', 'CM', 'CDM', 'LB', 'RB', 'CB', 'GK'],
    isPro: false,
    equipment: [],
    steps: [
      'Ankle strengthening - 3 min',
      'Knee stability exercises - 5 min',
      'Hip strengthening - 5 min',
      'Core activation - 5 min',
      'Cool down stretches - 2 min'
    ],
    xpReward: 70,
  },
];

// Training Programs - Long-term progression paths
export const TRAINING_PROGRAMS: TrainingProgram[] = [
  {
    id: 'prog-striker-elite',
    title: 'Elite Striker Academy',
    description: 'Complete 8-week program to become a clinical finisher',
    category: 'shooting',
    difficulty: 'intermediate',
    weeks: 8,
    totalDrills: 32,
    isPro: true,
    icon: '⚽',
    color: '#FF6B35',
    phases: [
      { week: 1, title: 'Foundation', description: 'Build your shooting basics', drillIds: ['shoot-1', 'shoot-5', 'shoot-10', 'fit-5'] },
      { week: 2, title: 'Accuracy Focus', description: 'Hit the corners consistently', drillIds: ['shoot-1', 'shoot-2', 'shoot-7', 'fit-2'] },
      { week: 3, title: 'Power Development', description: 'Add power to your shots', drillIds: ['shoot-9', 'shoot-4', 'fit-4', 'fit-1'] },
      { week: 4, title: 'Volley & Headers', description: 'Score from crosses', drillIds: ['shoot-3', 'shoot-7', 'pass-7', 'fit-3'] },
      { week: 5, title: '1v1 Finishing', description: 'Beat keepers one-on-one', drillIds: ['shoot-6', 'drib-9', 'speed-3', 'fit-1'] },
      { week: 6, title: 'Weak Foot Week', description: 'Double your threat', drillIds: ['shoot-8', 'pass-1', 'drib-10', 'fit-2'] },
      { week: 7, title: 'Pressure Finishing', description: 'Score under pressure', drillIds: ['shoot-10', 'shoot-11', 'fit-6', 'fit-9'] },
      { week: 8, title: 'Elite Finishing', description: 'Put it all together', drillIds: ['shoot-12', 'shoot-4', 'shoot-6', 'fit-7'] },
    ],
  },
  {
    id: 'prog-dribbler-master',
    title: 'Dribbling Mastery',
    description: '6-week program to beat any defender',
    category: 'dribbling',
    difficulty: 'intermediate',
    weeks: 6,
    totalDrills: 24,
    isPro: true,
    icon: '🔥',
    color: '#9B59B6',
    phases: [
      { week: 1, title: 'Ball Control', description: 'Master close control', drillIds: ['drib-1', 'drib-2', 'drib-10', 'fit-5'] },
      { week: 2, title: 'Basic Skills', description: 'Learn essential moves', drillIds: ['drib-3', 'drib-5', 'drib-8', 'fit-2'] },
      { week: 3, title: 'Speed Dribbling', description: 'Dribble at pace', drillIds: ['drib-6', 'speed-5', 'speed-1', 'fit-1'] },
      { week: 4, title: 'Advanced Skills', description: 'Unlock elite moves', drillIds: ['drib-4', 'drib-7', 'drib-12', 'fit-4'] },
      { week: 5, title: '1v1 Situations', description: 'Beat defenders', drillIds: ['drib-9', 'speed-4', 'def-1', 'fit-3'] },
      { week: 6, title: 'Skill Combinations', description: 'Chain moves together', drillIds: ['drib-11', 'drib-4', 'drib-9', 'fit-7'] },
    ],
  },
  {
    id: 'prog-midfielder-complete',
    title: 'Complete Midfielder',
    description: '10-week program to dominate the midfield',
    category: 'passing',
    difficulty: 'advanced',
    weeks: 10,
    totalDrills: 40,
    isPro: true,
    icon: '🎯',
    color: '#3498DB',
    phases: [
      { week: 1, title: 'Passing Basics', description: 'Perfect short passing', drillIds: ['pass-1', 'pass-5', 'drib-10', 'fit-5'] },
      { week: 2, title: 'First Touch', description: 'Control under pressure', drillIds: ['pass-8', 'drib-2', 'def-3', 'fit-2'] },
      { week: 3, title: 'Vision Training', description: 'See the whole pitch', drillIds: ['pass-4', 'pass-2', 'drib-12', 'fit-1'] },
      { week: 4, title: 'Long Passing', description: 'Switch play effectively', drillIds: ['pass-3', 'pass-9', 'fit-4', 'fit-3'] },
      { week: 5, title: 'Midfield Defense', description: 'Win the ball back', drillIds: ['def-3', 'def-7', 'def-4', 'fit-1'] },
      { week: 6, title: 'Box-to-Box', description: 'Cover the whole pitch', drillIds: ['speed-8', 'fit-3', 'pass-5', 'def-6'] },
      { week: 7, title: 'Playmaking', description: 'Create chances', drillIds: ['pass-4', 'pass-6', 'drib-7', 'fit-6'] },
      { week: 8, title: 'Goal Threat', description: 'Score from midfield', drillIds: ['shoot-5', 'shoot-9', 'pass-2', 'fit-4'] },
      { week: 9, title: 'Game Management', description: 'Control the tempo', drillIds: ['pass-9', 'pass-10', 'drib-12', 'fit-6'] },
      { week: 10, title: 'Complete Package', description: 'Elite midfielder drills', drillIds: ['pass-6', 'pass-4', 'shoot-9', 'fit-7'] },
    ],
  },
  {
    id: 'prog-defender-rock',
    title: 'Defensive Rock',
    description: '6-week program to become an unbeatable defender',
    category: 'defense',
    difficulty: 'intermediate',
    weeks: 6,
    totalDrills: 24,
    isPro: false,
    icon: '🛡️',
    color: '#27AE60',
    phases: [
      { week: 1, title: 'Defensive Stance', description: 'Perfect positioning', drillIds: ['def-1', 'def-8', 'fit-5', 'fit-2'] },
      { week: 2, title: 'Tackling', description: 'Win the ball cleanly', drillIds: ['def-4', 'def-2', 'speed-3', 'fit-1'] },
      { week: 3, title: 'Aerial Battles', description: 'Dominate in the air', drillIds: ['def-5', 'shoot-7', 'fit-4', 'fit-3'] },
      { week: 4, title: 'Reading the Game', description: 'Anticipate and intercept', drillIds: ['def-3', 'def-7', 'pass-10', 'fit-6'] },
      { week: 5, title: 'Recovery', description: 'Never get beaten', drillIds: ['def-6', 'speed-4', 'speed-1', 'fit-9'] },
      { week: 6, title: '1v1 Mastery', description: 'Win every duel', drillIds: ['def-2', 'def-1', 'speed-6', 'fit-7'] },
    ],
  },
  {
    id: 'prog-speed-demon',
    title: 'Speed Demon',
    description: '4-week program to become the fastest on the pitch',
    category: 'speed',
    difficulty: 'beginner',
    weeks: 4,
    totalDrills: 16,
    isPro: false,
    icon: '⚡',
    color: '#F1C40F',
    phases: [
      { week: 1, title: 'Acceleration', description: 'Explosive first steps', drillIds: ['speed-3', 'speed-1', 'fit-5', 'fit-2'] },
      { week: 2, title: 'Top Speed', description: 'Reach maximum velocity', drillIds: ['speed-7', 'speed-5', 'fit-4', 'fit-1'] },
      { week: 3, title: 'Agility', description: 'Change direction quickly', drillIds: ['speed-4', 'speed-2', 'speed-6', 'fit-3'] },
      { week: 4, title: 'Match Speed', description: 'Apply speed in games', drillIds: ['speed-8', 'speed-5', 'drib-6', 'fit-9'] },
    ],
  },
  {
    id: 'prog-fitness-foundation',
    title: 'Fitness Foundation',
    description: '4-week program to build match fitness',
    category: 'fitness',
    difficulty: 'beginner',
    weeks: 4,
    totalDrills: 16,
    isPro: false,
    icon: '💪',
    color: '#E74C3C',
    phases: [
      { week: 1, title: 'Base Building', description: 'Start your fitness journey', drillIds: ['fit-5', 'fit-6', 'fit-10', 'fit-2'] },
      { week: 2, title: 'Strength', description: 'Build football strength', drillIds: ['fit-2', 'fit-8', 'fit-4', 'fit-6'] },
      { week: 3, title: 'Endurance', description: 'Last the full 90', drillIds: ['fit-1', 'fit-3', 'speed-1', 'fit-6'] },
      { week: 4, title: 'Power', description: 'Explosive performance', drillIds: ['fit-4', 'fit-7', 'fit-9', 'fit-10'] },
    ],
  },
];

// Daily workout generator
export function generateDailyWorkout(
  position: Position | null,
  goals: TrainingGoal[],
  skillLevel: UserSkillLevel | null,
  completedDrills: string[]
): DailyWorkout {
  const today = new Date();
  const dayOfWeek = today.getDay();
  
  // Determine focus area based on day and goals
  const focusAreas: TrainingGoal[] = ['shooting', 'dribbling', 'passing', 'speed', 'defense', 'fitness'];
  let focusArea = goals[0] || focusAreas[dayOfWeek % focusAreas.length];
  
  // If it's rest day (Sunday), do fitness/recovery
  if (dayOfWeek === 0) {
    focusArea = 'fitness';
  }
  
  // Filter drills by focus area and appropriate difficulty
  let availableDrills = DRILLS.filter(d => {
    const categoryMatch = d.category === focusArea || d.category === 'fitness';
    const positionMatch = !position || d.positions.includes(position);
    const difficultyMatch = skillLevel === 'beginner' 
      ? d.difficulty !== 'elite' && d.difficulty !== 'hard'
      : skillLevel === 'advanced' 
        ? true 
        : d.difficulty !== 'elite';
    return categoryMatch && positionMatch && difficultyMatch;
  });
  
  // Prioritize uncompleted drills
  const uncompletedDrills = availableDrills.filter(d => !completedDrills.includes(d.id));
  if (uncompletedDrills.length >= 3) {
    availableDrills = uncompletedDrills;
  }
  
  // Select 3-4 drills for the workout
  const shuffled = availableDrills.sort(() => Math.random() - 0.5);
  const selectedDrills = shuffled.slice(0, 4);
  
  const totalDuration = selectedDrills.reduce((sum, d) => sum + d.duration, 0);
  const totalXp = selectedDrills.reduce((sum, d) => sum + d.xpReward, 0);
  
  const workoutTitles: Record<TrainingGoal, string> = {
    shooting: 'Finishing Focus',
    dribbling: 'Ball Mastery',
    passing: 'Vision & Passing',
    speed: 'Speed Session',
    defense: 'Defensive Drills',
    fitness: 'Conditioning Day',
  };
  
  const difficulty = skillLevel === 'beginner' ? 'easy' : skillLevel === 'advanced' ? 'hard' : 'medium';
  
  return {
    id: `daily-${today.toISOString().split('T')[0]}`,
    title: workoutTitles[focusArea],
    description: `${selectedDrills.length} drills focused on ${focusArea}`,
    duration: totalDuration,
    drillIds: selectedDrills.map(d => d.id),
    focusArea,
    difficulty,
    xpReward: totalXp + 50, // Bonus for completing daily workout
  };
}

export function getDrillById(id: string): Drill | undefined {
  return DRILLS.find(d => d.id === id);
}

export function getDrillsByCategory(category: TrainingGoal): Drill[] {
  return DRILLS.filter(d => d.category === category);
}

export function getRecommendedDrills(
  position: Position | null,
  goals: TrainingGoal[],
  skillLevel: UserSkillLevel | null,
  limit: number = 3
): Drill[] {
  let filtered = [...DRILLS];
  
  if (position) {
    filtered = filtered.filter(d => d.positions.includes(position));
  }
  
  if (goals.length > 0) {
    filtered.sort((a, b) => {
      const aMatch = goals.includes(a.category) ? 1 : 0;
      const bMatch = goals.includes(b.category) ? 1 : 0;
      return bMatch - aMatch;
    });
  }
  
  if (skillLevel === 'beginner') {
    filtered = filtered.filter(d => d.difficulty !== 'hard' && d.difficulty !== 'elite');
  }
  
  return filtered.slice(0, limit);
}

export function getProgramProgress(programId: string, completedDrills: string[]): number {
  const program = TRAINING_PROGRAMS.find(p => p.id === programId);
  if (!program) return 0;
  
  const allDrillIds = program.phases.flatMap(p => p.drillIds);
  const completed = allDrillIds.filter(id => completedDrills.includes(id)).length;
  return Math.round((completed / allDrillIds.length) * 100);
}

// Skill Mastery Paths - Progressive journey through each skill
export const SKILL_MASTERY_PATHS: SkillMasteryPath[] = [
  {
    id: 'shooting',
    title: 'Shooting Mastery',
    description: 'From beginner to elite finisher',
    icon: '⚽',
    color: '#FF6B35',
    totalLevels: 10,
    levels: [
      {
        level: 1,
        title: 'Foundation',
        description: 'Learn the basics of shooting',
        drillIds: ['shoot-1', 'shoot-11', 'shoot-14'],
        xpRequired: 0,
        unlockReward: 100,
      },
      {
        level: 2,
        title: 'Accuracy',
        description: 'Hit your targets consistently',
        drillIds: ['shoot-5', 'shoot-10', 'shoot-20'],
        xpRequired: 150,
        unlockReward: 150,
      },
      {
        level: 3,
        title: 'First Touch',
        description: 'Control and shoot in one motion',
        drillIds: ['shoot-2', 'shoot-7', 'shoot-18'],
        xpRequired: 350,
        unlockReward: 200,
      },
      {
        level: 4,
        title: 'Volleys & Headers',
        description: 'Master aerial finishing',
        drillIds: ['shoot-3', 'shoot-7'],
        xpRequired: 550,
        unlockReward: 250,
      },
      {
        level: 5,
        title: '1v1 Finishing',
        description: 'Beat the keeper one-on-one',
        drillIds: ['shoot-6', 'shoot-13'],
        xpRequired: 800,
        unlockReward: 300,
      },
      {
        level: 6,
        title: 'Weak Foot',
        description: 'Double your scoring threat',
        drillIds: ['shoot-8', 'shoot-16'],
        xpRequired: 1100,
        unlockReward: 350,
      },
      {
        level: 7,
        title: 'Long Range',
        description: 'Score from distance',
        drillIds: ['shoot-4', 'shoot-9', 'shoot-17'],
        xpRequired: 1450,
        unlockReward: 400,
      },
      {
        level: 8,
        title: 'Set Pieces',
        description: 'Become deadly from dead balls',
        drillIds: ['shoot-11', 'shoot-19'],
        xpRequired: 1850,
        unlockReward: 450,
      },
      {
        level: 9,
        title: 'Spectacular Finishes',
        description: 'Score incredible goals',
        drillIds: ['shoot-15', 'shoot-17'],
        xpRequired: 2300,
        unlockReward: 500,
      },
      {
        level: 10,
        title: 'Elite Finisher',
        description: 'Complete striker training',
        drillIds: ['shoot-12', 'shoot-15', 'shoot-19'],
        xpRequired: 2800,
        unlockReward: 600,
      },
    ],
  },
  {
    id: 'dribbling',
    title: 'Dribbling Mastery',
    description: 'Become untouchable on the ball',
    icon: '🔥',
    color: '#9B59B6',
    totalLevels: 10,
    levels: [
      {
        level: 1,
        title: 'Ball Control',
        description: 'Master basic ball control',
        drillIds: ['drib-1', 'drib-10'],
        xpRequired: 0,
        unlockReward: 100,
      },
      {
        level: 2,
        title: 'Close Control',
        description: 'Keep the ball close',
        drillIds: ['drib-2', 'drib-17'],
        xpRequired: 150,
        unlockReward: 150,
      },
      {
        level: 3,
        title: 'Basic Skills',
        description: 'Learn essential moves',
        drillIds: ['drib-3', 'drib-5', 'drib-14'],
        xpRequired: 350,
        unlockReward: 200,
      },
      {
        level: 4,
        title: 'Speed Dribbling',
        description: 'Dribble at pace',
        drillIds: ['drib-6', 'drib-8', 'drib-19'],
        xpRequired: 550,
        unlockReward: 250,
      },
      {
        level: 5,
        title: 'Advanced Skills',
        description: 'Unlock elite moves',
        drillIds: ['drib-4', 'drib-13'],
        xpRequired: 800,
        unlockReward: 300,
      },
      {
        level: 6,
        title: 'Midfield Mastery',
        description: 'Control in tight spaces',
        drillIds: ['drib-7', 'drib-16', 'drib-20'],
        xpRequired: 1100,
        unlockReward: 350,
      },
      {
        level: 7,
        title: '1v1 Situations',
        description: 'Beat defenders consistently',
        drillIds: ['drib-9', 'drib-15'],
        xpRequired: 1450,
        unlockReward: 400,
      },
      {
        level: 8,
        title: 'Pressure Dribbling',
        description: 'Keep possession under pressure',
        drillIds: ['drib-12', 'drib-16'],
        xpRequired: 1850,
        unlockReward: 450,
      },
      {
        level: 9,
        title: 'Showboat Skills',
        description: 'Learn spectacular moves',
        drillIds: ['drib-18', 'drib-15'],
        xpRequired: 2300,
        unlockReward: 500,
      },
      {
        level: 10,
        title: 'Skill Combos',
        description: 'Chain moves like a pro',
        drillIds: ['drib-11', 'drib-18', 'drib-13'],
        xpRequired: 2800,
        unlockReward: 600,
      },
    ],
  },
  {
    id: 'passing',
    title: 'Passing Mastery',
    description: 'Dictate the game with your passing',
    icon: '🎯',
    color: '#3498DB',
    totalLevels: 9,
    levels: [
      {
        level: 1,
        title: 'Short Passing',
        description: 'Perfect your technique',
        drillIds: ['pass-1', 'pass-5', 'pass-13'],
        xpRequired: 0,
        unlockReward: 100,
      },
      {
        level: 2,
        title: 'One-Twos',
        description: 'Master give-and-go plays',
        drillIds: ['pass-2', 'pass-17'],
        xpRequired: 150,
        unlockReward: 150,
      },
      {
        level: 3,
        title: 'Under Pressure',
        description: 'Play out from tight spaces',
        drillIds: ['pass-8', 'pass-10', 'pass-18'],
        xpRequired: 350,
        unlockReward: 200,
      },
      {
        level: 4,
        title: 'Crossing',
        description: 'Deliver dangerous balls',
        drillIds: ['pass-7', 'pass-15'],
        xpRequired: 550,
        unlockReward: 250,
      },
      {
        level: 5,
        title: 'Long Balls',
        description: 'Switch play effectively',
        drillIds: ['pass-3', 'pass-11'],
        xpRequired: 800,
        unlockReward: 300,
      },
      {
        level: 6,
        title: 'Through Balls',
        description: 'Thread killer passes',
        drillIds: ['pass-4', 'pass-16'],
        xpRequired: 1100,
        unlockReward: 350,
      },
      {
        level: 7,
        title: 'Deception',
        description: 'Fool defenders with your passing',
        drillIds: ['pass-6', 'pass-12'],
        xpRequired: 1450,
        unlockReward: 400,
      },
      {
        level: 8,
        title: 'Flair Passing',
        description: 'Add style to your game',
        drillIds: ['pass-14', 'pass-12'],
        xpRequired: 1850,
        unlockReward: 500,
      },
      {
        level: 9,
        title: 'Playmaker',
        description: 'Control the game like a maestro',
        drillIds: ['pass-9', 'pass-16', 'pass-11'],
        xpRequired: 2300,
        unlockReward: 600,
      },
    ],
  },
  {
    id: 'speed',
    title: 'Speed Mastery',
    description: 'Become the fastest on the pitch',
    icon: '⚡',
    color: '#F1C40F',
    totalLevels: 8,
    levels: [
      {
        level: 1,
        title: 'Acceleration',
        description: 'Explosive first steps',
        drillIds: ['speed-3', 'speed-1', 'speed-12'],
        xpRequired: 0,
        unlockReward: 100,
      },
      {
        level: 2,
        title: 'Reactions',
        description: 'React faster than anyone',
        drillIds: ['speed-6', 'speed-12'],
        xpRequired: 150,
        unlockReward: 150,
      },
      {
        level: 3,
        title: 'Ball Speed',
        description: 'Dribble at full pace',
        drillIds: ['speed-5', 'speed-9'],
        xpRequired: 350,
        unlockReward: 200,
      },
      {
        level: 4,
        title: 'Agility',
        description: 'Change direction quickly',
        drillIds: ['speed-2', 'speed-4', 'speed-13'],
        xpRequired: 550,
        unlockReward: 250,
      },
      {
        level: 5,
        title: 'Top Speed',
        description: 'Reach maximum velocity',
        drillIds: ['speed-7', 'speed-10'],
        xpRequired: 800,
        unlockReward: 300,
      },
      {
        level: 6,
        title: 'Recovery Runs',
        description: 'Sprint back to defend',
        drillIds: ['speed-11', 'speed-13'],
        xpRequired: 1100,
        unlockReward: 400,
      },
      {
        level: 7,
        title: 'Attack Patterns',
        description: 'Perfect your attacking runs',
        drillIds: ['speed-14', 'speed-9'],
        xpRequired: 1450,
        unlockReward: 450,
      },
      {
        level: 8,
        title: 'Match Fitness',
        description: 'Maintain speed for 90 mins',
        drillIds: ['speed-8', 'speed-10', 'speed-14'],
        xpRequired: 1850,
        unlockReward: 550,
      },
    ],
  },
  {
    id: 'defense',
    title: 'Defense Mastery',
    description: 'Become an unbeatable defender',
    icon: '🛡️',
    color: '#27AE60',
    totalLevels: 8,
    levels: [
      {
        level: 1,
        title: 'Stance & Position',
        description: 'Learn defensive basics',
        drillIds: ['def-1', 'def-8', 'def-13'],
        xpRequired: 0,
        unlockReward: 100,
      },
      {
        level: 2,
        title: 'Tackling',
        description: 'Win the ball cleanly',
        drillIds: ['def-4', 'def-10'],
        xpRequired: 150,
        unlockReward: 150,
      },
      {
        level: 3,
        title: 'Interceptions',
        description: 'Read the game',
        drillIds: ['def-3', 'def-5'],
        xpRequired: 350,
        unlockReward: 200,
      },
      {
        level: 4,
        title: 'Pressing',
        description: 'Win the ball high',
        drillIds: ['def-7', 'def-9'],
        xpRequired: 550,
        unlockReward: 250,
      },
      {
        level: 5,
        title: 'Recovery',
        description: 'Never get beaten',
        drillIds: ['def-6', 'def-12'],
        xpRequired: 800,
        unlockReward: 300,
      },
      {
        level: 6,
        title: 'Advanced Tackling',
        description: 'Master last-ditch defending',
        drillIds: ['def-11', 'def-4'],
        xpRequired: 1100,
        unlockReward: 400,
      },
      {
        level: 7,
        title: 'Team Defense',
        description: 'Organize your backline',
        drillIds: ['def-14', 'def-9'],
        xpRequired: 1450,
        unlockReward: 450,
      },
      {
        level: 8,
        title: '1v1 Mastery',
        description: 'Win every duel',
        drillIds: ['def-2', 'def-11', 'def-12'],
        xpRequired: 1850,
        unlockReward: 550,
      },
    ],
  },
  {
    id: 'fitness',
    title: 'Fitness Mastery',
    description: 'Build elite match fitness',
    icon: '💪',
    color: '#E74C3C',
    totalLevels: 9,
    levels: [
      {
        level: 1,
        title: 'Warm-Up',
        description: 'Prepare your body',
        drillIds: ['fit-5', 'fit-10', 'fit-15'],
        xpRequired: 0,
        unlockReward: 80,
      },
      {
        level: 2,
        title: 'Core Strength',
        description: 'Build a stable core',
        drillIds: ['fit-2', 'fit-11'],
        xpRequired: 120,
        unlockReward: 120,
      },
      {
        level: 3,
        title: 'Upper Body',
        description: 'Strength for battles',
        drillIds: ['fit-8', 'fit-12'],
        xpRequired: 250,
        unlockReward: 150,
      },
      {
        level: 4,
        title: 'HIIT Training',
        description: 'High intensity intervals',
        drillIds: ['fit-1', 'fit-13'],
        xpRequired: 450,
        unlockReward: 200,
      },
      {
        level: 5,
        title: 'Endurance',
        description: 'Last the full 90',
        drillIds: ['fit-3', 'fit-9'],
        xpRequired: 700,
        unlockReward: 300,
      },
      {
        level: 6,
        title: 'Injury Prevention',
        description: 'Stay healthy and strong',
        drillIds: ['fit-16', 'fit-12'],
        xpRequired: 1000,
        unlockReward: 350,
      },
      {
        level: 7,
        title: 'Power',
        description: 'Explosive movements',
        drillIds: ['fit-4', 'fit-7'],
        xpRequired: 1350,
        unlockReward: 400,
      },
      {
        level: 8,
        title: 'Recovery',
        description: 'Train smart, recover well',
        drillIds: ['fit-6', 'fit-12'],
        xpRequired: 1700,
        unlockReward: 450,
      },
      {
        level: 9,
        title: 'Peak Fitness',
        description: 'Elite match fitness achieved',
        drillIds: ['fit-7', 'fit-13', 'fit-14'],
        xpRequired: 2100,
        unlockReward: 550,
      },
    ],
  },
];

export function getSkillMasteryPath(skillId: TrainingGoal): SkillMasteryPath | undefined {
  return SKILL_MASTERY_PATHS.find(p => p.id === skillId);
}

export function getCurrentSkillLevel(
  skillId: TrainingGoal,
  completedDrills: string[]
): { currentLevel: number; progress: number; drillsCompleted: number; totalDrills: number } {
  const path = getSkillMasteryPath(skillId);
  if (!path) return { currentLevel: 1, progress: 0, drillsCompleted: 0, totalDrills: 0 };

  let currentLevel = 1;
  let drillsCompletedInPath = 0;
  let totalDrillsInPath = 0;

  for (const level of path.levels) {
    totalDrillsInPath += level.drillIds.length;
    const levelDrillsCompleted = level.drillIds.filter(id => completedDrills.includes(id)).length;
    drillsCompletedInPath += levelDrillsCompleted;

    if (levelDrillsCompleted === level.drillIds.length) {
      currentLevel = Math.min(level.level + 1, path.totalLevels);
    }
  }

  const progress = totalDrillsInPath > 0 ? Math.round((drillsCompletedInPath / totalDrillsInPath) * 100) : 0;

  return {
    currentLevel,
    progress,
    drillsCompleted: drillsCompletedInPath,
    totalDrills: totalDrillsInPath,
  };
}

export function isLevelUnlocked(
  skillId: TrainingGoal,
  levelNumber: number,
  completedDrills: string[]
): boolean {
  if (levelNumber === 1) return true;

  const path = getSkillMasteryPath(skillId);
  if (!path) return false;

  const previousLevel = path.levels.find(l => l.level === levelNumber - 1);
  if (!previousLevel) return false;

  return previousLevel.drillIds.every(id => completedDrills.includes(id));
}

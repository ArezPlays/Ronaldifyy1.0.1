import { Position, TrainingGoal, SkillLevel } from '@/types/user';

export interface Drill {
  id: string;
  title: string;
  description: string;
  duration: number;
  difficulty: 'easy' | 'medium' | 'hard';
  category: TrainingGoal;
  positions: Position[];
  isPro: boolean;
  equipment: string[];
  steps: string[];
}

export const DRILLS: Drill[] = [
  {
    id: 'drill-1',
    title: 'Close Control Mastery',
    description: 'Master tight space dribbling with quick touches',
    duration: 10,
    difficulty: 'easy',
    category: 'dribbling',
    positions: ['ST', 'LW', 'RW', 'CAM', 'CM'],
    isPro: false,
    equipment: ['Ball', 'Cones'],
    steps: ['Set up 5 cones in a line', 'Dribble through using inside/outside of foot', 'Increase speed gradually'],
  },
  {
    id: 'drill-2',
    title: 'Target Finishing',
    description: 'Improve shot accuracy with target practice',
    duration: 15,
    difficulty: 'medium',
    category: 'shooting',
    positions: ['ST', 'LW', 'RW', 'CAM'],
    isPro: false,
    equipment: ['Ball', 'Goal', 'Targets'],
    steps: ['Place targets in corners of goal', 'Take 10 shots from edge of box', 'Aim for different targets each time'],
  },
  {
    id: 'drill-3',
    title: 'One-Two Passing',
    description: 'Quick combination play with wall passes',
    duration: 12,
    difficulty: 'easy',
    category: 'passing',
    positions: ['CM', 'CAM', 'CDM', 'ST'],
    isPro: false,
    equipment: ['Ball', 'Wall or Partner'],
    steps: ['Pass to wall/partner', 'Move into space', 'Receive return pass', 'Repeat at pace'],
  },
  {
    id: 'drill-4',
    title: 'Explosive Sprint Series',
    description: 'Build explosive acceleration and top speed',
    duration: 20,
    difficulty: 'hard',
    category: 'speed',
    positions: ['ST', 'LW', 'RW', 'LB', 'RB'],
    isPro: false,
    equipment: ['Cones'],
    steps: ['10m sprint x 5', '20m sprint x 5', '40m sprint x 3', 'Rest 30s between sprints'],
  },
  {
    id: 'drill-5',
    title: 'Defensive Positioning',
    description: 'Learn to read the game and position yourself',
    duration: 15,
    difficulty: 'medium',
    category: 'defense',
    positions: ['CB', 'CDM', 'LB', 'RB'],
    isPro: false,
    equipment: ['Cones', 'Ball'],
    steps: ['Set up defensive zone', 'Practice jockeying', 'Work on body positioning'],
  },
  {
    id: 'drill-6',
    title: 'HIIT Football Circuit',
    description: 'High intensity interval training with ball',
    duration: 25,
    difficulty: 'hard',
    category: 'fitness',
    positions: ['ST', 'LW', 'RW', 'CAM', 'CM', 'CDM', 'LB', 'RB', 'CB', 'GK'],
    isPro: false,
    equipment: ['Ball', 'Cones'],
    steps: ['40s work, 20s rest', 'Ball touches, sprints, burpees', '5 rounds'],
  },
  {
    id: 'drill-7',
    title: 'Power Knuckleball',
    description: 'Master the knuckleball and power shooting technique',
    duration: 20,
    difficulty: 'hard',
    category: 'shooting',
    positions: ['ST', 'LW', 'RW', 'CAM'],
    isPro: true,
    equipment: ['Ball', 'Goal'],
    steps: ['Lock ankle on strike', 'Hit through center of ball', 'Minimal follow-through for knuckle effect'],
  },
  {
    id: 'drill-8',
    title: 'Skill Moves Masterclass',
    description: 'Learn advanced skill moves like the pros',
    duration: 25,
    difficulty: 'hard',
    category: 'dribbling',
    positions: ['ST', 'LW', 'RW', 'CAM'],
    isPro: true,
    equipment: ['Ball', 'Cones'],
    steps: ['Stepover variations', 'Elastico', 'Cruyff turn', 'Combine in sequences'],
  },
  {
    id: 'drill-9',
    title: 'Vision & Through Balls',
    description: 'Develop playmaking vision like the best',
    duration: 20,
    difficulty: 'hard',
    category: 'passing',
    positions: ['CAM', 'CM', 'CDM'],
    isPro: true,
    equipment: ['Ball', 'Cones', 'Partner'],
    steps: ['Scan before receiving', 'Weight the pass correctly', 'Practice disguised passes'],
  },
  {
    id: 'drill-10',
    title: 'Agility Ladder Drills',
    description: 'Improve footwork and quick direction changes',
    duration: 15,
    difficulty: 'medium',
    category: 'speed',
    positions: ['ST', 'LW', 'RW', 'LB', 'RB', 'CM'],
    isPro: true,
    equipment: ['Agility Ladder'],
    steps: ['In-in-out-out pattern', 'Lateral shuffles', 'Icky shuffle', 'Combine patterns'],
  },
  {
    id: 'drill-11',
    title: '1v1 Defending',
    description: 'Master the art of isolated defending',
    duration: 20,
    difficulty: 'hard',
    category: 'defense',
    positions: ['CB', 'CDM', 'LB', 'RB'],
    isPro: true,
    equipment: ['Ball', 'Cones'],
    steps: ['Stay on your feet', 'Show attacker one way', 'Time your tackle'],
  },
  {
    id: 'drill-12',
    title: 'Match Stamina Builder',
    description: '90-minute match fitness conditioning',
    duration: 30,
    difficulty: 'hard',
    category: 'fitness',
    positions: ['ST', 'LW', 'RW', 'CAM', 'CM', 'CDM', 'LB', 'RB', 'CB', 'GK'],
    isPro: true,
    equipment: ['Cones'],
    steps: ['Interval running', 'Tempo changes', 'Recovery periods'],
  },
];

export function getRecommendedDrills(
  position: Position | null,
  goals: TrainingGoal[],
  skillLevel: SkillLevel | null,
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
    filtered = filtered.filter(d => d.difficulty !== 'hard');
  }
  
  return filtered.slice(0, limit);
}

export function getDrillsByCategory(category: TrainingGoal): Drill[] {
  return DRILLS.filter(d => d.category === category);
}

export function getDrillsByPosition(position: Position): Drill[] {
  return DRILLS.filter(d => d.positions.includes(position));
}

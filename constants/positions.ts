import { Position } from '@/types/user';

export interface PositionOption {
  id: Position;
  label: string;
  shortLabel: string;
  description: string;
  category: 'attack' | 'midfield' | 'defense' | 'goalkeeper';
}

export const POSITIONS: PositionOption[] = [
  { id: 'ST', label: 'Striker', shortLabel: 'ST', description: 'Lead the attack and score goals', category: 'attack' },
  { id: 'LW', label: 'Left Winger', shortLabel: 'LW', description: 'Attack from the left flank', category: 'attack' },
  { id: 'RW', label: 'Right Winger', shortLabel: 'RW', description: 'Attack from the right flank', category: 'attack' },
  { id: 'CAM', label: 'Attacking Midfielder', shortLabel: 'CAM', description: 'Create chances and link play', category: 'midfield' },
  { id: 'CM', label: 'Central Midfielder', shortLabel: 'CM', description: 'Control the game from the middle', category: 'midfield' },
  { id: 'CDM', label: 'Defensive Midfielder', shortLabel: 'CDM', description: 'Shield the defense', category: 'midfield' },
  { id: 'LB', label: 'Left Back', shortLabel: 'LB', description: 'Defend and attack on the left', category: 'defense' },
  { id: 'RB', label: 'Right Back', shortLabel: 'RB', description: 'Defend and attack on the right', category: 'defense' },
  { id: 'CB', label: 'Center Back', shortLabel: 'CB', description: 'Anchor the defense', category: 'defense' },
  { id: 'GK', label: 'Goalkeeper', shortLabel: 'GK', description: 'Last line of defense', category: 'goalkeeper' },
];

export const POSITION_CATEGORIES = [
  { id: 'attack', label: 'Attack', color: '#FF6B6B' },
  { id: 'midfield', label: 'Midfield', color: '#4ECDC4' },
  { id: 'defense', label: 'Defense', color: '#45B7D1' },
  { id: 'goalkeeper', label: 'Goalkeeper', color: '#96CEB4' },
];

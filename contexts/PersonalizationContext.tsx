import { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { Position, SkillLevel, TrainingGoal } from '@/types/user';

export interface PersonalizationData {
  name: string;
  age: number | null;
  position: Position | null;
  skillLevel: SkillLevel | null;
  goals: TrainingGoal[];
}

const PERSONALIZATION_KEY = '@ronaldify_personalization';
const PERSONALIZATION_COMPLETED_KEY = '@ronaldify_personalization_completed';

export const [PersonalizationProvider, usePersonalization] = createContextHook(() => {
  const [data, setData] = useState<PersonalizationData>({
    name: '',
    age: null,
    position: null,
    skillLevel: null,
    goals: [],
  });
  const [isCompleted, setIsCompleted] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadPersonalization = useCallback(async () => {
    try {
      setIsLoading(true);
      const [storedData, completed] = await Promise.all([
        AsyncStorage.getItem(PERSONALIZATION_KEY),
        AsyncStorage.getItem(PERSONALIZATION_COMPLETED_KEY),
      ]);
      
      if (storedData) {
        setData(JSON.parse(storedData));
      }
      setIsCompleted(completed === 'true');
    } catch (error) {
      console.log('Error loading personalization:', error);
      setIsCompleted(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updatePersonalization = useCallback(async (updates: Partial<PersonalizationData>) => {
    const newData = { ...data, ...updates };
    setData(newData);
    await AsyncStorage.setItem(PERSONALIZATION_KEY, JSON.stringify(newData));
    console.log('Personalization updated:', updates);
  }, [data]);

  const completePersonalization = useCallback(async () => {
    await AsyncStorage.setItem(PERSONALIZATION_COMPLETED_KEY, 'true');
    setIsCompleted(true);
    console.log('Personalization completed');
  }, []);

  const resetPersonalization = useCallback(async () => {
    await AsyncStorage.multiRemove([PERSONALIZATION_KEY, PERSONALIZATION_COMPLETED_KEY]);
    setData({
      name: '',
      age: null,
      position: null,
      skillLevel: null,
      goals: [],
    });
    setIsCompleted(false);
  }, []);

  const getPersonalizationData = useCallback(() => data, [data]);

  return {
    data,
    isCompleted,
    isLoading,
    loadPersonalization,
    updatePersonalization,
    completePersonalization,
    resetPersonalization,
    getPersonalizationData,
  };
});

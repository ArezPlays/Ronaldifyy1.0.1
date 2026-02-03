import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { UserProfile, OnboardingData } from '@/types/user';
import { useAuth } from './AuthContext';

const USER_STORAGE_KEY = '@ronaldify_user_profile';

export const [UserProvider, useUser] = createContextHook(() => {
  const { user: authUser, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUserProfileCallback = useCallback(async (uid: string) => {
    try {
      setIsLoading(true);
      const stored = await AsyncStorage.getItem(`${USER_STORAGE_KEY}_${uid}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        setProfile({
          ...parsed,
          createdAt: new Date(parsed.createdAt),
          updatedAt: new Date(parsed.updatedAt),
        });
      } else if (authUser) {
        const newProfile: UserProfile = {
          uid: authUser.uid,
          name: authUser.displayName || '',
          email: authUser.email,
          age: null,
          position: null,
          skillLevel: null,
          goals: [],
          onboardingCompleted: false,
          hasSeenWelcome: false,
          subscriptionStatus: 'free',
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        setProfile(newProfile);
        await saveProfileToStorage(newProfile);
      }
    } catch (error) {
      console.log('Error loading user profile:', error);
    } finally {
      setIsLoading(false);
    }
  }, [authUser]);

  useEffect(() => {
    if (isAuthenticated && authUser) {
      loadUserProfileCallback(authUser.uid);
    } else {
      setProfile(null);
      setIsLoading(false);
    }
  }, [isAuthenticated, authUser, loadUserProfileCallback]);

  const saveProfileToStorage = async (profileData: UserProfile) => {
    try {
      await AsyncStorage.setItem(
        `${USER_STORAGE_KEY}_${profileData.uid}`,
        JSON.stringify(profileData)
      );
    } catch (error) {
      console.log('Error saving profile:', error);
    }
  };

  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    if (!profile) return;
    
    const updatedProfile: UserProfile = {
      ...profile,
      ...updates,
      updatedAt: new Date(),
    };
    
    setProfile(updatedProfile);
    await saveProfileToStorage(updatedProfile);
    console.log('Profile updated:', updates);
  }, [profile]);

  const completeOnboarding = useCallback(async (data: OnboardingData) => {
    if (!profile) return;
    
    const updatedProfile: UserProfile = {
      ...profile,
      position: data.position,
      skillLevel: data.skillLevel,
      goals: data.goals,
      onboardingCompleted: true,
      updatedAt: new Date(),
    };
    
    setProfile(updatedProfile);
    await saveProfileToStorage(updatedProfile);
    console.log('Onboarding completed:', data);
  }, [profile]);

  const resetProfile = useCallback(async () => {
    if (!profile) return;
    
    await AsyncStorage.removeItem(`${USER_STORAGE_KEY}_${profile.uid}`);
    setProfile(null);
  }, [profile]);

  return {
    profile,
    isLoading,
    onboardingCompleted: profile?.onboardingCompleted ?? false,
    hasSeenWelcome: profile?.hasSeenWelcome ?? false,
    updateProfile,
    completeOnboarding,
    resetProfile,
  };
});

import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';

let AppleAuthentication: any = null;
let modulesLoaded = false;

function loadModules() {
  if (modulesLoaded) return;
  modulesLoaded = true;

  try {
    AppleAuthentication = require('expo-apple-authentication');
    console.log('[Auth] expo-apple-authentication loaded');
  } catch (e: any) {
    console.log('[Auth] expo-apple-authentication load error:', e?.message);
  }
}

try {
  loadModules();
} catch (e: any) {
  console.log('[Auth] Module loading failed entirely:', e?.message);
}

export interface AuthUser {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  provider: 'apple' | 'guest';
}

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AUTH_STORAGE_KEY = '@ronaldify_auth_user';
const APPLE_CREDENTIALS_KEY = '@ronaldify_apple_credentials';

async function getStoredAppleCredentials(appleUserId: string): Promise<{ email: string | null; displayName: string | null }> {
  try {
    const stored = await AsyncStorage.getItem(`${APPLE_CREDENTIALS_KEY}_${appleUserId}`);
    if (stored) {
      const parsed = JSON.parse(stored);
      console.log('[AppleAuth] Found stored Apple credentials for', appleUserId, parsed);
      return parsed;
    }
  } catch (e) {
    console.log('[AppleAuth] Error reading stored Apple credentials:', e);
  }
  return { email: null, displayName: null };
}

async function saveAppleCredentials(appleUserId: string, email: string | null, displayName: string | null) {
  try {
    const existing = await getStoredAppleCredentials(appleUserId);
    const merged = {
      email: email || existing.email,
      displayName: displayName || existing.displayName,
    };
    await AsyncStorage.setItem(`${APPLE_CREDENTIALS_KEY}_${appleUserId}`, JSON.stringify(merged));
    console.log('[AppleAuth] Saved Apple credentials for', appleUserId, merged);
  } catch (e) {
    console.log('[AppleAuth] Error saving Apple credentials:', e);
  }
}

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    loadStoredUser();
  }, []);

  const saveAndSetUser = async (user: AuthUser) => {
    await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    console.log('[Auth] User saved to storage:', user.email, 'provider:', user.provider);
    setState({ user, isLoading: false, isAuthenticated: true });
  };

  const loadStoredUser = async () => {
    try {
      const storedUser = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      if (storedUser) {
        const user = JSON.parse(storedUser) as AuthUser;
        setState({ user, isLoading: false, isAuthenticated: true });
        console.log('[Auth] Restored user from storage:', user.email, 'provider:', user.provider);
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.log('[Auth] Error loading stored user:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const signInWithApple = useCallback(async (): Promise<AuthUser> => {
    console.log('[AppleAuth] Starting Apple Sign In...');

    if (Platform.OS === 'web' || !AppleAuthentication) {
      console.log('[AppleAuth] Apple Sign In not available on this platform');
      throw new Error('Apple Sign In is not available on this platform');
    }

    try {
      const isAvailable = await AppleAuthentication.isAvailableAsync();
      console.log('[AppleAuth] Apple Sign In available:', isAvailable);

      if (!isAvailable) {
        throw new Error('Apple Sign In is not available on this device');
      }

      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      console.log('[AppleAuth] Apple credential received:', {
        user: credential.user,
        email: credential.email,
        fullName: credential.fullName,
      });

      const freshName = credential.fullName
        ? [credential.fullName.givenName, credential.fullName.familyName]
            .filter(Boolean)
            .join(' ') || null
        : null;

      const freshEmail = credential.email || null;

      const storedCreds = await getStoredAppleCredentials(credential.user);

      const storedAuthUser = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      let previousName: string | null = null;
      let previousEmail: string | null = null;
      if (storedAuthUser) {
        const parsed = JSON.parse(storedAuthUser) as AuthUser;
        if (parsed.uid === credential.user) {
          if (parsed.displayName && parsed.displayName !== 'Apple User') {
            previousName = parsed.displayName;
          }
          if (parsed.email && parsed.email !== 'private@apple.com' && parsed.email !== '') {
            previousEmail = parsed.email;
          }
        }
      }

      const resolvedName = freshName || storedCreds.displayName || previousName;
      const resolvedEmail = freshEmail || storedCreds.email || previousEmail;

      await saveAppleCredentials(credential.user, resolvedEmail, resolvedName);

      const user: AuthUser = {
        uid: credential.user,
        email: resolvedEmail || '',
        displayName: resolvedName || null,
        photoURL: null,
        provider: 'apple',
      };
      await saveAndSetUser(user);
      console.log('[AppleAuth] Success - name:', user.displayName, 'email:', user.email);
      return user;
    } catch (error: any) {
      console.log('[AppleAuth] Error:', error);
      if (error.code === 'ERR_REQUEST_CANCELED') {
        throw new Error('Sign in was cancelled');
      }
      throw error;
    }
  }, []);

  const continueAsGuest = useCallback(async (personalizationName?: string): Promise<AuthUser> => {
    console.log('[GuestAuth] Continuing as guest, name:', personalizationName);
    const guestId = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    const user: AuthUser = {
      uid: guestId,
      email: '',
      displayName: personalizationName || 'Player',
      photoURL: null,
      provider: 'guest',
    };
    await saveAndSetUser(user);
    console.log('[GuestAuth] Guest user created:', guestId, 'name:', user.displayName);
    return user;
  }, []);

  const signOut = useCallback(async () => {
    console.log('[Auth] Signing out...');
    await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
    setState({ user: null, isLoading: false, isAuthenticated: false });
  }, []);

  const isGuest = state.user?.provider === 'guest';

  return {
    ...state,
    isGuest,
    signInWithApple,
    continueAsGuest,
    signOut,
  };
});

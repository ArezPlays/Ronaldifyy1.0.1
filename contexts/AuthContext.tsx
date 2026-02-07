import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from '@/lib/firebase';

WebBrowser.maybeCompleteAuthSession();

export interface AuthUser {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  provider: 'apple' | 'google' | 'email';
}

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AUTH_STORAGE_KEY = '@ronaldify_auth_user';

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  const [_request, response, promptAsync] = Google.useAuthRequest({
    iosClientId: '199378159937-1m8jsjuoaqinilha19nnlik3rpbba7q9.apps.googleusercontent.com',
    androidClientId: '199378159937-rspmgvphvs92sbmdfnhbp9m6719pmbkj.apps.googleusercontent.com',
    webClientId: process.env.EXPO_PUBLIC_FIREBASE_WEB_CLIENT_ID,
  });

  useEffect(() => {
    loadStoredUser();
  }, []);

  useEffect(() => {
    if (response?.type === 'success') {
      console.log('[GoogleAuth] Auth response success, processing...');
      const { id_token } = response.params;
      if (id_token) {
        handleGoogleFirebaseLogin(id_token);
      } else {
        console.log('[GoogleAuth] No id_token in response params:', JSON.stringify(response.params));
      }
    } else if (response) {
      console.log('[GoogleAuth] Auth response type:', response.type);
    }
  }, [response]);

  const handleGoogleFirebaseLogin = async (idToken: string) => {
    try {
      console.log('[GoogleAuth] Signing into Firebase with id_token...');
      const credential = GoogleAuthProvider.credential(idToken);
      const result = await signInWithCredential(auth, credential);
      const firebaseUser = result.user;

      console.log('[GoogleAuth] Firebase sign-in successful:', {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
      });

      const user: AuthUser = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || 'unknown@gmail.com',
        displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Google User',
        photoURL: firebaseUser.photoURL || null,
        provider: 'google',
      };

      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      console.log('[GoogleAuth] User saved to storage');

      setState({
        user,
        isLoading: false,
        isAuthenticated: true,
      });
    } catch (error: any) {
      console.log('[GoogleAuth] Firebase credential error:', error?.message || error);
      console.log('[GoogleAuth] Firebase error code:', error?.code);
    }
  };

  const loadStoredUser = async () => {
    try {
      const storedUser = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      if (storedUser) {
        const user = JSON.parse(storedUser) as AuthUser;
        setState({
          user,
          isLoading: false,
          isAuthenticated: true,
        });
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.log('Error loading stored user:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const signInWithApple = useCallback(async (): Promise<AuthUser> => {
    console.log('Starting Apple Sign In...');
    
    if (Platform.OS === 'web') {
      console.log('Apple Sign In not available on web, using fallback');
      const fallbackUser: AuthUser = {
        uid: `apple_web_${Date.now()}`,
        email: 'user@icloud.com',
        displayName: 'Apple User',
        photoURL: null,
        provider: 'apple',
      };
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(fallbackUser));
      setState({
        user: fallbackUser,
        isLoading: false,
        isAuthenticated: true,
      });
      return fallbackUser;
    }

    try {
      const isAvailable = await AppleAuthentication.isAvailableAsync();
      console.log('Apple Sign In available:', isAvailable);
      
      if (!isAvailable) {
        throw new Error('Apple Sign In is not available on this device');
      }

      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      console.log('Apple credential received:', {
        user: credential.user,
        email: credential.email,
        fullName: credential.fullName,
      });

      const displayName = credential.fullName
        ? [credential.fullName.givenName, credential.fullName.familyName]
            .filter(Boolean)
            .join(' ') || null
        : null;

      const storedUser = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      let existingName: string | null = null;
      if (storedUser) {
        const parsed = JSON.parse(storedUser) as AuthUser;
        if (parsed.uid === credential.user && parsed.displayName) {
          existingName = parsed.displayName;
        }
      }

      const user: AuthUser = {
        uid: credential.user,
        email: credential.email || 'private@apple.com',
        displayName: displayName || existingName || 'Apple User',
        photoURL: null,
        provider: 'apple',
      };

      console.log('Saving Apple user:', user);
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      
      setState({
        user,
        isLoading: false,
        isAuthenticated: true,
      });

      return user;
    } catch (error: any) {
      console.log('Apple Sign In error:', error);
      
      if (error.code === 'ERR_REQUEST_CANCELED') {
        throw new Error('Sign in was cancelled');
      }
      
      throw error;
    }
  }, []);

  const signInWithGoogle = useCallback(async (): Promise<AuthUser> => {
    console.log('[GoogleAuth] Starting Firebase Google Sign In...');
    console.log('[GoogleAuth] Platform:', Platform.OS);

    try {
      const result = await promptAsync();
      console.log('[GoogleAuth] promptAsync result type:', result?.type);

      if (result?.type === 'cancel' || result?.type === 'dismiss') {
        throw new Error('Sign in was cancelled');
      }

      if (result?.type !== 'success') {
        throw new Error('Authentication failed');
      }

      return new Promise<AuthUser>((resolve, reject) => {
        const checkInterval = setInterval(async () => {
          const stored = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
          if (stored) {
            const parsed = JSON.parse(stored) as AuthUser;
            if (parsed.provider === 'google') {
              clearInterval(checkInterval);
              resolve(parsed);
            }
          }
        }, 200);

        setTimeout(() => {
          clearInterval(checkInterval);
          reject(new Error('Google sign-in timed out'));
        }, 15000);
      });
    } catch (error: any) {
      console.log('[GoogleAuth] Error:', error?.message || error);
      throw error;
    }
  }, [promptAsync]);

  const signInWithEmail = useCallback(async (email: string, password: string): Promise<AuthUser> => {
    console.log('Signing in with email:', email);
    if (!email || !password) {
      throw new Error('Email and password are required');
    }
    
    const mockUser: AuthUser = {
      uid: `email_${Date.now()}`,
      email,
      displayName: email.split('@')[0],
      photoURL: null,
      provider: 'email',
    };
    
    await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(mockUser));
    setState({
      user: mockUser,
      isLoading: false,
      isAuthenticated: true,
    });
    
    return mockUser;
  }, []);

  const signUpWithEmail = useCallback(async (email: string, password: string, name: string): Promise<AuthUser> => {
    console.log('Signing up with email:', email);
    if (!email || !password || !name) {
      throw new Error('Email, password, and name are required');
    }
    
    const mockUser: AuthUser = {
      uid: `email_${Date.now()}`,
      email,
      displayName: name,
      photoURL: null,
      provider: 'email',
    };
    
    await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(mockUser));
    setState({
      user: mockUser,
      isLoading: false,
      isAuthenticated: true,
    });
    
    return mockUser;
  }, []);

  const signOut = useCallback(async () => {
    console.log('Signing out...');
    await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
    setState({
      user: null,
      isLoading: false,
      isAuthenticated: false,
    });
  }, []);

  return {
    ...state,
    signInWithApple,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOut,
  };
});

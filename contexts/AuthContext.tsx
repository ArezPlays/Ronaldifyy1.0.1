import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { makeRedirectUri } from 'expo-auth-session';
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

const GOOGLE_CLIENT_ID_WEB = '199378159937-rspmgvphvs92sbmdfnhbp9m6719pmbkj.apps.googleusercontent.com';
const GOOGLE_CLIENT_ID_IOS = '199378159937-1m8jsjuoaqinilha19nnlik3rpbba7q9.apps.googleusercontent.com';
const GOOGLE_CLIENT_ID_ANDROID = '199378159937-ulffcp9qvnuktuqstg4u5j3qgqjqtv5i.apps.googleusercontent.com';

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    loadStoredUser();
  }, []);

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

  const googleRedirectUri = makeRedirectUri({
    scheme: 'rork-app',
    path: 'redirect',
  });

  console.log('[GoogleAuth] Redirect URI:', googleRedirectUri);

  const [, googleResponse, googlePromptAsync] = Google.useAuthRequest({
    webClientId: GOOGLE_CLIENT_ID_WEB,
    iosClientId: GOOGLE_CLIENT_ID_IOS,
    androidClientId: GOOGLE_CLIENT_ID_ANDROID,
    scopes: ['openid', 'profile', 'email'],
    redirectUri: googleRedirectUri,
  });

  const processGoogleResponse = useCallback(async (authentication: { accessToken: string }): Promise<AuthUser> => {
    console.log('[GoogleAuth] Fetching user info with access token...');
    const userInfoResponse = await fetch(
      'https://www.googleapis.com/oauth2/v2/userinfo',
      { headers: { Authorization: `Bearer ${authentication.accessToken}` } }
    );

    if (!userInfoResponse.ok) {
      const errorText = await userInfoResponse.text();
      console.log('[GoogleAuth] User info fetch failed:', errorText);
      throw new Error('Failed to fetch Google user info');
    }

    const userInfo = await userInfoResponse.json();
    console.log('[GoogleAuth] User info received:', JSON.stringify({ id: userInfo.id, email: userInfo.email, name: userInfo.name }));

    const user: AuthUser = {
      uid: `google_${userInfo.id}`,
      email: userInfo.email || 'unknown@gmail.com',
      displayName: userInfo.name || userInfo.email?.split('@')[0] || 'Google User',
      photoURL: userInfo.picture || null,
      provider: 'google',
    };

    await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    console.log('[GoogleAuth] User saved successfully');

    setState({
      user,
      isLoading: false,
      isAuthenticated: true,
    });

    return user;
  }, []);

  const googleResolveRef = useCallback(() => ({ current: null as ((user: AuthUser) => void) | null }), [])();
  const googleRejectRef = useCallback(() => ({ current: null as ((error: Error) => void) | null }), [])();

  useEffect(() => {
    if (googleResponse?.type === 'success' && googleResponse.authentication?.accessToken) {
      console.log('[GoogleAuth] Got successful response, processing...');
      processGoogleResponse(googleResponse.authentication)
        .then((user) => googleResolveRef.current?.(user))
        .catch((err) => googleRejectRef.current?.(err));
    } else if (googleResponse?.type === 'cancel' || googleResponse?.type === 'dismiss') {
      console.log('[GoogleAuth] User cancelled');
      googleRejectRef.current?.(new Error('Sign in was cancelled'));
    } else if (googleResponse?.type === 'error') {
      console.log('[GoogleAuth] Error response:', googleResponse.error);
      googleRejectRef.current?.(new Error(googleResponse.error?.message || 'Google sign in failed'));
    }
  }, [googleResponse, processGoogleResponse, googleResolveRef, googleRejectRef]);

  const signInWithGoogle = useCallback(async (): Promise<AuthUser> => {
    console.log('[GoogleAuth] Starting Google Sign In...');
    console.log('[GoogleAuth] Platform:', Platform.OS);

    return new Promise<AuthUser>((resolve, reject) => {
      googleResolveRef.current = resolve;
      googleRejectRef.current = reject;
      googlePromptAsync().catch(reject);
    });
  }, [googlePromptAsync, googleResolveRef, googleRejectRef]);

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

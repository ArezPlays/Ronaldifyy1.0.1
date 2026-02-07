import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import * as Crypto from 'expo-crypto';

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

const GOOGLE_CLIENT_ID_IOS = '199378159937-1m8jsjuoaqinilha19nnlik3rpbba7q9.apps.googleusercontent.com';
const GOOGLE_CLIENT_ID_ANDROID = '199378159937-rspmgvphvs92sbmdfnhbp9m6719pmbkj.apps.googleusercontent.com';

const buildReversedClientRedirect = (clientId: string) => {
  const parts = clientId.split('.apps.googleusercontent.com')[0];
  return `com.googleusercontent.apps.${parts}:/oauth2redirect`;
};

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

  const signInWithGoogle = useCallback(async (): Promise<AuthUser> => {
    console.log('[GoogleAuth] Starting Google Sign In...');
    console.log('[GoogleAuth] Platform:', Platform.OS);

    try {
      let clientId: string;
      let redirectUri: string;

      if (Platform.OS === 'ios') {
        clientId = GOOGLE_CLIENT_ID_IOS;
        redirectUri = buildReversedClientRedirect(GOOGLE_CLIENT_ID_IOS);
      } else if (Platform.OS === 'android') {
        clientId = GOOGLE_CLIENT_ID_ANDROID;
        redirectUri = buildReversedClientRedirect(GOOGLE_CLIENT_ID_ANDROID);
      } else {
        clientId = GOOGLE_CLIENT_ID_ANDROID;
        redirectUri = AuthSession.makeRedirectUri();
      }

      console.log('[GoogleAuth] Client ID:', clientId);
      console.log('[GoogleAuth] Redirect URI:', redirectUri);

      const randomBytes = await Crypto.getRandomBytesAsync(32);
      const codeVerifier = Array.from(randomBytes)
        .map(byte => byte.toString(16).padStart(2, '0'))
        .join('')
        .slice(0, 128);
      
      const codeChallenge = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        codeVerifier,
        { encoding: Crypto.CryptoEncoding.BASE64 }
      );
      const codeChallengeFormatted = codeChallenge
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');

      const state = Crypto.randomUUID();

      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: 'openid profile email',
        code_challenge: codeChallengeFormatted,
        code_challenge_method: 'S256',
        state: state,
      }).toString()}`;

      console.log('[GoogleAuth] Full auth URL:', authUrl);

      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

      console.log('[GoogleAuth] Auth session result type:', result.type);
      if (result.type === 'success') {
        console.log('[GoogleAuth] Result URL:', result.url);
      }

      if (result.type === 'cancel' || result.type === 'dismiss') {
        throw new Error('Sign in was cancelled');
      }

      if (result.type !== 'success') {
        throw new Error('Authentication failed');
      }

      const url = result.url;
      const queryString = url.includes('?') ? url.split('?')[1] : url.split('#')[1] || '';
      const params = new URLSearchParams(queryString);
      const code = params.get('code');
      const returnedState = params.get('state');

      console.log('[GoogleAuth] Code received:', !!code);
      console.log('[GoogleAuth] State match:', returnedState === state);

      if (!code) {
        throw new Error('No authorization code received');
      }

      if (returnedState !== state) {
        throw new Error('State mismatch - possible CSRF attack');
      }

      console.log('[GoogleAuth] Exchanging code for token...');

      const tokenBody = new URLSearchParams({
        client_id: clientId,
        code: code,
        code_verifier: codeVerifier,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }).toString();

      console.log('[GoogleAuth] Token request redirect_uri:', redirectUri);

      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: tokenBody,
      });

      const tokenText = await tokenResponse.text();
      console.log('[GoogleAuth] Token response status:', tokenResponse.status);

      if (!tokenResponse.ok) {
        console.log('[GoogleAuth] Token exchange failed:', tokenText);
        throw new Error(`Token exchange failed: ${tokenText}`);
      }

      const tokenData = JSON.parse(tokenText);
      console.log('[GoogleAuth] Token exchange successful, has access_token:', !!tokenData.access_token);

      const userInfoResponse = await fetch(
        'https://www.googleapis.com/oauth2/v2/userinfo',
        { headers: { Authorization: `Bearer ${tokenData.access_token}` } }
      );

      if (!userInfoResponse.ok) {
        const errorText = await userInfoResponse.text();
        console.log('[GoogleAuth] User info fetch failed:', errorText);
        throw new Error('Failed to fetch Google user info');
      }

      const userInfo = await userInfoResponse.json();
      console.log('[GoogleAuth] User info:', JSON.stringify({ id: userInfo.id, email: userInfo.email, name: userInfo.name }));

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
    } catch (error: any) {
      console.log('[GoogleAuth] Error:', error?.message || error);
      throw error;
    }
  }, []);

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

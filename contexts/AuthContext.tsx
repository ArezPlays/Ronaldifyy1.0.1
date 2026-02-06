import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
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

const GOOGLE_CLIENT_ID_WEB = '';
const GOOGLE_CLIENT_ID_IOS = '199378159937-1m8jsjuoaqinilha19nnlik3rpbba7q9.apps.googleusercontent.com';


function getGoogleClientId() {
  if (Platform.OS === 'android') {
    return GOOGLE_CLIENT_ID_IOS;
  }
  return Platform.select({
    ios: GOOGLE_CLIENT_ID_IOS,
    default: GOOGLE_CLIENT_ID_WEB || GOOGLE_CLIENT_ID_IOS,
  });
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
    console.log('Starting Google Sign In...');
    console.log('Platform:', Platform.OS);
    
    const clientId = getGoogleClientId();
    console.log('Google Client ID available:', !!clientId);
    
    if (!clientId) {
      console.log('Google Client ID not configured, using demo mode');
      // Only use demo mode on web - on native devices, throw an error
      if (Platform.OS !== 'web') {
        throw new Error('Google Sign-In is not configured for this platform');
      }
      const demoUser: AuthUser = {
        uid: `google_demo_${Date.now()}`,
        email: 'demo@gmail.com',
        displayName: 'Demo User',
        photoURL: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100&h=100&fit=crop',
        provider: 'google',
      };
      
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(demoUser));
      setState({
        user: demoUser,
        isLoading: false,
        isAuthenticated: true,
      });
      return demoUser;
    }

    try {
      const redirectUri = Platform.OS === 'android'
        ? AuthSession.makeRedirectUri({ scheme: 'rork-app' })
        : "com.googleusercontent.apps.199378159937-1m8jsjuoaqinilha19nnlik3rpbba7q9:/oauth2redirect";
      
      console.log('Google redirect URI:', redirectUri);
      console.log('Using client ID:', clientId);
      console.log('Platform:', Platform.OS);

      const discovery = await AuthSession.fetchDiscoveryAsync('https://accounts.google.com');

      const authRequest = new AuthSession.AuthRequest({
        clientId,
        redirectUri,
        scopes: ['openid', 'profile', 'email'],
        responseType: AuthSession.ResponseType.Code,
        usePKCE: true,
      });

      const result = await authRequest.promptAsync(discovery);
      
      console.log('Google auth result type:', result.type);

      if (result.type === 'success' && result.params?.code) {
        const code = result.params.code;
        console.log('Got authorization code, exchanging for tokens...');

        const tokenResponse = await AuthSession.exchangeCodeAsync(
          {
            clientId,
            code,
            redirectUri,
            extraParams: {
              code_verifier: authRequest.codeVerifier || '',
            },
          },
          discovery
        );

        console.log('Token exchange successful');
        const accessToken = tokenResponse.accessToken;
        
        const userInfoResponse = await fetch(
          'https://www.googleapis.com/oauth2/v2/userinfo',
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
        
        const userInfo = await userInfoResponse.json();
        console.log('Google user info:', userInfo);

        const user: AuthUser = {
          uid: `google_${userInfo.id}`,
          email: userInfo.email || 'unknown@gmail.com',
          displayName: userInfo.name || userInfo.email?.split('@')[0] || 'Google User',
          photoURL: userInfo.picture || null,
          provider: 'google',
        };

        await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
        
        setState({
          user,
          isLoading: false,
          isAuthenticated: true,
        });

        return user;
      } else if (result.type === 'cancel') {
        throw new Error('Sign in was cancelled');
      } else {
        throw new Error('Google sign in failed');
      }
    } catch (error: any) {
      console.log('Google Sign In error:', error);
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

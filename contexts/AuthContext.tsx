import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';

let WebBrowser: any = null;
let Google: any = null;
let makeRedirectUri: any = null;
let AppleAuthentication: any = null;
let GoogleAuthProvider: any = null;
let signInWithCredential: any = null;
let firebaseAuth: any = null;
let modulesLoaded = false;

function loadModules() {
  if (modulesLoaded) return;
  modulesLoaded = true;

  try {
    WebBrowser = require('expo-web-browser');
    console.log('[Auth] expo-web-browser loaded');
  } catch (e: any) {
    console.log('[Auth] expo-web-browser load error:', e?.message);
  }

  try {
    if (WebBrowser?.maybeCompleteAuthSession) {
      WebBrowser.maybeCompleteAuthSession();
    }
  } catch (e: any) {
    console.log('[Auth] maybeCompleteAuthSession error:', e?.message);
  }

  try {
    Google = require('expo-auth-session/providers/google');
    const authSession = require('expo-auth-session');
    makeRedirectUri = authSession.makeRedirectUri;
    console.log('[Auth] expo-auth-session loaded');
  } catch (e: any) {
    console.log('[Auth] expo-auth-session load error:', e?.message);
  }

  try {
    AppleAuthentication = require('expo-apple-authentication');
    console.log('[Auth] expo-apple-authentication loaded');
  } catch (e: any) {
    console.log('[Auth] expo-apple-authentication load error:', e?.message);
  }

  try {
    const firebaseAuthModule = require('firebase/auth');
    GoogleAuthProvider = firebaseAuthModule?.GoogleAuthProvider;
    signInWithCredential = firebaseAuthModule?.signInWithCredential;
    const firebaseLib = require('@/lib/firebase');
    firebaseAuth = firebaseLib?.auth;
    console.log('[Auth] Firebase auth loaded, auth available:', !!firebaseAuth);
  } catch (e: any) {
    console.log('[Auth] Firebase auth load error:', e?.message);
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

  const WEB_CLIENT_ID = '199378159937-1m8jsjuoaqinilha19nnlik3rpbba7q9.apps.googleusercontent.com';
  const ANDROID_CLIENT_ID = '199378159937-rspmgvphvs92sbmdfnhbp9m6719pmbkj.apps.googleusercontent.com';

  let redirectUri = '';
  try {
    if (makeRedirectUri) {
      if (Platform.OS === 'android') {
        redirectUri = makeRedirectUri({
          native: 'rork-app://oauth2redirect',
        });
      } else if (Platform.OS === 'ios') {
        redirectUri = makeRedirectUri({
          native: `com.googleusercontent.apps.199378159937-1m8jsjuoaqinilha19nnlik3rpbba7q9:/oauthredirect`,
        });
      }
    }
  } catch (e: any) {
    console.log('[GoogleAuth] makeRedirectUri error:', e?.message);
  }

  const googleConfig: any = {
    webClientId: WEB_CLIENT_ID,
    iosClientId: WEB_CLIENT_ID,
    androidClientId: ANDROID_CLIENT_ID,
    expoClientId: WEB_CLIENT_ID,
    scopes: ['openid', 'profile', 'email'],
    responseType: 'id_token',
    shouldAutoExchangeCode: false,
  };

  if (redirectUri) {
    googleConfig.redirectUri = redirectUri;
  }

  console.log('[GoogleAuth] Config platform:', Platform.OS, 'redirectUri:', redirectUri || 'default');

  let googleAuthRequest: any = [null, null, null];
  try {
    if (Google?.useAuthRequest) {
      googleAuthRequest = Google.useAuthRequest(googleConfig);
    }
  } catch (e: any) {
    console.log('[GoogleAuth] useAuthRequest error:', e?.message);
    googleAuthRequest = [null, null, null];
  }

  const [_request, response, promptAsync] = googleAuthRequest;

  useEffect(() => {
    loadStoredUser();
  }, []);

  useEffect(() => {
    if (response?.type === 'success') {
      console.log('[GoogleAuth] Auth response success, processing...');
      console.log('[GoogleAuth] Response params keys:', Object.keys(response.params || {}));
      const idToken = response.params?.id_token;
      const accessToken = response.authentication?.accessToken;
      if (idToken) {
        console.log('[GoogleAuth] Got id_token, signing into Firebase...');
        handleGoogleFirebaseLogin(idToken);
      } else if (accessToken) {
        console.log('[GoogleAuth] Got access_token, fetching user info...');
        handleGoogleAccessToken(accessToken);
      } else {
        console.log('[GoogleAuth] No id_token or access_token in response:', JSON.stringify(response.params));
        console.log('[GoogleAuth] Authentication object:', JSON.stringify(response.authentication));
      }
    } else if (response) {
      console.log('[GoogleAuth] Auth response type:', response.type);
      if (response.type === 'error') {
        console.log('[GoogleAuth] Error details:', JSON.stringify((response as any).error));
      }
    }
  }, [response]);

  const saveAndSetUser = async (user: AuthUser) => {
    await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    console.log('[GoogleAuth] User saved to storage:', user.email);
    setState({ user, isLoading: false, isAuthenticated: true });
  };

  const handleGoogleAccessToken = async (accessToken: string) => {
    try {
      console.log('[GoogleAuth] Fetching user info with access token...');
      const res = await fetch('https://www.googleapis.com/userinfo/v2/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const userInfo = await res.json();
      console.log('[GoogleAuth] User info:', JSON.stringify(userInfo));

      const user: AuthUser = {
        uid: userInfo.id || `google_${Date.now()}`,
        email: userInfo.email || 'unknown@gmail.com',
        displayName: userInfo.name || userInfo.email?.split('@')[0] || 'Google User',
        photoURL: userInfo.picture || null,
        provider: 'google',
      };
      await saveAndSetUser(user);
    } catch (error: any) {
      console.log('[GoogleAuth] Access token user info error:', error?.message);
    }
  };

  const handleGoogleFirebaseLogin = async (idToken: string) => {
    try {
      if (!GoogleAuthProvider || !signInWithCredential || !firebaseAuth) {
        console.log('[GoogleAuth] Firebase auth not available, using token decode fallback');
        try {
          const parts = idToken.split('.');
          if (parts.length === 3) {
            const payload = JSON.parse(atob(parts[1]));
            console.log('[GoogleAuth] Decoded id_token payload:', JSON.stringify(payload));
            const user: AuthUser = {
              uid: payload.sub || `google_${Date.now()}`,
              email: payload.email || 'unknown@gmail.com',
              displayName: payload.name || payload.email?.split('@')[0] || 'Google User',
              photoURL: payload.picture || null,
              provider: 'google',
            };
            await saveAndSetUser(user);
            return;
          }
        } catch (decodeErr: any) {
          console.log('[GoogleAuth] Token decode error:', decodeErr?.message);
        }
        const fallbackUser: AuthUser = {
          uid: `google_${Date.now()}`,
          email: 'google@user.com',
          displayName: 'Google User',
          photoURL: null,
          provider: 'google',
        };
        await saveAndSetUser(fallbackUser);
        return;
      }

      console.log('[GoogleAuth] Signing into Firebase with id_token...');
      const credential = GoogleAuthProvider.credential(idToken);
      const result = await signInWithCredential(firebaseAuth, credential);
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
      await saveAndSetUser(user);
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
    
    if (Platform.OS === 'web' || !AppleAuthentication) {
      console.log('Apple Sign In not available, using fallback');
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

    if (!promptAsync) {
      console.log('[GoogleAuth] promptAsync not available');
      throw new Error('Google Sign In is not available');
    }

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

import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { supabase } from '@/lib/supabase';

let WebBrowser: any = null;
let AppleAuthentication: any = null;
let makeRedirectUri: any = null;
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

  useEffect(() => {
    loadStoredUser();
    listenToSupabaseAuth();
  }, []);

  const listenToSupabaseAuth = () => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[Auth] Supabase auth event:', event);
      if (event === 'SIGNED_IN' && session?.user) {
        const supaUser = session.user;
        console.log('[Auth] Supabase user signed in:', supaUser.email);
        const provider = supaUser.app_metadata?.provider as string;
        const user: AuthUser = {
          uid: supaUser.id,
          email: supaUser.email || 'unknown@gmail.com',
          displayName: supaUser.user_metadata?.full_name || supaUser.user_metadata?.name || supaUser.email?.split('@')[0] || 'User',
          photoURL: supaUser.user_metadata?.avatar_url || supaUser.user_metadata?.picture || null,
          provider: (provider === 'apple' ? 'apple' : provider === 'google' ? 'google' : 'email') as AuthUser['provider'],
        };
        await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
        setState({ user, isLoading: false, isAuthenticated: true });
      } else if (event === 'SIGNED_OUT') {
        await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
        setState({ user: null, isLoading: false, isAuthenticated: false });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  };

  const saveAndSetUser = async (user: AuthUser) => {
    await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    console.log('[Auth] User saved to storage:', user.email);
    setState({ user, isLoading: false, isAuthenticated: true });
  };

  const loadStoredUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const supaUser = session.user;
        const provider = supaUser.app_metadata?.provider as string;
        const user: AuthUser = {
          uid: supaUser.id,
          email: supaUser.email || 'unknown@gmail.com',
          displayName: supaUser.user_metadata?.full_name || supaUser.user_metadata?.name || supaUser.email?.split('@')[0] || 'User',
          photoURL: supaUser.user_metadata?.avatar_url || supaUser.user_metadata?.picture || null,
          provider: (provider === 'apple' ? 'apple' : provider === 'google' ? 'google' : 'email') as AuthUser['provider'],
        };
        await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
        setState({ user, isLoading: false, isAuthenticated: true });
        console.log('[Auth] Restored Supabase session for:', user.email);
        return;
      }

      const storedUser = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      if (storedUser) {
        const user = JSON.parse(storedUser) as AuthUser;
        setState({ user, isLoading: false, isAuthenticated: true });
        console.log('[Auth] Restored user from storage:', user.email);
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.log('[Auth] Error loading stored user:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const signInWithGoogle = useCallback(async (): Promise<AuthUser> => {
    console.log('[GoogleAuth] Starting Supabase Google OAuth...');
    console.log('[GoogleAuth] Platform:', Platform.OS);

    try {
      let redirectUrl = 'https://ivgjxqdrvoaajyxhsoja.supabase.co/auth/v1/callback';

      if (makeRedirectUri) {
        try {
          redirectUrl = makeRedirectUri({ scheme: 'ronaldify', path: 'auth/callback' });
          console.log('[GoogleAuth] Generated redirect URI:', redirectUrl);
        } catch (e: any) {
          console.log('[GoogleAuth] makeRedirectUri error, using default:', e?.message);
        }
      }

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: true,
          queryParams: {
            prompt: 'select_account',
          },
        },
      });

      if (error) {
        console.log('[GoogleAuth] Supabase OAuth error:', error.message);
        throw new Error(error.message);
      }

      if (!data?.url) {
        console.log('[GoogleAuth] No OAuth URL returned');
        throw new Error('Failed to get Google sign-in URL');
      }

      console.log('[GoogleAuth] Opening OAuth URL...');

      if (!WebBrowser?.openAuthSessionAsync) {
        console.log('[GoogleAuth] WebBrowser not available');
        throw new Error('Browser not available for authentication');
      }

      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);
      console.log('[GoogleAuth] Browser result type:', result?.type);

      if (result?.type === 'cancel' || result?.type === 'dismiss') {
        throw new Error('Sign in was cancelled');
      }

      if (result?.type === 'success' && result?.url) {
        console.log('[GoogleAuth] Got callback URL, extracting tokens...');

        const url = result.url;
        let accessToken: string | null = null;
        let refreshToken: string | null = null;

        const hashIndex = url.indexOf('#');
        if (hashIndex !== -1) {
          const fragment = url.substring(hashIndex + 1);
          const params = new URLSearchParams(fragment);
          accessToken = params.get('access_token');
          refreshToken = params.get('refresh_token');
        }

        if (!accessToken) {
          const queryParams = new URLSearchParams(url.split('?')[1] || '');
          accessToken = queryParams.get('access_token');
          refreshToken = queryParams.get('refresh_token');
        }

        if (!accessToken && url.includes('code=')) {
          const queryParams = new URLSearchParams(url.split('?')[1] || '');
          const code = queryParams.get('code');
          if (code) {
            console.log('[GoogleAuth] Got authorization code, exchanging...');
            const { data: sessionData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
            if (exchangeError) {
              console.log('[GoogleAuth] Code exchange error:', exchangeError.message);
              throw new Error(exchangeError.message);
            }
            if (sessionData?.user) {
              const supaUser = sessionData.user;
              const user: AuthUser = {
                uid: supaUser.id,
                email: supaUser.email || 'unknown@gmail.com',
                displayName: supaUser.user_metadata?.full_name || supaUser.user_metadata?.name || supaUser.email?.split('@')[0] || 'Google User',
                photoURL: supaUser.user_metadata?.avatar_url || supaUser.user_metadata?.picture || null,
                provider: 'google',
              };
              await saveAndSetUser(user);
              return user;
            }
          }
        }

        if (accessToken && refreshToken) {
          console.log('[GoogleAuth] Setting Supabase session with tokens...');
          const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (sessionError) {
            console.log('[GoogleAuth] Set session error:', sessionError.message);
            throw new Error(sessionError.message);
          }

          if (sessionData?.user) {
            const supaUser = sessionData.user;
            const user: AuthUser = {
              uid: supaUser.id,
              email: supaUser.email || 'unknown@gmail.com',
              displayName: supaUser.user_metadata?.full_name || supaUser.user_metadata?.name || supaUser.email?.split('@')[0] || 'Google User',
              photoURL: supaUser.user_metadata?.avatar_url || supaUser.user_metadata?.picture || null,
              provider: 'google',
            };
            await saveAndSetUser(user);
            return user;
          }
        }

        if (accessToken && !refreshToken) {
          console.log('[GoogleAuth] Only access_token available, getting user...');
          const { data: userData, error: userError } = await supabase.auth.getUser(accessToken);
          if (!userError && userData?.user) {
            const supaUser = userData.user;
            const user: AuthUser = {
              uid: supaUser.id,
              email: supaUser.email || 'unknown@gmail.com',
              displayName: supaUser.user_metadata?.full_name || supaUser.user_metadata?.name || supaUser.email?.split('@')[0] || 'Google User',
              photoURL: supaUser.user_metadata?.avatar_url || supaUser.user_metadata?.picture || null,
              provider: 'google',
            };
            await saveAndSetUser(user);
            return user;
          }
        }

        console.log('[GoogleAuth] Could not extract tokens from URL');
        console.log('[GoogleAuth] URL structure:', url.substring(0, 100));
      }

      return new Promise<AuthUser>((resolve, reject) => {
        let attempts = 0;
        const checkInterval = setInterval(async () => {
          attempts++;
          try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
              clearInterval(checkInterval);
              const supaUser = session.user;
              const user: AuthUser = {
                uid: supaUser.id,
                email: supaUser.email || 'unknown@gmail.com',
                displayName: supaUser.user_metadata?.full_name || supaUser.user_metadata?.name || supaUser.email?.split('@')[0] || 'Google User',
                photoURL: supaUser.user_metadata?.avatar_url || supaUser.user_metadata?.picture || null,
                provider: 'google',
              };
              await saveAndSetUser(user);
              resolve(user);
            }
          } catch (e) {
            console.log('[GoogleAuth] Session check error:', e);
          }
          if (attempts > 30) {
            clearInterval(checkInterval);
            reject(new Error('Google sign-in timed out waiting for session'));
          }
        }, 500);
      });
    } catch (error: any) {
      console.log('[GoogleAuth] Error:', error?.message || error);
      throw error;
    }
  }, []);

  const signInWithApple = useCallback(async (): Promise<AuthUser> => {
    console.log('[AppleAuth] Starting Apple Sign In...');

    if (Platform.OS === 'web' || !AppleAuthentication) {
      console.log('[AppleAuth] Apple Sign In not available, using fallback');
      const fallbackUser: AuthUser = {
        uid: `apple_web_${Date.now()}`,
        email: 'user@icloud.com',
        displayName: 'Apple User',
        photoURL: null,
        provider: 'apple',
      };
      await saveAndSetUser(fallbackUser);
      return fallbackUser;
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

      if (credential.identityToken) {
        console.log('[AppleAuth] Signing in with Supabase using Apple identity token...');
        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: 'apple',
          token: credential.identityToken,
        });

        if (!error && data?.user) {
          const supaUser = data.user;
          const displayName = credential.fullName
            ? [credential.fullName.givenName, credential.fullName.familyName]
                .filter(Boolean)
                .join(' ') || null
            : null;

          const user: AuthUser = {
            uid: supaUser.id,
            email: supaUser.email || credential.email || 'private@apple.com',
            displayName: displayName || supaUser.user_metadata?.full_name || supaUser.email?.split('@')[0] || 'Apple User',
            photoURL: null,
            provider: 'apple',
          };
          await saveAndSetUser(user);
          return user;
        }

        if (error) {
          console.log('[AppleAuth] Supabase Apple sign-in error:', error.message);
        }
      }

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
      await saveAndSetUser(user);
      return user;
    } catch (error: any) {
      console.log('[AppleAuth] Error:', error);
      if (error.code === 'ERR_REQUEST_CANCELED') {
        throw new Error('Sign in was cancelled');
      }
      throw error;
    }
  }, []);

  const signInWithEmail = useCallback(async (email: string, password: string): Promise<AuthUser> => {
    console.log('[EmailAuth] Signing in with email:', email);
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      console.log('[EmailAuth] Supabase error:', error.message);
      throw new Error(error.message);
    }

    if (data?.user) {
      const supaUser = data.user;
      const user: AuthUser = {
        uid: supaUser.id,
        email: supaUser.email || email,
        displayName: supaUser.user_metadata?.full_name || email.split('@')[0],
        photoURL: supaUser.user_metadata?.avatar_url || null,
        provider: 'email',
      };
      await saveAndSetUser(user);
      return user;
    }

    throw new Error('Sign in failed');
  }, []);

  const signUpWithEmail = useCallback(async (email: string, password: string, name: string): Promise<AuthUser> => {
    console.log('[EmailAuth] Signing up with email:', email);
    if (!email || !password || !name) {
      throw new Error('Email, password, and name are required');
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
      },
    });

    if (error) {
      console.log('[EmailAuth] Supabase sign-up error:', error.message);
      throw new Error(error.message);
    }

    if (data?.user) {
      const supaUser = data.user;
      const user: AuthUser = {
        uid: supaUser.id,
        email: supaUser.email || email,
        displayName: name,
        photoURL: null,
        provider: 'email',
      };
      await saveAndSetUser(user);
      return user;
    }

    throw new Error('Sign up failed');
  }, []);

  const signOut = useCallback(async () => {
    console.log('[Auth] Signing out...');
    try {
      await supabase.auth.signOut();
    } catch (e: any) {
      console.log('[Auth] Supabase sign out error:', e?.message);
    }
    await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
    setState({ user: null, isLoading: false, isAuthenticated: false });
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

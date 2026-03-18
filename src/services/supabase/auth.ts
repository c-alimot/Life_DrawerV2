import { supabase } from './client';
import { ApiError, LoginRequest, SignupRequest } from '@types';
import { API_ERRORS } from '@constants/errors';

export const authService = {
  /**
   * Sign up with email and password
   * Creates auth account and profile (auto-created by trigger)
   */
  async signup(request: SignupRequest) {
    try {
      // Step 1: Create auth user
      const {
        data: { user: authUser },
        error: signupError,
      } = await supabase.auth.signUp({
        email: request.email,
        password: request.password,
        options: {
          data: {
            display_name: request.fullName || null,
          },
        },
      });

      if (signupError || !authUser) {
        throw signupError || new Error('Signup failed');
      }

      // Step 2: Wait a moment for the trigger to create the profile
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Step 3: Fetch the created profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (profileError || !profile) {
        throw profileError || new Error('Profile creation failed');
      }

      // Step 4: Get session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !sessionData.session) {
        throw sessionError || new Error('Session creation failed');
      }

      return {
        user: {
          id: profile.id,
          email: profile.email,
          displayName: profile.display_name,
          createdAt: profile.created_at,
          updatedAt: profile.created_at,
        },
        session: {
          accessToken: sessionData.session.access_token,
          refreshToken: sessionData.session.refresh_token || '',
          expiresIn: sessionData.session.expires_in || 3600,
        },
      };
    } catch (error) {
      console.error('Signup error:', error);
      throw this.handleError(error);
    }
  },

  /**
   * Sign in with email and password
   */
  async login(request: LoginRequest) {
    try {
      const {
        data: { session, user: authUser },
        error: authError,
      } = await supabase.auth.signInWithPassword({
        email: request.email,
        password: request.password,
      });

      if (authError || !session || !authUser) {
        throw authError || new Error('Login failed');
      }

      // Fetch user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (profileError || !profile) {
        throw profileError || new Error('Profile fetch failed');
      }

      return {
        user: {
          id: profile.id,
          email: profile.email,
          displayName: profile.display_name,
          createdAt: profile.created_at,
          updatedAt: profile.created_at,
        },
        session: {
          accessToken: session.access_token,
          refreshToken: session.refresh_token || '',
          expiresIn: session.expires_in || 3600,
        },
      };
    } catch (error) {
      console.error('Login error:', error);
      throw this.handleError(error);
    }
  },

  /**
   * Get current session and user
   */
  async getSession() {
    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        throw sessionError;
      }

      if (!session) {
        return null;
      }

      // Fetch user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profileError || !profile) {
        throw profileError || new Error('Profile fetch failed');
      }

      return {
        user: {
          id: profile.id,
          email: profile.email,
          displayName: profile.display_name,
          createdAt: profile.created_at,
          updatedAt: profile.created_at,
        },
        session: {
          accessToken: session.access_token,
          refreshToken: session.refresh_token || '',
          expiresIn: session.expires_in || 3600,
        },
      };
    } catch (error) {
      console.error('Get session error:', error);
      return null;
    }
  },

  /**
   * Refresh the current session
   */
  async refreshSession() {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.refreshSession();

      if (error || !session) {
        throw error || new Error('Failed to refresh session');
      }

      return {
        accessToken: session.access_token,
        refreshToken: session.refresh_token || '',
        expiresIn: session.expires_in || 3600,
      };
    } catch (error) {
      console.error('Refresh session error:', error);
      throw this.handleError(error);
    }
  },

  /**
   * Sign out and clear session
   */
  async logout() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Logout error:', error);
      throw this.handleError(error);
    }
  },

  /**
   * Update user profile
   */
  async updateProfile(userId: string, updates: { displayName?: string }) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          display_name: updates.displayName,
        })
        .eq('id', userId)
        .select()
        .single();

      if (error || !data) {
        throw error || new Error('Profile update failed');
      }

      return {
        id: data.id,
        email: data.email,
        displayName: data.display_name,
        createdAt: data.created_at,
        updatedAt: data.created_at,
      };
    } catch (error) {
      console.error('Update profile error:', error);
      throw this.handleError(error);
    }
  },

  /**
   * Handle and normalize errors
   */
  private handleError(error: any): ApiError {
    const errorMessage = (error?.message || error?.error_description || 'Unknown error').toLowerCase();

    if (errorMessage.includes('invalid login credentials') || errorMessage.includes('invalid email')) {
      return API_ERRORS.INVALID_CREDENTIALS;
    }

    if (errorMessage.includes('already registered') || errorMessage.includes('user already exists')) {
      return API_ERRORS.EMAIL_ALREADY_EXISTS;
    }

    if (errorMessage.includes('password') || errorMessage.includes('weak')) {
      return API_ERRORS.WEAK_PASSWORD;
    }

    if (error?.status === 401) {
      return API_ERRORS.UNAUTHORIZED;
    }

    if (error?.status === 403) {
      return API_ERRORS.FORBIDDEN;
    }

    if (error?.status === 404) {
      return API_ERRORS.USER_NOT_FOUND;
    }

    return {
      code: 'UNKNOWN_ERROR',
      message: errorMessage || 'An unknown error occurred',
    };
  },
};
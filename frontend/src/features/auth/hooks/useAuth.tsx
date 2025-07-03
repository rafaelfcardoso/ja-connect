/**
 * Authentication context and hooks for managing auth state across the application.
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authService, User, LoginCredentials } from '../../../shared/services/authService';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state on mount
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const storedUser = authService.getStoredUser();
      
      if (storedUser && authService.isAuthenticated()) {
        // For now, just use stored user without API verification
        // since backend might not be running
        setUser(storedUser);
        
        // Optionally verify token in background (non-blocking)
        authService.getCurrentUser()
          .then(currentUser => setUser(currentUser))
          .catch(error => {
            console.warn('Background token verification failed:', error);
            // Don't clear user state for background verification failure
          });
      } else {
        // Clear any stale data (with timeout)
        await authService.logout();
      }
    } catch (error) {
      console.warn('Auth initialization failed:', error);
      // Clear stale data on error (with timeout)
      await authService.logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);
      const { user: loggedInUser } = await authService.login(credentials);
      setUser(loggedInUser);
      toast.success(`Bem-vindo, ${loggedInUser.full_name}!`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao fazer login';
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      
      // Clear user state immediately for better UX
      setUser(null);
      
      // Attempt to logout from backend (with timeout)
      await authService.logout();
      
      toast.success('Logout realizado com sucesso');
    } catch (error) {
      console.warn('Logout error:', error);
      // User state is already cleared, just show a warning
      toast.success('Logout realizado localmente');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      if (authService.isAuthenticated()) {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      }
    } catch (error) {
      console.warn('Failed to refresh user:', error);
      // Clear auth state if refresh fails
      await logout();
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user && authService.isAuthenticated(),
    isLoading,
    login,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}
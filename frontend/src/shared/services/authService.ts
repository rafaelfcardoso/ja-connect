/**
 * Authentication service for handling login, logout, and token management.
 */

const API_BASE_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:8000';

export interface User {
  email: string;
  full_name: string;
  role: 'admin' | 'user';
  is_active: boolean;
  created_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface CreateUserData {
  email: string;
  full_name: string;
  password: string;
  role: 'admin' | 'user';
}

export interface RegisterData {
  email: string;
  full_name: string;
  password: string;
}

class AuthService {
  private readonly ACCESS_TOKEN_KEY = 'ja_access_token';
  private readonly REFRESH_TOKEN_KEY = 'ja_refresh_token';
  private readonly USER_KEY = 'ja_user';

  /**
   * Login user with email and password
   */
  async login(credentials: LoginCredentials): Promise<{ user: User; tokens: AuthTokens }> {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Login failed');
    }

    const tokens: AuthTokens = await response.json();
    
    // Store tokens
    this.setTokens(tokens);
    
    // Get user info
    const user = await this.getCurrentUser();
    this.setUser(user);

    return { user, tokens };
  }

  /**
   * Register new user and login automatically
   */
  async register(userData: RegisterData): Promise<{ user: User; tokens: AuthTokens }> {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Registration failed');
    }

    const tokens: AuthTokens = await response.json();
    
    // Store tokens
    this.setTokens(tokens);
    
    // Get user info
    const user = await this.getCurrentUser();
    this.setUser(user);

    return { user, tokens };
  }

  /**
   * Logout user and clear stored data
   */
  async logout(): Promise<void> {
    const token = this.getAccessToken();
    
    if (token) {
      try {
        // Add timeout to prevent hanging logout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
        
        await fetch(`${API_BASE_URL}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
      } catch (error) {
        console.warn('Logout request failed:', error);
        // Continue with local logout even if API call fails
      }
    }

    this.clearStoredData();
  }

  /**
   * Get current user information
   */
  async getCurrentUser(): Promise<User> {
    const token = this.getAccessToken();
    
    if (!token) {
      throw new Error('No access token available');
    }

    // Add timeout to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error('Failed to get user information');
      }

      return response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  /**
   * Create new user (admin only)
   */
  async createUser(userData: CreateUserData): Promise<User> {
    const token = this.getAccessToken();
    
    if (!token) {
      throw new Error('No access token available');
    }

    const response = await fetch(`${API_BASE_URL}/api/auth/create-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to create user');
    }

    return response.json();
  }

  /**
   * Get stored access token
   */
  getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  /**
   * Get stored refresh token
   */
  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  /**
   * Get stored user data
   */
  getStoredUser(): User | null {
    const userData = localStorage.getItem(this.USER_KEY);
    return userData ? JSON.parse(userData) : null;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  /**
   * Store authentication tokens
   */
  private setTokens(tokens: AuthTokens): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, tokens.access_token);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, tokens.refresh_token);
  }

  /**
   * Store user data
   */
  private setUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  /**
   * Clear all stored authentication data
   */
  private clearStoredData(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  /**
   * Add authorization header to fetch requests
   */
  getAuthHeaders(): Record<string, string> {
    const token = this.getAccessToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
}

export const authService = new AuthService();
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../services/api';

interface User {
  id: string;
  username: string;
  email?: string;
  role?: string;
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing token in cookies
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'token' && value) {
        setToken(value);
        // Optionally fetch user profile
        fetchUserProfile();
        break;
      }
    }
    setIsLoading(false);
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await api.getProfile();
      // Normalize profile data to match login response format
      const profileData = response.data;
      setUser({
        id: profileData.mu_id,
        username: profileData.mu_username,
        email: profileData.mu_email,
        role: profileData.mu_role,
        firstName: profileData.mu_firstName,
        lastName: profileData.mu_lastName,
        name: profileData.name,
        memberId: profileData.memberId,
        phoneNumber: profileData.mu_phoneNumber,
        joinDate: profileData.joinDate,
        membershipType: profileData.membershipType,
        expiryDate: profileData.expiryDate,
        nextBilling: profileData.nextBilling,
        totalExperience: profileData.totalExperience,
        currentRank: profileData.currentRank,
        rankIcon: profileData.rankIcon,
      });
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      // Token might be invalid, clear it
      setToken(null);
      document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    }
  };

  const login = async (username: string, password: string) => {
    try {
      const response = await api.login({ username, password });
      setToken(response.token);
      // Store token in cookie for persistence
      document.cookie = `token=${response.token}; path=/; max-age=${8 * 60 * 60}; SameSite=Lax`;
      // Fetch full profile data after login to get all user fields
      await fetchUserProfile();
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        logout,
        isAuthenticated: !!token && !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
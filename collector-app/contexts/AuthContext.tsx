import React, { createContext, useState, useContext, ReactNode } from 'react';
import { useRouter } from 'expo-router';

interface Collector {
  _id: string;
  name: string;
  email: string;
  phone: string;
  zone: string;
  performance?: any;
}

interface AuthContextType {
  collector: Collector | null;
  token: string | null;
  login: (email: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [collector, setCollector] = useState<Collector | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const login = async (email: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const response = await fetch('https://smart-waste-nairobi-chi.vercel.app/api/auth/collector-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.toLowerCase() }),
      });

      const result = await response.json();
      
      if (result.success) {
        setCollector(result.collector);
        setToken(result.token);
        
        // Store in async storage for persistence (optional)
        // await AsyncStorage.setItem('collectorToken', result.token);
        // await AsyncStorage.setItem('collectorData', JSON.stringify(result.collector));
        
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setCollector(null);
    setToken(null);
    // await AsyncStorage.removeItem('collectorToken');
    // await AsyncStorage.removeItem('collectorData');
    router.replace('/login');
  };

  return (
    <AuthContext.Provider value={{ collector, token, login, logout, isLoading }}>
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
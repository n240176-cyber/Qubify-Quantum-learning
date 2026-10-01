import React, { createContext, useContext, useState, useEffect } from 'react';
import { PrototypeUser, AuthContextType } from '../types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USER: 'qubify_prototype_user',
  IS_AUTH: 'qubify_is_authenticated',
};

export const PrototypeAuthProvider: React.FC<{ 
  children: React.ReactNode;
  onResetProgress?: () => void;
}> = ({ children, onResetProgress }) => {
  const [user, setUser] = useState<PrototypeUser | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USER);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.IS_AUTH) === 'true';
    } catch {
      return false;
    }
  });

  const [isSigningIn, setIsSigningIn] = useState<boolean>(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      }
    } catch {}
  }, [user]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.IS_AUTH, isAuthenticated ? 'true' : 'false');
    } catch {}
  }, [isAuthenticated]);

  // Simulated Google Sign-In for prototype
  const loginWithGoogle = async (): Promise<void> => {
    setIsSigningIn(true);

    // Simulate 500ms authentication delay (within 300-700ms requirement)
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Restore existing demo profile or create fresh demo profile
    let profile: PrototypeUser = user || {
      id: 'qub-learner-1',
      name: 'Qubify Learner',
      email: 'learner@qubify.demo',
      avatar: 'QL',
      provider: 'prototype-google',
    };

    setUser(profile);
    setIsAuthenticated(true);
    setIsSigningIn(false);
  };

  // Log Out without deleting learning progress
  const logout = () => {
    setIsAuthenticated(false);
    try {
      localStorage.setItem(STORAGE_KEYS.IS_AUTH, 'false');
    } catch {}
  };

  // Reset demo progress
  const resetProgress = () => {
    if (onResetProgress) {
      onResetProgress();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isSigningIn,
        loginWithGoogle,
        logout,
        resetProgress,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Aliased export for future OAuth or Backend providers
export const AuthProvider = PrototypeAuthProvider;

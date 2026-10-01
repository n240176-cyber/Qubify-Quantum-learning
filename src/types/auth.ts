export interface PrototypeUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  provider: 'prototype-google' | 'guest';
}

export interface AuthContextType {
  user: PrototypeUser | null;
  isAuthenticated: boolean;
  isSigningIn: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
  resetProgress: () => void;
}

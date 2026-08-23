import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  register: (name: string, email: string, password: string) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      login: (email: string, _password: string) => {
        if (!email) return false;
        const user: User = {
          id: Date.now().toString(),
          name: email.split('@')[0],
          email,
        };
        set({ user, isAuthenticated: true });
        return true;
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
      },

      register: (name: string, email: string, _password: string) => {
        if (!name || !email) return false;
        const user: User = {
          id: Date.now().toString(),
          name,
          email,
        };
        set({ user, isAuthenticated: true });
        return true;
      },
    }),
    {
      name: 'resona_auth',
    }
  )
);

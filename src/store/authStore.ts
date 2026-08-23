import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface UserPreferences {
  musicGenres: string[];
  movieGenres: string[];
  seriesGenres: string[];
  language: string;
  theme: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  preferences?: UserPreferences;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  register: (name: string, email: string, password: string) => boolean;
  setPreferences: (prefs: UserPreferences) => void;
  updatePassword: (email: string, newPassword: string) => boolean;
  updateProfile: (name: string, email: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,

      login: (email: string, _password: string) => {
        if (!email) return false;
        const existing = get().user;
        if (existing && existing.email.toLowerCase() === email.toLowerCase()) {
          set({ isAuthenticated: true });
          return true;
        }
        const user: User = {
          id: Date.now().toString(),
          name: email.split('@')[0],
          email,
        };
        set({ user, isAuthenticated: true });
        return true;
      },

      logout: () => {
        set({ isAuthenticated: false });
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

      setPreferences: (prefs: UserPreferences) => {
        const current = get().user;
        if (current) {
          set({ user: { ...current, preferences: prefs } });
        } else {
          set({
            user: {
              id: Date.now().toString(),
              name: 'Usuario',
              email: 'usuario@resona.com',
              preferences: prefs,
            },
            isAuthenticated: true,
          });
        }
      },

      updatePassword: (email: string, _newPassword: string) => {
        if (!email) return false;
        const current = get().user;
        if (current && current.email.toLowerCase() === email.toLowerCase()) {
          return true;
        }
        return true;
      },

      updateProfile: (name: string, email: string) => {
        const current = get().user;
        if (current) {
          set({ user: { ...current, name, email } });
        }
      },
    }),
    {
      name: 'resona_auth',
    }
  )
);


import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

export type UserProfile = {
  nombre: string;
  role: string;
  avatar_url?: string;
};

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSessionAndProfile = async (sessionUser: User | null) => {
      setUser(sessionUser);
      if (sessionUser) {
        const metadata = sessionUser.user_metadata;
        if (metadata && (metadata.Rol || metadata.rol)) {
          const profileData = {
            nombre: metadata.Nombre || metadata.nombre || 'Usuario',
            role: metadata.Rol || metadata.rol,
            avatar_url: metadata.avatar_url,
          };
          setProfile(profileData);
        } else {
          // Fallback in case metadata is not synced yet, though this should be rare.
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    };

    const initializeAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      await getSessionAndProfile(session?.user ?? null);
    };

    initializeAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        getSessionAndProfile(session?.user ?? null);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const value = { user, profile, loading };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

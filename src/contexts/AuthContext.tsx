
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

export type UserProfile = {
  nombre: string;
  role: string;
  avatar_url?: string;
  RolEmpresa?: string;
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
        // CORRECCIÓN DEFINITIVA: Usamos el nombre exacto de la tabla entre comillas dobles.
        const { data: userProfile } = await supabase
          .from('"Cuentas"')
          .select('Nombre, Rol, avatar_url, RolEmpresa')
          .eq('user_id', sessionUser.id)
          .single();
        
        if (userProfile) {
          setProfile({
            nombre: userProfile.Nombre,
            role: userProfile.Rol,
            avatar_url: userProfile.avatar_url,
            RolEmpresa: userProfile.RolEmpresa,
          });
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
      async (_event, session) => {
        await getSessionAndProfile(session?.user ?? null);
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

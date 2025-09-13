import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

interface Profile {
  nombre: string;
  avatar_url: string;
  role: string | null;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  updateProfile: (newProfile: Partial<Profile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSessionAndProfile = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        try {
          // DEFINITIVE FIX: Select the exact column name 'Rol' as specified.
          const { data, error } = await supabase
            .from('Cuentas')
            .select('Nombre, avatar_url, Rol')
            .eq('Correo', currentUser.email!)
            .single();

          if (error) {
            console.error('[AUTH] Error fetching profile:', error);
            setProfile(null);
          } else {
            // DEFINITIVE FIX: Assign the profile using the correct 'Rol' property.
            const userRole = data.Rol || null;
            setProfile({ nombre: data.Nombre, avatar_url: data.avatar_url, role: userRole });
            console.log("[AUTH] Profile fetched successfully with role:", userRole);
          }
        } catch (e) {
          setProfile(null);
        }
      } else {
        setProfile(null); 
      }
      setLoading(false);
    };

    fetchSessionAndProfile();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      fetchSessionAndProfile();
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const updateProfile = (newProfile: Partial<Profile>) => {
    setProfile(prev => prev ? { ...prev, ...newProfile } : null);
  };

  const value = { user, profile, loading, updateProfile };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/db/supabase";
import type { User, Session } from "@supabase/supabase-js";
import type { Profile } from "@/types/types";
import { api } from "@/db/api";
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasShownWelcome, setHasShownWelcome] = useState(false);
  const { toast } = useToast();

  const refreshProfile = async () => {
    if (user) {
      try {
        const profileData = await api.getProfile(user.id);
        setProfile(profileData);
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        api.getProfile(session.user.id).then(setProfile).catch(console.error);
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        api.getProfile(session.user.id).then((profileData) => {
          setProfile(profileData);
          
          if (event === "SIGNED_IN" && !hasShownWelcome) {
            const displayName = profileData?.username || profileData?.email || session.user.email || "User";
            toast({
              title: `Welcome back, ${displayName}! 📚`,
              description: "Ready to discover your next great read?",
              duration: 4000,
            });
            setHasShownWelcome(true);
          }
        }).catch(console.error);
      } else {
        setProfile(null);
        setHasShownWelcome(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [hasShownWelcome, toast]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setSession(null);
    setHasShownWelcome(false);
    toast({
      title: "Signed out successfully",
      description: "See you next time!",
    });
  };

  return (
    <AuthContext.Provider value={{ user, profile, session, loading, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

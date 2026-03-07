import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";

type AppRole = "farmer" | "vendor" | "admin";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: AppRole | null;
  loading: boolean;
  roleLoading: boolean;
  signUp: (email: string, password: string, fullName: string, role: AppRole) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  confirmEmailForDev: (email: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  forceConfirmEmail: (email: string) => Promise<{ success: boolean; message?: string; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [roleLoading, setRoleLoading] = useState(false);

  const fetchRole = async (userId: string) => {
    setRoleLoading(true);
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .maybeSingle();
    setRole((data?.role as AppRole) ?? "farmer");
    setRoleLoading(false);
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchRole(session.user.id);
      } else {
        setRole(null);
        setRoleLoading(false);
      }
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) fetchRole(session.user.id);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string, role: AppRole) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, role } },
    });

    // If signup successful and user created, ensure role is set
    if (!error && data.user) {
      // Try to insert role (this will be ignored if trigger already created it)
      await supabase.from("user_roles").upsert({
        user_id: data.user.id,
        role: role
      }, { onConflict: "user_id" });

      // If user is immediately signed in (email confirmation disabled), return success
      if (data.session) {
        return { error: null };
      }
    }

    return { error: error as Error | null };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    // If sign in failed, provide more specific error messages
    if (error) {
      let errorMessage = error.message;

      // Provide more user-friendly error messages
      if (error.message.includes('Invalid login credentials')) {
        errorMessage = 'Invalid email or password. Please check your credentials and try again.';
      } else if (error.message.includes('Email not confirmed')) {
        errorMessage = 'Please check your email and click the confirmation link before signing in.';
      } else if (error.message.includes('Too many requests')) {
        errorMessage = 'Too many login attempts. Please wait a few minutes before trying again.';
      }

      return { error: new Error(errorMessage) };
    }

    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setRole(null);
  };

  // Development helper: Confirm email programmatically
  const confirmEmailForDev = async (email: string) => {
    // This is a development workaround - in production, use proper email confirmation
    try {
      // For development testing, we'll create a simple confirmation flow
      const { data, error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      if (error) {
        console.error('Resend confirmation failed:', error);
        return { success: false, error: error.message };
      }

      return {
        success: true,
        message: 'Confirmation email resent. Check your email and click the link, then try signing in again.'
      };
    } catch (error) {
      console.error('Email confirmation helper failed:', error);
      return { success: false, error: 'Failed to resend confirmation email' };
    }
  };

  // Development utility: Force confirm email (for testing only)
  const forceConfirmEmail = async (email: string) => {
    // WARNING: This is for development only and bypasses security
    // In production, always use proper email confirmation
    if (!import.meta.env.DEV) {
      return { success: false, error: 'This function is only available in development mode' };
    }

    try {
      // This is a workaround for development - don't use in production
      console.log(`Development: Simulating email confirmation for ${email}`);
      console.log('In a real app, you would need to click the confirmation link from your email');

      // For now, just resend the confirmation email
      return await confirmEmailForDev(email);
    } catch (error) {
      console.error('Force confirm failed:', error);
      return { success: false, error: 'Failed to force confirm email' };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      role,
      loading,
      signUp,
      signIn,
      signOut,
      confirmEmailForDev,
      forceConfirmEmail,
      roleLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

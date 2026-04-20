'use client';

import { useState, useEffect, useCallback } from 'react';
import { getSupabaseClient } from '@/app/lib/supabase/client';

export type CurrentUser = {
  id: string;
  name: string;
  avatar_url: string | null;
};

export function useCurrentUser() {
  const [user, setUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    const supabase = getSupabaseClient();

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          name: session.user.user_metadata['name'] ?? session.user.email ?? 'User',
          avatar_url: session.user.user_metadata['avatar_url'] ?? null,
        });
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          name: session.user.user_metadata['name'] ?? session.user.email ?? 'User',
          avatar_url: session.user.user_metadata['avatar_url'] ?? null,
        });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await getSupabaseClient().auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
  }, []);

  const signUp = useCallback(async (
    email: string,
    password: string,
    name: string,
    avatar_url: string,
  ) => {
    const { error } = await getSupabaseClient().auth.signUp({
      email,
      password,
      options: { data: { name, avatar_url } },
    });
    if (error) throw new Error(error.message);
  }, []);

  const logout = useCallback(async () => {
    await getSupabaseClient().auth.signOut();
  }, []);

  return { user, signIn, signUp, logout };
}

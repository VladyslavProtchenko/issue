'use client';

import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useCurrentUser } from '@/app/hooks/useCurrentUser';
import { AuthDialog } from './AuthDialog';

export function Header() {
  const { user, logout } = useCurrentUser();
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 sm:px-8 py-3">
        <span className="text-sm font-semibold">Issues Tracker</span>

        {user ? (
          <div className="flex items-center gap-3">
            <Avatar className="h-7 w-7">
              <AvatarImage src={user.avatar_url ?? undefined} />
              <AvatarFallback className="text-xs">
                {user.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm">{user.name}</span>
            <button
              onClick={logout}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Logout
            </button>
          </div>
        ) : (
          <>
            <button
              onClick={() => setAuthOpen(true)}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Login
            </button>
            <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
          </>
        )}
      </div>
    </header>
  );
}

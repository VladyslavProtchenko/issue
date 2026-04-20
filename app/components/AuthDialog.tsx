'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useCurrentUser } from '@/app/hooks/useCurrentUser';
import { loginSchema, registerSchema } from '@/app/lib/validation';

const AVATAR_OPTIONS = [
  'felix', 'aneka', 'luna', 'zara',
  'leo', 'mia', 'kai', 'nova',
  'sam', 'ivy', 'max', 'ruby',
].map((seed) => ({
  seed,
  url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`,
}));

type Mode = 'login' | 'register';

function LoginForm({ onSwitch, onClose }: { onSwitch: () => void; onClose: () => void }) {
  const { signIn } = useCurrentUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await signIn(result.data.email, result.data.password);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={loading}
      />
      <Input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={loading}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
      <button
        type="button"
        onClick={onSwitch}
        className="text-xs text-muted-foreground hover:text-foreground"
      >
        Don't have an account? Sign up
      </button>
      <div className="flex flex-col gap-2 pt-1">
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-foreground py-2 text-sm font-medium text-background disabled:opacity-50"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="w-full rounded-md border py-2 text-sm font-medium hover:bg-muted/50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function RegisterForm({ onSwitch, onClose }: { onSwitch: () => void; onClose: () => void }) {
  const { signUp } = useCurrentUser();
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_OPTIONS[0].url);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = registerSchema.safeParse({ name, email, password, confirmPassword });
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await signUp(result.data.email, result.data.password, result.data.name, selectedAvatar);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex flex-wrap justify-center gap-2">
        {AVATAR_OPTIONS.map((avatar) => (
          <button
            key={avatar.seed}
            type="button"
            onClick={() => setSelectedAvatar(avatar.url)}
            className={`rounded-lg border-2 p-1 transition-colors ${
              selectedAvatar === avatar.url
                ? 'border-foreground'
                : 'border-transparent hover:border-muted-foreground/30'
            }`}
          >
            <img src={avatar.url} alt={avatar.seed} className="h-12 w-12 rounded" />
          </button>
        ))}
      </div>
      <Input
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        disabled={loading}
      />
      <Input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={loading}
      />
      <Input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={loading}
      />
      <Input
        type="password"
        placeholder="Confirm password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        disabled={loading}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
      <button
        type="button"
        onClick={onSwitch}
        className="text-xs text-muted-foreground hover:text-foreground"
      >
        Already have an account? Login
      </button>
      <div className="flex flex-col gap-2 pt-1">
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-foreground py-2 text-sm font-medium text-background disabled:opacity-50"
        >
          {loading ? 'Creating account...' : 'Register'}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="w-full rounded-md border py-2 text-sm font-medium hover:bg-muted/50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export function AuthDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [mode, setMode] = useState<Mode>('login');

  function handleClose() {
    onOpenChange(false);
    setMode('login');
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{mode === 'login' ? 'Login' : 'Create account'}</DialogTitle>
        </DialogHeader>
        {mode === 'login' ? (
          <LoginForm onSwitch={() => setMode('register')} onClose={handleClose} />
        ) : (
          <RegisterForm onSwitch={() => setMode('login')} onClose={handleClose} />
        )}
      </DialogContent>
    </Dialog>
  );
}

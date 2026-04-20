export type CurrentUser = {
  id: string;
  name: string;
  avatar_url: string;
};

export const SEED_USERS: CurrentUser[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'Alice Johnson',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice',
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    name: 'Bob Smith',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob',
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    name: 'Carol Williams',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=carol',
  },
];

const STORAGE_KEY = 'current_user';

export function getStoredUser(): CurrentUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CurrentUser) : null;
  } catch {
    return null;
  }
}

export function storeUser(user: CurrentUser): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

export function clearStoredUser(): void {
  localStorage.removeItem(STORAGE_KEY);
}

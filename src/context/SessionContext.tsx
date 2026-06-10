import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@/types/weldcloud';
import { useUsers } from '@/hooks/useWorkOrders';

interface SessionState {
  currentUser: User | null;
  users: User[];
  badgeIn: (userId: string) => void;
  badgeOut: () => void;
}

const SessionContext = createContext<SessionState | null>(null);

const STORAGE_KEY = 'wcl-current-user';

export function SessionProvider({ children }: { children: ReactNode }) {
  const { data: users = [] } = useUsers();
  const [currentUserId, setCurrentUserId] = useState<string | null>(
    () => localStorage.getItem(STORAGE_KEY)
  );

  useEffect(() => {
    if (currentUserId) localStorage.setItem(STORAGE_KEY, currentUserId);
    else localStorage.removeItem(STORAGE_KEY);
  }, [currentUserId]);

  const badgeIn = useCallback((userId: string) => setCurrentUserId(userId), []);
  const badgeOut = useCallback(() => setCurrentUserId(null), []);

  const currentUser = users.find((u) => u.id === currentUserId) ?? null;

  return (
    <SessionContext.Provider value={{ currentUser, users, badgeIn, badgeOut }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession(): SessionState {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used within SessionProvider');
  return ctx;
}

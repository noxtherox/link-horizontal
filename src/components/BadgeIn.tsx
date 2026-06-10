import { useSession } from '@/context/SessionContext';
import { Role } from '@/types/weldcloud';
import { Zap, Nfc } from 'lucide-react';

const ROLE_STYLES: Record<Role, string> = {
  welder: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30',
  fitter: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  inspector: 'bg-green-500/10 text-green-400 border-green-500/30',
  manager: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
};

export function BadgeIn() {
  const { users, badgeIn } = useSession();

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex flex-col items-center justify-center p-6">
      <div className="flex items-center gap-2 mb-8">
        <div className="w-10 h-10 bg-yellow-500 rounded-md flex items-center justify-center">
          <Zap className="w-6 h-6 text-black" />
        </div>
        <span className="font-bold text-white text-xl tracking-tight">
          WeldCloud<span className="text-yellow-500">Link</span>
        </span>
      </div>

      <div className="flex flex-col items-center mb-8">
        <div className="w-24 h-24 rounded-full bg-[#1a1a1a] border-2 border-dashed border-[#3a3a3a] flex items-center justify-center mb-4 animate-pulse">
          <Nfc className="w-10 h-10 text-yellow-500" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-1">Tap your badge to start</h1>
        <p className="text-sm text-gray-500">Station 1 · Warrior Edge 500</p>
      </div>

      <div className="w-full max-w-lg">
        <div className="text-[10px] uppercase tracking-wider text-gray-600 text-center mb-3">
          Demo — tap a badge below to simulate
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {users.map((user) => (
            <button
              key={user.id}
              onClick={() => badgeIn(user.id)}
              className="flex flex-col items-center gap-2 p-4 bg-[#1a1a1a] hover:bg-[#1f1f1f] border border-[#2a2a2a] hover:border-yellow-500/40 rounded-xl transition-colors"
            >
              <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center text-sm font-bold text-black">
                {user.initials}
              </div>
              <div className="text-sm text-white font-medium">{user.name}</div>
              <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border ${ROLE_STYLES[user.role]}`}>
                {user.role}
              </span>
              <span className="text-[10px] text-gray-600 font-mono">{user.badgeId}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

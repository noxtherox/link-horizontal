import { Check } from 'lucide-react';

interface StatusBarProps {
  hint: string;
}

export function StatusBar({ hint }: StatusBarProps) {
  return (
    <footer className="bg-[#141414] border-t border-[#2a2a2a] px-4 py-2 flex items-center justify-between">
      <p className="text-xs text-gray-500">{hint}</p>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 text-xs text-[var(--text-verified)] bg-[#1f1f1f] px-2 py-1 rounded">
          <Check className="w-3 h-3" />
          <span>Touch ≥ 80×80</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-[var(--text-verified)] bg-[#1f1f1f] px-2 py-1 rounded">
          <Check className="w-3 h-3" />
          <span>Contrast AAA</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-[var(--text-verified)] bg-[#1f1f1f] px-2 py-1 rounded">
          <Check className="w-3 h-3" />
          <span>No keyboard entry</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-[var(--text-verified)] bg-[#1f1f1f] px-2 py-1 rounded">
          <Check className="w-3 h-3" />
          <span>Works offline</span>
        </div>
      </div>
    </footer>
  );
}
import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-3 left-1/2 -translate-y-1/2 z-50 flex items-center gap-2.5 rounded-full bg-white border border-[#E5BD58] px-4 py-1.5 text-xs font-semibold text-[#C49A3A] shadow-md backdrop-blur-md animate-pulse"
    >
      <div className="w-5 h-5 rounded-md bg-[#FAF3DF] border border-[#E5BD58] flex items-center justify-center text-[#C49A3A]">
        <WifiOff className="w-3 h-3" />
      </div>
      <span>Mode Offline — Menggunakan data cache lokal</span>
    </div>
  );
};

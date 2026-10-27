import React from 'react';
import {
  Home,
  BookOpen,
  Clock,
  Compass,
  Heart,
  Bookmark,
  Settings,
  Search
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

export type NavTab =
  | 'home'
  | 'quran'
  | 'sholat'
  | 'kiblat'
  | 'doa'
  | 'bookmark'
  | 'settings'
  | 'search';

interface Props {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export const Navbar: React.FC<Props> = ({ currentTab, onSelectTab }) => {
  // Navigation items strictly mapped to the 7 core pillars
  const navItems = [
    { id: 'home' as NavTab, label: 'Beranda', icon: Home },
    { id: 'quran' as NavTab, label: 'Al-Qur\'an', icon: BookOpen },
    { id: 'sholat' as NavTab, label: 'Jadwal Salat', icon: Clock },
    { id: 'kiblat' as NavTab, label: 'Arah Kiblat', icon: Compass },
    { id: 'doa' as NavTab, label: 'Doa Harian', icon: Heart },
    { id: 'bookmark' as NavTab, label: 'Bookmark', icon: Bookmark },
    { id: 'settings' as NavTab, label: 'Pengaturan', icon: Settings }
  ];

  return (
    <>
      {/* Desktop & Tablet Top Navigation Bar */}
      <header className="sticky top-0 z-30 w-full bg-[#000000]/95 backdrop-blur-md border-b border-[#262626]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          {/* Logo & Brand Identity */}
          <button
            onClick={() => onSelectTab('home')}
            className="flex items-center gap-2.5 text-left group focus:outline-none shrink-0"
          >
            <div className="relative w-9 h-9 rounded-xl bg-black border border-[#F6C646]/50 p-1 flex items-center justify-center shadow-lg shadow-[#F6C646]/10 transition group-hover:border-[#F6C646]">
              <img
                src="/pwa-192x192.png"
                alt="Logo AA Dom Qur'an"
                className="w-full h-full object-contain rounded-lg"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-extrabold text-[#F6C646] tracking-tight">
                  AA Dom Qur'an
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#151515] text-[#FFD455] border border-[#F6C646]/30 font-medium">
                  Digital
                </span>
              </div>
              <p className="text-[10px] text-[#B8B8B8] hidden xl:block truncate max-w-xs">
                Temani Tilawah, Dekatkan Hati dengan Al-Qur'an
              </p>
            </div>
          </button>

          {/* Desktop Nav Links (7 Items) */}
          <nav aria-label="Navigasi utama" className="hidden lg:flex items-center gap-1 overflow-x-auto py-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                    isActive
                      ? 'bg-[#151515] text-[#F6C646] border border-[#F6C646]/40 shadow-sm'
                      : 'text-[#B8B8B8] hover:text-white hover:bg-[#151515]/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#F6C646]' : 'text-[#888]'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Header Action: Search shortcut & PWA Install */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => onSelectTab('search')}
              className={`p-2 rounded-xl transition flex items-center gap-1.5 text-xs font-semibold ${
                currentTab === 'search'
                  ? 'bg-[#151515] text-[#F6C646] border border-[#F6C646]/30'
                  : 'text-[#B8B8B8] hover:text-white hover:bg-[#151515]'
              }`}
              title="Pencarian Al-Qur'an"
              aria-label="Pencarian"
            >
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">Cari</span>
            </button>

            <PWAInstallButton variant="compact" />
          </div>
        </div>
      </header>

      {/* Mobile & Tablet Bottom Navigation Bar (Ultra-responsive & Ergonomic) */}
      <nav
        aria-label="Navigasi bilah bawah"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#0a0a0a]/95 border-t border-[#262626] backdrop-blur-lg px-1 py-1 pb-[max(0.4rem,env(safe-area-inset-bottom))]"
      >
        <div className="grid grid-cols-7 items-center max-w-lg mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex flex-col items-center justify-center py-1.5 px-0.5 rounded-lg transition ${
                  isActive ? 'text-[#F6C646]' : 'text-[#888] hover:text-[#CCC]'
                }`}
              >
                <div
                  className={`p-1 rounded-md transition ${
                    isActive ? 'bg-[#F6C646]/15 text-[#F6C646]' : ''
                  }`}
                >
                  <Icon className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[2.2]" />
                </div>
                <span className={`text-[9px] sm:text-[10px] mt-0.5 font-bold truncate max-w-full text-center ${
                  isActive ? 'text-[#F6C646]' : 'text-[#888]'
                }`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};

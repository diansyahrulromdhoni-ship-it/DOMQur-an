import React from 'react';
import {
  Home,
  BookOpen,
  Clock,
  Compass,
  Heart,
  Bookmark,
  Settings,
  Search,
  MapPin
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { getSavedLocation } from '../services/indonesiaRegions';

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
  onOpenLocation?: () => void;
}

export const Navbar: React.FC<Props> = ({ currentTab, onSelectTab, onOpenLocation }) => {
  const currentLocation = getSavedLocation();

  // Navigation items strictly mapped to the 7 core pillars
  const navItems = [
    { id: 'home' as NavTab, label: 'Beranda', icon: Home },
    { id: 'quran' as NavTab, label: "Al-Qur'an", icon: BookOpen },
    { id: 'sholat' as NavTab, label: 'Jadwal Salat', icon: Clock },
    { id: 'kiblat' as NavTab, label: 'Arah Kiblat', icon: Compass },
    { id: 'doa' as NavTab, label: 'Doa Harian', icon: Heart },
    { id: 'bookmark' as NavTab, label: 'Bookmark', icon: Bookmark },
    { id: 'settings' as NavTab, label: 'Pengaturan', icon: Settings }
  ];

  return (
    <>
      {/* Desktop & Tablet Top Navigation Bar */}
      <header className="sticky top-0 z-30 w-full bg-white/95 backdrop-blur-md border-b border-[#EAEAEA] shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onSelectTab('home')}
              className="flex items-center gap-3 text-left group focus:outline-none"
            >
              {/* Brand Icon in Rounded-Square Box */}
              <div className="w-10 h-10 rounded-2xl bg-[#FAF3DF] border border-[#E5BD58]/50 flex items-center justify-center text-[#C49A3A] shadow-xs group-hover:scale-105 transition-transform">
                <BookOpen className="w-5 h-5 text-[#C49A3A]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base sm:text-lg font-black tracking-tight text-[#222222]">
                    My Dom <span className="text-[#C49A3A]">Qur'an</span>
                  </span>
                  <span className="font-quran text-xs text-[#C49A3A] hidden sm:inline" dir="rtl">
                    القرآن الكريم
                  </span>
                </div>
                <p className="text-[10px] text-[#737373] hidden xl:block truncate max-w-xs">
                  Dekatkan Hati dengan Al-Qur'an
                </p>
              </div>
            </button>

            {/* Quick Location Badge in Header */}
            {onOpenLocation && (
              <button
                onClick={onOpenLocation}
                className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#F8F8F8] hover:bg-[#FAF3DF] border border-[#EAEAEA] hover:border-[#E5BD58]/50 text-xs text-[#222222] transition"
                title="Ganti Wilayah / Lokasi"
              >
                <div className="w-5 h-5 rounded-md bg-white border border-[#EAEAEA] flex items-center justify-center text-[#C49A3A]">
                  <MapPin className="w-3 h-3" />
                </div>
                <span className="font-medium text-[11px] truncate max-w-[130px]">
                  {currentLocation.district ? `${currentLocation.district}, ` : ''}{currentLocation.name}
                </span>
              </button>
            )}
          </div>

          {/* Desktop Nav Links (7 Items with icons in boxes) */}
          <nav aria-label="Navigasi utama" className="hidden lg:flex items-center gap-1 overflow-x-auto py-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                    isActive
                      ? 'bg-[#FAF3DF] text-[#C49A3A] border border-[#E5BD58]/60 shadow-xs'
                      : 'text-[#737373] hover:text-[#222222] hover:bg-[#F8F8F8]'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center border transition ${
                      isActive
                        ? 'bg-white border-[#E5BD58] text-[#C49A3A]'
                        : 'bg-[#F8F8F8] border-[#EAEAEA] text-[#737373]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Header Action: Search shortcut & PWA Install */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onSelectTab('search')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition ${
                currentTab === 'search'
                  ? 'bg-[#FAF3DF] text-[#C49A3A] border-[#E5BD58]'
                  : 'bg-[#F8F8F8] text-[#737373] hover:text-[#222222] border-[#EAEAEA] hover:bg-[#FAF3DF]/60'
              }`}
              title="Pencarian Al-Qur'an"
              aria-label="Pencarian"
            >
              <div className="w-6 h-6 rounded-lg bg-white border border-[#EAEAEA] flex items-center justify-center text-[#C49A3A]">
                <Search className="w-3.5 h-3.5" />
              </div>
              <span className="hidden sm:inline">Cari</span>
            </button>

            <PWAInstallButton variant="compact" />
          </div>
        </div>
      </header>

      {/* Mobile & Tablet Bottom Navigation Bar (All icons in rounded-square boxes) */}
      <nav
        aria-label="Navigasi bilah bawah"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 border-t border-[#EAEAEA] backdrop-blur-lg px-1 py-1 pb-[max(0.4rem,env(safe-area-inset-bottom))] shadow-lg"
      >
        <div className="grid grid-cols-7 items-center max-w-lg mx-auto gap-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className="flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition group"
              >
                {/* Icon Container: Rounded-square box */}
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center border transition shadow-2xs ${
                    isActive
                      ? 'bg-[#FAF3DF] border-[#C49A3A] text-[#C49A3A]'
                      : 'bg-[#F8F8F8] border-[#EAEAEA] text-[#737373] group-hover:border-[#C49A3A]/40'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span
                  className={`text-[9px] mt-1 font-bold truncate max-w-full text-center transition ${
                    isActive ? 'text-[#C49A3A]' : 'text-[#737373]'
                  }`}
                >
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

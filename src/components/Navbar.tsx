import React, { useState, useEffect } from 'react';
import {
  Home,
  BookOpen,
  Clock,
  Compass,
  Heart,
  Bookmark,
  Settings,
  Search,
  MapPin,
  Bell,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { getActiveLocation, ActiveLocation } from '../services/wilayahService';

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
  onOpenSearch?: () => void;
}

export const Navbar: React.FC<Props> = ({
  currentTab,
  onSelectTab,
  onOpenLocation,
  onOpenSearch
}) => {
  const [activeLoc, setActiveLoc] = useState<ActiveLocation>(getActiveLocation());

  useEffect(() => {
    const handleLocChanged = (e: CustomEvent<ActiveLocation>) => {
      setActiveLoc(e.detail);
    };
    window.addEventListener('mydom_location_changed' as any, handleLocChanged);
    return () => {
      window.removeEventListener('mydom_location_changed' as any, handleLocChanged);
    };
  }, []);

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

  // Mobile Bottom Nav items (5 core tabs as requested in Section 6 & ref2.png)
  const mobileNavItems = [
    { id: 'home' as NavTab, label: 'Beranda', icon: Home },
    { id: 'quran' as NavTab, label: "Al-Qur'an", icon: BookOpen },
    { id: 'sholat' as NavTab, label: 'Jadwal Salat', icon: Clock },
    { id: 'doa' as NavTab, label: 'Doa', icon: Heart },
    { id: 'settings' as NavTab, label: 'Pengaturan', icon: Settings }
  ];

  return (
    <>
      {/* =========================================================================
          1. DESKTOP LEFT SIDEBAR (Matching ref1.png)
      ========================================================================= */}
      <aside
        aria-label="Sidebar Navigasi Desktop"
        className="hidden lg:flex fixed top-0 left-0 bottom-0 w-64 bg-white border-r border-[#EAEAEA] flex-col justify-between p-5 z-40 select-none shadow-xs"
      >
        <div className="space-y-6">
          {/* Logo & Brand Identity */}
          <div className="flex flex-col items-center text-center pt-2">
            <div className="w-16 h-16 rounded-full bg-[#FAF3DF] border-2 border-[#E5BD58] p-1 shadow-sm flex items-center justify-center overflow-hidden mb-2 group hover:scale-105 transition-transform">
              <img src="/logo.png" alt="Logo My Dom Qur'an" className="w-full h-full object-cover rounded-full" />
            </div>

            <h1 className="font-brand-script text-2xl font-bold text-[#222222] tracking-tight">
              My Dom <span className="text-[#C49A3A]">Qur'an</span>
            </h1>

            <p className="text-[11px] text-[#737373] mt-0.5 leading-snug px-2">
              Temani Tilawah, Dekatkan Hati dengan Al-Qur'an
            </p>
          </div>

          {/* Navigation Links with Boxed Icons */}
          <nav className="space-y-1.5" aria-label="Menu Utama Sidebar">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl font-medium text-xs transition ${
                    isActive
                      ? 'bg-[#C49A3A] text-white shadow-xs'
                      : 'text-[#555555] hover:text-[#222222] hover:bg-[#F8F8F8]'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center border transition ${
                      isActive
                        ? 'bg-white/20 border-white/30 text-white'
                        : 'bg-white border-[#EAEAEA] text-[#737373]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="font-semibold">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Inspirational Card in Sidebar */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#FAF3DF]/80 to-[#FDF8EE] border border-[#E5BD58]/40 space-y-1.5 text-center">
          <div className="w-8 h-8 mx-auto rounded-xl bg-white border border-[#E5BD58]/50 flex items-center justify-center text-[#C49A3A] shadow-2xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <p className="text-xs font-bold text-[#222222]">Mari tingkatkan ibadah hari ini</p>
          <p className="text-[10px] text-[#737373] leading-relaxed">
            Setiap langkah kecil menuju Allah adalah berarti.
          </p>
        </div>
      </aside>

      {/* =========================================================================
          2. DESKTOP TOP HEADER (Beside Sidebar, matching ref1.png)
      ========================================================================= */}
      <header className="hidden lg:flex sticky top-0 z-30 lg:ml-64 bg-white/95 backdrop-blur-md border-b border-[#EAEAEA] px-6 h-16 items-center justify-between gap-4 shadow-2xs">
        {/* Global Search Bar */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#737373] pointer-events-none">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            onClick={onOpenSearch ? onOpenSearch : () => onSelectTab('search')}
            readOnly
            placeholder="Cari surat, ayat, terjemahan, atau doa..."
            className="w-full bg-[#F8F8F8] hover:bg-[#FAF3DF]/30 focus:bg-white border border-[#EAEAEA] hover:border-[#E5BD58]/50 rounded-2xl pl-10 pr-4 py-2 text-xs text-[#222222] placeholder:text-[#888888] cursor-pointer transition shadow-2xs"
          />
        </div>

        {/* Right Section: Location Pill & Action Icons */}
        <div className="flex items-center gap-3">
          {/* Active Location Dropdown Pill */}
          <button
            onClick={onOpenLocation}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-[#F8F8F8] hover:bg-[#FAF3DF] border border-[#EAEAEA] hover:border-[#E5BD58] text-xs font-medium text-[#222222] transition shadow-2xs group"
            title="Klik untuk mengubah wilayah"
          >
            <div className="w-6 h-6 rounded-lg bg-white border border-[#EAEAEA] group-hover:border-[#E5BD58] flex items-center justify-center text-[#C49A3A]">
              <MapPin className="w-3.5 h-3.5" />
            </div>
            <div className="text-left">
              <span className="block text-xs font-bold leading-none">{activeLoc.regencyName}</span>
              <span className="text-[10px] text-[#737373] leading-none">{activeLoc.provinceName}</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#737373] group-hover:text-[#C49A3A] transition" />
          </button>

          {/* Notification Button */}
          <button
            onClick={() => onSelectTab('settings')}
            className="w-9 h-9 rounded-xl bg-white border border-[#EAEAEA] hover:border-[#E5BD58] hover:bg-[#FAF3DF] flex items-center justify-center text-[#737373] hover:text-[#C49A3A] transition shadow-2xs relative"
            title="Pengaturan Notifikasi"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500" />
          </button>

          {/* Quick Settings Icon */}
          <button
            onClick={() => onSelectTab('settings')}
            className="w-9 h-9 rounded-xl bg-white border border-[#EAEAEA] hover:border-[#E5BD58] hover:bg-[#FAF3DF] flex items-center justify-center text-[#737373] hover:text-[#C49A3A] transition shadow-2xs"
            title="Pengaturan"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* =========================================================================
          3. MOBILE TOP HEADER (Matching ref2.png)
      ========================================================================= */}
      <header className="lg:hidden sticky top-0 z-30 w-full bg-white/95 backdrop-blur-md border-b border-[#EAEAEA] px-4 py-2.5 shadow-2xs">
        <div className="flex items-center justify-between gap-2">
          {/* Brand Logo & Title */}
          <button
            onClick={() => onSelectTab('home')}
            className="flex items-center gap-2.5 text-left focus:outline-none min-w-0"
          >
            <div className="w-10 h-10 rounded-full bg-[#FAF3DF] border border-[#E5BD58] p-0.5 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
              <img src="/logo.png" alt="My Dom Qur'an Logo" className="w-full h-full object-cover rounded-full" />
            </div>
            <div className="min-w-0">
              <h1 className="font-brand-script text-lg font-bold text-[#222222] tracking-tight truncate leading-tight">
                My Dom <span className="text-[#C49A3A]">Qur'an</span>
              </h1>
              <p className="text-[10px] text-[#737373] truncate leading-tight">
                Temani Tilawah, Dekatkan Hati dengan Al-Qur'an
              </p>
            </div>
          </button>

          {/* Mobile Right Icons (Search & Notification) */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => onSelectTab('search')}
              className="w-9 h-9 rounded-xl bg-white border border-[#EAEAEA] hover:border-[#E5BD58] text-[#737373] flex items-center justify-center transition shadow-2xs"
              aria-label="Pencarian"
            >
              <Search className="w-4 h-4" />
            </button>
            <button
              onClick={() => onSelectTab('settings')}
              className="w-9 h-9 rounded-xl bg-white border border-[#EAEAEA] hover:border-[#E5BD58] text-[#737373] flex items-center justify-center transition shadow-2xs relative"
              aria-label="Pengaturan Notifikasi"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500" />
            </button>
          </div>
        </div>

        {/* Mobile Location Selector Bar (Matching ref2.png) */}
        {onOpenLocation && (
          <div className="pt-2">
            <button
              onClick={onOpenLocation}
              className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl bg-[#F8F8F8] hover:bg-[#FAF3DF] border border-[#EAEAEA] hover:border-[#E5BD58] text-xs transition"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-6 h-6 rounded-lg bg-white border border-[#EAEAEA] flex items-center justify-center text-[#C49A3A] shrink-0">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <div className="text-left truncate">
                  <span className="font-bold text-[#222222] text-xs">
                    {activeLoc.districtName ? `Kec. ${activeLoc.districtName}, ` : ''}{activeLoc.regencyName}
                  </span>
                  <span className="text-[10px] text-[#737373] ml-1">({activeLoc.provinceName})</span>
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#737373] shrink-0 ml-1" />
            </button>
          </div>
        )}
      </header>

      {/* =========================================================================
          4. MOBILE BOTTOM NAVIGATION (Matching ref2.png)
      ========================================================================= */}
      <nav
        aria-label="Navigasi Bawah Layar Sentuh"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#EAEAEA] px-2 py-1.5 shadow-lg select-none"
      >
        <div className="flex items-center justify-around max-w-lg mx-auto">
          {mobileNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition min-w-[56px] ${
                  isActive ? 'text-[#C49A3A]' : 'text-[#737373] hover:text-[#222222]'
                }`}
              >
                {/* Boxed Icon Rule: Every icon inside a rounded-square container */}
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all ${
                    isActive
                      ? 'bg-[#FAF3DF] border-[#E5BD58] text-[#C49A3A] shadow-xs scale-105'
                      : 'bg-[#F8F8F8] border-[#EAEAEA] text-[#737373]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-semibold mt-1 tracking-tight truncate">
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

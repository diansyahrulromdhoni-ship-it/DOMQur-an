import React, { useState } from 'react';
import { Download, Share2, X, CheckCircle2 } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface Props {
  className?: string;
  variant?: 'primary' | 'compact' | 'minimal';
}

export const PWAInstallButton: React.FC<Props> = ({ className = '', variant = 'primary' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [installedSuccess, setInstalledSuccess] = useState(false);

  if (isInstalled) {
    return null;
  }

  const handleInstall = async () => {
    const success = await install();
    if (success) {
      setInstalledSuccess(true);
      setTimeout(() => setInstalledSuccess(false), 4000);
    }
  };

  if (installedSuccess) {
    return (
      <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3.5 py-2 rounded-xl border border-emerald-200 shadow-xs">
        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
        <span>Aplikasi Berhasil Dipasang</span>
      </div>
    );
  }

  // Android / Chrome / Desktop flow
  if (isInstallable) {
    if (variant === 'compact') {
      return (
        <button
          onClick={handleInstall}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-[#C49A3A] hover:bg-[#B3892B] text-white transition shadow-xs ${className}`}
          title="Pasang aplikasi di layar utama"
        >
          <div className="w-5 h-5 rounded-lg bg-white/20 flex items-center justify-center">
            <Download className="w-3.5 h-3.5" />
          </div>
          <span>Pasang</span>
        </button>
      );
    }

    return (
      <button
        onClick={handleInstall}
        className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-[#C49A3A] hover:bg-[#B3892B] text-white active:scale-98 transition shadow-xs ${className}`}
      >
        <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center">
          <Download className="w-3.5 h-3.5" />
        </div>
        <span>Pasang Aplikasi (PWA)</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className={`flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold rounded-xl border border-[#E5BD58] bg-[#FAF3DF] text-[#C49A3A] hover:bg-[#C49A3A] hover:text-white transition shadow-2xs ${className}`}
        >
          <div className="w-6 h-6 rounded-lg bg-white border border-[#E5BD58] flex items-center justify-center text-[#C49A3A]">
            <Share2 className="w-3.5 h-3.5" />
          </div>
          <span>Pasang di iPhone/iPad</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-150">
            <div className="w-full max-w-sm rounded-3xl bg-white border border-[#EAEAEA] p-6 shadow-2xl relative text-[#222222]">
              <button
                onClick={() => setShowIOSGuide(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-[#F8F8F8] border border-[#EAEAEA] text-[#737373] hover:text-[#222222] flex items-center justify-center transition"
                aria-label="Tutup panduan"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="w-12 h-12 rounded-2xl bg-[#FAF3DF] border border-[#E5BD58] flex items-center justify-center mb-4 shadow-xs overflow-hidden">
                <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
              </div>

              <h3 className="text-base font-bold text-[#222222] mb-1">Pasang di iPhone / iPad</h3>
              <p className="text-xs text-[#737373] mb-4 leading-relaxed">
                Akses <strong>My Dom Qur'an</strong> langsung dari layar utama tanpa bilah browser:
              </p>

              <ol className="text-xs text-[#222222] space-y-2.5 bg-[#F8F8F8] p-4 rounded-2xl border border-[#EAEAEA] mb-5">
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-md bg-[#FAF3DF] border border-[#E5BD58] text-[#C49A3A] font-bold text-[11px] flex items-center justify-center shrink-0">1</span>
                  <span>Tekan tombol <strong>Bagikan (Share)</strong> pada bilah bawah Safari.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-md bg-[#FAF3DF] border border-[#E5BD58] text-[#C49A3A] font-bold text-[11px] flex items-center justify-center shrink-0">2</span>
                  <span>Gulir ke bawah dan pilih <strong>Tambah ke Layar Utama</strong> (Add to Home Screen).</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-md bg-[#FAF3DF] border border-[#E5BD58] text-[#C49A3A] font-bold text-[11px] flex items-center justify-center shrink-0">3</span>
                  <span>Tekan <strong>Tambah</strong> di sudut kanan atas.</span>
                </li>
              </ol>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2.5 rounded-xl bg-[#C49A3A] text-white font-bold text-xs hover:bg-[#B3892B] transition shadow-xs"
              >
                Mengerti
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};

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
      <div className="flex items-center gap-2 text-xs font-semibold text-[#F6C646] bg-[#151515] px-3 py-1.5 rounded-full border border-[#F6C646]/30">
        <CheckCircle2 className="w-4 h-4 text-[#F6C646]" />
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
          className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#F6C646] text-black hover:bg-[#FFD455] transition shadow-md ${className}`}
          title="Pasang aplikasi di layar utama"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Pasang</span>
        </button>
      );
    }

    return (
      <button
        onClick={handleInstall}
        className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm bg-[#F6C646] text-black hover:bg-[#FFD455] active:scale-98 transition shadow-lg shadow-[#F6C646]/10 ${className}`}
      >
        <Download className="w-4 h-4" />
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
          className={`flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-[#F6C646]/50 text-[#F6C646] hover:bg-[#F6C646]/10 transition ${className}`}
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Pasang di iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-2xl bg-[#151515] border border-[#262626] p-6 shadow-2xl relative">
              <button
                onClick={() => setShowIOSGuide(false)}
                className="absolute top-4 right-4 text-[#B8B8B8] hover:text-white p-1 rounded-lg"
                aria-label="Tutup panduan"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-12 h-12 rounded-xl bg-black border border-[#F6C646]/30 flex items-center justify-center mb-4">
                <img src="/pwa-192x192.png" alt="Logo" className="w-8 h-8 rounded-lg object-contain" />
              </div>

              <h3 className="text-base font-bold text-white mb-2">Pasang di iPhone / iPad</h3>
              <p className="text-xs text-[#B8B8B8] mb-4 leading-relaxed">
                Akses AA Dom Qur'an langsung dari layar utama tanpa internet browser bar:
              </p>

              <ol className="text-xs text-[#FFFFFF] space-y-2.5 bg-black/60 p-3.5 rounded-xl border border-[#262626] mb-5">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-[#F6C646]">1.</span>
                  <span>Tekan tombol <strong>Bagikan (Share)</strong> pada bilah bawah Safari.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-[#F6C646]">2.</span>
                  <span>Gulir ke bawah dan pilih <strong>Tambah ke Layar Utama</strong> (Add to Home Screen).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-[#F6C646]">3.</span>
                  <span>Tekan <strong>Tambah</strong> di sudut kanan atas.</span>
                </li>
              </ol>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2.5 rounded-xl bg-[#F6C646] text-black font-bold text-xs hover:bg-[#FFD455] transition"
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

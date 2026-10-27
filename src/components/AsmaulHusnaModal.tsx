import React, { useState } from 'react';
import { X, Sparkles, Search } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const ASMAUL_HUSNA = [
  { no: 1, latin: 'Ar-Rahman', arab: 'الرَّحْمَنُ', arti: 'Yang Maha Pengasih' },
  { no: 2, latin: 'Ar-Rahim', arab: 'الرَّحِيمُ', arti: 'Yang Maha Penyayang' },
  { no: 3, latin: 'Al-Malik', arab: 'الْمَلِكُ', arti: 'Yang Maha Merajai' },
  { no: 4, latin: 'Al-Quddus', arab: 'الْقُدُّوسُ', arti: 'Yang Maha Suci' },
  { no: 5, latin: 'As-Salam', arab: 'السَّلاَمُ', arti: 'Yang Maha Memberi Kesejahteraan' },
  { no: 6, latin: 'Al-Mu\'min', arab: 'الْمُؤْمِنُ', arti: 'Yang Maha Memberi Keamanan' },
  { no: 7, latin: 'Al-Muhaimin', arab: 'الْمُهَيْمِنُ', arti: 'Yang Maha Memelihara' },
  { no: 8, latin: 'Al-\'Aziz', arab: 'الْعَزِيزُ', arti: 'Yang Maha Perkasa' },
  { no: 9, latin: 'Al-Jabbar', arab: 'الْجَبَّارُ', arti: 'Yang Memiliki Kegagahan' },
  { no: 10, latin: 'Al-Mutakabbir', arab: 'الْمُتَكَبِّرُ', arti: 'Yang Memiliki Kebesaran' },
  { no: 11, latin: 'Al-Khaliq', arab: 'الْخَالِقُ', arti: 'Yang Maha Pencipta' },
  { no: 12, latin: 'Al-Bari\'', arab: 'الْبَارِئُ', arti: 'Yang Maha Melepaskan' },
  { no: 13, latin: 'Al-Mushawwir', arab: 'الْمُصَوِّرُ', arti: 'Yang Membentuk Rupa' },
  { no: 14, latin: 'Al-Ghaffar', arab: 'الْغَفَّارُ', arti: 'Yang Maha Pengampun' },
  { no: 15, latin: 'Al-Qahhar', arab: 'الْقَهَّارُ', arti: 'Yang Maha Memaksa' },
  { no: 16, latin: 'Al-Wahhab', arab: 'الْوَهَّابُ', arti: 'Yang Maha Pemberi Karunia' },
  { no: 17, latin: 'Ar-Razzaq', arab: 'الرَّزَّاقُ', arti: 'Yang Maha Pemberi Rezeki' },
  { no: 18, latin: 'Al-Fattah', arab: 'الْفَتَّاحُ', arti: 'Yang Maha Pembuka Rahmat' },
  { no: 19, latin: 'Al-\'Alim', arab: 'الْعَلِيمُ', arti: 'Yang Maha Mengetahui' },
  { no: 20, latin: 'Al-Qabidh', arab: 'الْقَابِضُ', arti: 'Yang Maha Menyempitkan' },
  { no: 21, latin: 'Al-Basith', arab: 'الْبَاسِطُ', arti: 'Yang Maha Melapangkan' },
  { no: 22, latin: 'Al-Khafidh', arab: 'الْخَافِضُ', arti: 'Yang Maha Merendahkan' },
  { no: 23, latin: 'Ar-Rafi\'', arab: 'الرَّافِعُ', arti: 'Yang Maha Meninggikan' },
  { no: 24, latin: 'Al-Mu\'izz', arab: 'الْمُعِزُّ', arti: 'Yang Maha Memuliakan' },
  { no: 25, latin: 'Al-Mudzill', arab: 'المُذِلُّ', arti: 'Yang Maha Menghinakan' },
  { no: 26, latin: 'As-Sami\'', arab: 'السَّمِيعُ', arti: 'Yang Maha Mendengar' },
  { no: 27, latin: 'Al-Bashir', arab: 'الْبَصِيرُ', arti: 'Yang Maha Melihat' },
  { no: 28, latin: 'Al-Hakam', arab: 'الْحَكَمُ', arti: 'Yang Menetapkan Hukum' },
  { no: 29, latin: 'Al-\'Adl', arab: 'الْعَدْلُ', arti: 'Yang Maha Adil' },
  { no: 30, latin: 'Al-Lathif', arab: 'اللَّطِيفُ', arti: 'Yang Maha Lembut' },
  { no: 31, latin: 'Al-Khabir', arab: 'الْخَبِيرُ', arti: 'Yang Maha Mengenal' },
  { no: 32, latin: 'Al-Halim', arab: 'الْحَلِيمُ', arti: 'Yang Maha Penyantun' },
  { no: 33, latin: 'Al-\'Azhim', arab: 'الْعَظِيمُ', arti: 'Yang Maha Agung' },
  { no: 34, latin: 'Al-Ghafur', arab: 'الْغَفُورُ', arti: 'Yang Maha Memberi Pengampunan' },
  { no: 35, latin: 'Asy-Syakur', arab: 'الشَّكُورُ', arti: 'Yang Maha Menghargai' },
  { no: 36, latin: 'Al-\'Aliyy', arab: 'الْعَلِيُّ', arti: 'Yang Maha Tinggi' },
  { no: 37, latin: 'Al-Kabir', arab: 'الْكَبِيرُ', arti: 'Yang Maha Besar' },
  { no: 38, latin: 'Al-Hafizh', arab: 'الْحَفِيظُ', arti: 'Yang Maha Memelihara' },
  { no: 39, latin: 'Al-Muqit', arab: 'المُقِيتُ', arti: 'Yang Maha Pemberi Kecukupan' },
  { no: 40, latin: 'Al-Hasib', arab: 'الْحسِيبُ', arti: 'Yang Maha Membuat Perhitungan' },
  { no: 41, latin: 'Al-Jalil', arab: 'الْجَلِيلُ', arti: 'Yang Maha Luhur' },
  { no: 42, latin: 'Al-Karim', arab: 'الْكَرِيمُ', arti: 'Yang Maha Pemurah' },
  { no: 43, latin: 'Ar-Raqib', arab: 'الرَّقِيبُ', arti: 'Yang Maha Mengawasi' },
  { no: 44, latin: 'Al-Mujib', arab: 'الْمُجِيبُ', arti: 'Yang Maha Mengabulkan' },
  { no: 45, latin: 'Al-Wasi\'', arab: 'الْوَاسِعُ', arti: 'Yang Maha Luas' },
  { no: 46, latin: 'Al-Hakim', arab: 'الْحَكِيمُ', arti: 'Yang Maha Bijaksana' },
  { no: 47, latin: 'Al-Wadud', arab: 'الْوَدُودُ', arti: 'Yang Maha Mengasihi' },
  { no: 48, latin: 'Al-Majid', arab: 'الْمَجِيدُ', arti: 'Yang Maha Mulia' },
  { no: 49, latin: 'Al-Ba\'its', arab: 'الْبَاعِثُ', arti: 'Yang Maha Membangkitkan' },
  { no: 50, latin: 'Asy-Syahid', arab: 'الشَّهِيدُ', arti: 'Yang Maha Menyaksikan' },
  { no: 51, latin: 'Al-Haqq', arab: 'الْحَقُّ', arti: 'Yang Maha Benar' },
  { no: 52, latin: 'Al-Wakil', arab: 'الْوَكِيلُ', arti: 'Yang Maha Memelihara' },
  { no: 53, latin: 'Al-Qawiyy', arab: 'الْقَوِيُّ', arti: 'Yang Maha Kuat' },
  { no: 54, latin: 'Al-Matin', arab: 'الْمَتِينُ', arti: 'Yang Maha Kokoh' },
  { no: 55, latin: 'Al-Waliyy', arab: 'الْوَلِيُّ', arti: 'Yang Maha Melindungi' },
  { no: 56, latin: 'Al-Hamid', arab: 'الْحَمِيدُ', arti: 'Yang Maha Terpuji' },
  { no: 57, latin: 'Al-Muhshi', arab: 'الْمُحْصِي', arti: 'Yang Maha Menghitung' },
  { no: 58, latin: 'Al-Mubdi\'', arab: 'الْمُبْدِئُ', arti: 'Yang Maha Memulai' },
  { no: 59, latin: 'Al-Mu\'id', arab: 'الْمُعِيدُ', arti: 'Yang Maha Mengembalikan Kehidupan' },
  { no: 60, latin: 'Al-Muhyi', arab: 'الْمُحْيِي', arti: 'Yang Maha Menghidupkan' },
  { no: 61, latin: 'Al-Mumit', arab: 'اَلْمُمِيتُ', arti: 'Yang Maha Mematikan' },
  { no: 62, latin: 'Al-Hayy', arab: 'الْحَيُّ', arti: 'Yang Maha Hidup' },
  { no: 63, latin: 'Al-Qayyum', arab: 'الْقَيُّومُ', arti: 'Yang Maha Mandiri' },
  { no: 64, latin: 'Al-Wajid', arab: 'الْوَاجِدُ', arti: 'Yang Maha Menemukan' },
  { no: 65, latin: 'Al-Majid', arab: 'الْمَاجِدُ', arti: 'Yang Maha Mulia' },
  { no: 66, latin: 'Al-Wahid', arab: 'الْواحِدُ', arti: 'Yang Maha Tunggal' },
  { no: 67, latin: 'Al-Ahad', arab: 'اَلاَحَدُ', arti: 'Yang Maha Esa' },
  { no: 68, latin: 'Ash-Shamad', arab: 'الصَّمَدُ', arti: 'Yang Maha Dibutuhkan' },
  { no: 69, latin: 'Al-Qadir', arab: 'الْقَادِرُ', arti: 'Yang Maha Menentukan' },
  { no: 70, latin: 'Al-Muqtadir', arab: 'الْمُقْتَدِرُ', arti: 'Yang Maha Berkuasa' },
  { no: 71, latin: 'Al-Muqaddim', arab: 'الْمُقَدِّمُ', arti: 'Yang Maha Mendahulukan' },
  { no: 72, latin: 'Al-Mu\'akhkhir', arab: 'الْمُؤَخِّرُ', arti: 'Yang Maha Mengakhirkan' },
  { no: 73, latin: 'Al-Awwal', arab: 'الأوَّلُ', arti: 'Yang Maha Awal' },
  { no: 74, latin: 'Al-Akhir', arab: 'الآخِرُ', arti: 'Yang Maha Akhir' },
  { no: 75, latin: 'Azh-Zhahir', arab: 'الظَّاهِرُ', arti: 'Yang Maha Nyata' },
  { no: 76, latin: 'Al-Bathin', arab: 'الْبَاطِنُ', arti: 'Yang Maha Ghaib' },
  { no: 77, latin: 'Al-Wali', arab: 'الْوَالِي', arti: 'Yang Maha Memerintah' },
  { no: 78, latin: 'Al-Muta\'ali', arab: 'الْمُتَعَالِي', arti: 'Yang Maha Tinggi' },
  { no: 79, latin: 'Al-Barr', arab: 'الْبَرُّ', arti: 'Yang Maha Penderma' },
  { no: 80, latin: 'At-Tawwab', arab: 'التَّوَّابُ', arti: 'Yang Maha Penerima Tobat' },
  { no: 81, latin: 'Al-Muntaqim', arab: 'الْمُنْتَقِمُ', arti: 'Yang Maha Pemberi Balasan' },
  { no: 82, latin: 'Al-\'Afuww', arab: 'العَفُوُّ', arti: 'Yang Maha Pemaaf' },
  { no: 83, latin: 'Ar-Ra\'uf', arab: 'الرَّؤُوفُ', arti: 'Yang Maha Pengasuh' },
  { no: 84, latin: 'Malikul Mulk', arab: 'مَالِكُ الْمُلْكِ', arti: 'Penguasa Kerajaan Semesta' },
  { no: 85, latin: 'Dzul Jalali wal Ikram', arab: 'ذُوالْجَلاَلِ وَالإكْرَامِ', arti: 'Pemilik Kebesaran dan Kemuliaan' },
  { no: 86, latin: 'Al-Muqsith', arab: 'الْمُقْسِطُ', arti: 'Yang Maha Pemberi Keadilan' },
  { no: 87, latin: 'Al-Jami\'', arab: 'الْجَامِعُ', arti: 'Yang Maha Mengumpulkan' },
  { no: 88, latin: 'Al-Ghaniyy', arab: 'الْغَنِيُّ', arti: 'Yang Maha Kaya' },
  { no: 89, latin: 'Al-Mughni', arab: 'الْمُغْنِي', arti: 'Yang Maha Memberi Kekayaan' },
  { no: 90, latin: 'Al-Mani\'', arab: 'اَلْمَانِعُ', arti: 'Yang Maha Mencegah' },
  { no: 91, latin: 'Adh-Dharr', arab: 'الضَّارَّ', arti: 'Yang Maha Penimpa Kemudharatan' },
  { no: 92, latin: 'An-Nafi\'', arab: 'النَّافِعُ', arti: 'Yang Maha Memberi Manfaat' },
  { no: 93, latin: 'An-Nur', arab: 'النُّورُ', arti: 'Yang Maha Bercahaya' },
  { no: 94, latin: 'Al-Hadi', arab: 'الْهَادِي', arti: 'Yang Maha Pemberi Petunjuk' },
  { no: 95, latin: 'Al-Badi\'', arab: 'الْبَدِيعُ', arti: 'Yang Maha Pencipta Keindahan' },
  { no: 96, latin: 'Al-Baqi', arab: 'الْبَاقِي', arti: 'Yang Maha Kekal' },
  { no: 97, latin: 'Al-Warits', arab: 'الْوَارِثُ', arti: 'Yang Maha Mewarisi' },
  { no: 98, latin: 'Ar-Rasyid', arab: 'الرَّشِيدُ', arti: 'Yang Maha Pandai Menuntun' },
  { no: 99, latin: 'Ash-Shabur', arab: 'الصَّبُورُ', arti: 'Yang Maha Sabar' }
];

export const AsmaulHusnaModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const filtered = ASMAUL_HUSNA.filter(
    (item) =>
      item.latin.toLowerCase().includes(search.toLowerCase()) ||
      item.arti.toLowerCase().includes(search.toLowerCase()) ||
      String(item.no) === search.trim()
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-3xl bg-[#141414] border border-[#262626] rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#262626]">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#F6C646]/20 text-[#F6C646]">
              <Sparkles className="w-4 h-4 fill-[#F6C646]" />
            </span>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">
                99 Asmaul Husna (Nama-Nama Indah Allah)
              </h3>
              <p className="text-[11px] text-[#888]">
                "Milik Allah nama-nama yang indah, maka bermohonlah kepada-Nya dengan menyebut nama-nama itu." (QS. Al-A'raf: 180)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#888] hover:text-white rounded-lg hover:bg-[#222] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="py-3">
          <div className="relative">
            <Search className="w-4 h-4 text-[#888] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama Allah atau arti (misal: Ar-Rahman, Pengasih, 1)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-black text-white pl-9 pr-4 py-2 rounded-xl border border-[#262626] text-xs focus:outline-none focus:border-[#F6C646]"
            />
          </div>
        </div>

        {/* 99 Grid */}
        <div className="overflow-y-auto py-1 flex-1 pr-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
          {filtered.map((item) => (
            <div
              key={item.no}
              className="bg-black/60 border border-[#262626] rounded-2xl p-3.5 flex items-center justify-between hover:border-[#F6C646]/40 transition group"
            >
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-lg bg-[#181818] border border-[#333] flex items-center justify-center text-xs font-bold text-[#F6C646] font-mono shrink-0">
                  {item.no}
                </span>
                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-[#F6C646] transition-colors">
                    {item.latin}
                  </h4>
                  <p className="text-[11px] text-[#888] leading-tight mt-0.5">{item.arti}</p>
                </div>
              </div>

              <div className="text-right pl-2 shrink-0">
                <span className="font-quran text-lg text-[#FFD455]">{item.arab}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

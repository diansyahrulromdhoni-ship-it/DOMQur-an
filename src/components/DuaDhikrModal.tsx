import React, { useState } from 'react';
import { X, Heart, Search, Check, Copy } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

interface DuaItem {
  id: string;
  category: 'adzan' | 'sholat' | 'pagi-petang' | 'harian';
  title: string;
  arabic: string;
  latin: string;
  arti: string;
  riwayat: string;
}

export const DUA_COLLECTION: DuaItem[] = [
  {
    id: 'adzan-1',
    category: 'adzan',
    title: 'Doa Setelah Mendengar Adzan',
    arabic: 'اللَّهُمَّ رَبَّ هَذِهِ الدَّعْوَةِ التَّامَّةِ، وَالصَّلَاةِ الْقَائِمَةِ، آتِ مُحَمَّدًا الْوَسِيلَةَ وَالْفَضِيلَةَ، وَابْعَثْهُ مَقَامًا مَحْمُودًا الَّذِي وَعَدْتَهُ',
    latin: 'Allahumma rabba hadzihid da\'watit tammah, wash-sholatil qo\'imah, ati Muhammadanil wasilata wal fadhilah, wab\'atshu maqomam mahmudalladzi wa\'adtah.',
    arti: 'Ya Allah, Tuhan Pemilik seruan yang sempurna ini dan sholat yang senantiasa didirikan, berikanlah kepada Nabi Muhammad wasilah dan keutamaan, serta tempatkanlah ia pada kedudukan terpuji yang telah Engkau janjikan.',
    riwayat: 'HR. Bukhari no. 614'
  },
  {
    id: 'sholat-istighfar',
    category: 'sholat',
    title: 'Istighfar Sesudah Sholat Fardhu (3x)',
    arabic: 'أَسْتَغْفِرُ اللهَ الْعَظِيمَ الَّذِي لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ وَأَتُوبُ إِلَيْهِ',
    latin: 'Astaghfirullahal \'azhim, alladzi laa ilaha illa huwal hayyul qoyyumu wa atubu ilaih.',
    arti: 'Aku memohon ampun kepada Allah Yang Maha Agung, tidak ada Tuhan selain Dia Yang Maha Hidup lagi Maha Berdiri Sendiri, dan aku bertobat kepada-Nya.',
    riwayat: 'HR. Muslim no. 591'
  },
  {
    id: 'sholat-tahlil',
    category: 'sholat',
    title: 'Dzikir Tahlil & Pujian Kekuasaan Allah',
    arabic: 'لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، اللَّهُمَّ لَا مَانِعَ لِمَا أَعْطَيْتَ، وَلَا مُعْطِيَ لِمَا مَنَعْتَ، وَلَا يَنْفَعُ ذَا الْجَدِّ مِنْكَ الْجَدُّ',
    latin: 'Laa ilaha illallahu wahdahu laa syarika lah, lahul mulku wa lahul hamdu wa huwa \'ala kulli syai\'in qodir. Allahumma laa mani\'a lima a\'thoita, wa laa mu\'thiya lima mana\'ta, wa laa yanfa\'u dzal jaddi minkal jaddu.',
    arti: 'Tiada Tuhan selain Allah semata, tiada sekutu bagi-Nya. Bagi-Nya kerajaan dan segala puji, dan Dia Maha Kuasa atas segala sesuatu. Ya Allah, tidak ada yang dapat menghalangi apa yang Engkau berikan, dan tidak ada yang dapat memberi apa yang Engkau halangi, serta tidak berguna kekayaan bagi orang yang memilikinya dari siksa-Mu.',
    riwayat: 'HR. Bukhari no. 844 & Muslim no. 593'
  },
  {
    id: 'sholat-tasbih',
    category: 'sholat',
    title: 'Tasbih, Tahmid, & Takbir (Masing-masing 33x)',
    arabic: 'سُبْحَانَ اللهِ (٣٣) • الْحَمْدُ لِلَّهِ (٣٣) • اللهُ أَكْبَرُ (٣٣)',
    latin: 'Subhanallah (33x) • Alhamdulillah (33x) • Allahu Akbar (33x)',
    arti: 'Maha Suci Allah • Segala Puji bagi Allah • Allah Maha Besar.',
    riwayat: 'HR. Muslim no. 597'
  },
  {
    id: 'pagi-sayyidul-istighfar',
    category: 'pagi-petang',
    title: 'Sayyidul Istighfar (Penghulu Istighfar)',
    arabic: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ',
    latin: 'Allahumma anta rabbi laa ilaha illa anta, kholaqtani wa ana \'abduka, wa ana \'ala \'ahdika wa wa\'dika mastatho\'tu. A\'udzu bika min syarri ma shona\'tu, abu\'u laka bini\'matika \'alayya, wa abu\'u bidzanbi faghfir li, fainnahu laa yaghfirudz dzunuba illa anta.',
    arti: 'Ya Allah, Engkau adalah Tuhanku, tiada tuhan selain Engkau. Engkau yang menciptakan aku dan aku adalah hamba-Mu. Aku memegang perjanjian-Mu sekuat kemampuanku. Aku berlindung kepada-Mu dari keburukan yang telah kuperbuat. Aku mengakui segala nikmat-Mu kepadaku dan aku mengakui segala dosaku, maka ampunilah aku, sesungguhnya tiada yang mengampuni dosa selain Engkau.',
    riwayat: 'HR. Bukhari no. 6306'
  },
  {
    id: 'harian-dunia-akhirat',
    category: 'harian',
    title: 'Doa Kebaikan Dunia & Akhirat (Sapu Jagad)',
    arabic: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ',
    latin: 'Rabbana atina fid-dunya hasanah, wa fil-akhirati hasanah, wa qina \'adzaban-nar.',
    arti: 'Ya Tuhan kami, berilah kami kebaikan di dunia dan kebaikan di akhirat, dan lindungilah kami dari siksa neraka.',
    riwayat: 'QS. Al-Baqarah: 201'
  },
  {
    id: 'harian-kedua-orang-tua',
    category: 'harian',
    title: 'Doa untuk Kedua Orang Tua',
    arabic: 'رَبِّ اغْفِرْ لِي وَلِوَالِدَيَّ وَارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا',
    latin: 'Rabbighfir li wa liwalidayya warhamhuma kama robbayani shoghiro.',
    arti: 'Wahai Tuhanku, ampunilah aku dan kedua orang tuaku, serta sayangilah keduanya sebagaimana mereka telah mendidik aku di waktu kecil.',
    riwayat: 'QS. Al-Isra\': 24'
  }
];

export const DuaDhikrModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredDua = DUA_COLLECTION.filter((d) => {
    const matchCat = activeCategory === 'all' || d.category === activeCategory;
    const matchQuery =
      searchQuery === '' ||
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.arti.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.latin.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchQuery;
  });

  const handleCopy = (item: DuaItem) => {
    const text = `${item.title}\n\n${item.arabic}\n\n${item.latin}\n\n"${item.arti}" (${item.riwayat})`;
    navigator.clipboard.writeText(text);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-[#141414] border border-[#262626] rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#262626]">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#F6C646]/20 text-[#F6C646]">
              <Heart className="w-4 h-4 fill-[#F6C646]" />
            </span>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">
                Kumpulan Doa Harian & Dzikir Mustajab
              </h3>
              <p className="text-[11px] text-[#888]">Teks Arab, Latin, Terjemahan & Sanad Riwayat</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#888] hover:text-white rounded-lg hover:bg-[#222] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Category Pills */}
        <div className="pt-3 pb-2 space-y-2">
          <div className="relative">
            <Search className="w-4 h-4 text-[#888] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari doa (misal: adzan, istighfar, orang tua)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black text-white pl-9 pr-4 py-2 rounded-xl border border-[#262626] text-xs focus:outline-none focus:border-[#F6C646]"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {[
              { id: 'all', label: 'Semua Doa' },
              { id: 'adzan', label: 'Doa Adzan' },
              { id: 'sholat', label: 'Dzikir Sholat' },
              { id: 'pagi-petang', label: 'Pagi & Petang' },
              { id: 'harian', label: 'Doa Harian' }
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition ${
                  activeCategory === cat.id
                    ? 'bg-[#F6C646] text-black font-bold shadow-sm'
                    : 'bg-[#1A1A1A] text-[#888] hover:text-white border border-[#262626]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* List of Duas */}
        <div className="overflow-y-auto py-2 space-y-3 flex-1 pr-1">
          {filteredDua.length === 0 ? (
            <div className="text-center py-8 text-xs text-[#888]">
              Tidak menemukan doa dengan kata kunci tersebut.
            </div>
          ) : (
            filteredDua.map((item) => (
              <div
                key={item.id}
                className="bg-black/70 border border-[#262626] rounded-2xl p-4 space-y-3 hover:border-[#F6C646]/30 transition"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F6C646]" />
                    <span>{item.title}</span>
                  </h4>
                  <button
                    onClick={() => handleCopy(item)}
                    className="flex items-center gap-1 text-[11px] text-[#888] hover:text-[#F6C646] transition p-1"
                    title="Salin teks doa"
                  >
                    {copiedId === item.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>{copiedId === item.id ? 'Tersalin' : 'Salin'}</span>
                  </button>
                </div>

                <p className="font-quran text-right text-xl sm:text-2xl text-[#FFD455] leading-loose">
                  {item.arabic}
                </p>

                <div className="space-y-1.5 pt-2 border-t border-[#222] text-xs">
                  <p className="text-white italic leading-relaxed">{item.latin}</p>
                  <p className="text-[#B8B8B8] leading-relaxed">"{item.arti}"</p>
                  <span className="text-[10px] text-[#F6C646] font-medium block pt-1">
                    {item.riwayat}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

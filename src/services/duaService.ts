/**
 * Comprehensive Authentic Islamic Dua & Dhikr Collection
 * Sources: Al-Qur'an & Kutubus Sittah (Bukhari, Muslim, Abu Dawud, Tirmidzi, etc.)
 */

export interface DuaItem {
  id: string;
  category:
    | 'setelah_salat'
    | 'pagi_petang'
    | 'tidur'
    | 'rumah'
    | 'masjid'
    | 'makan'
    | 'bepergian'
    | 'ampunan'
    | 'orang_tua'
    | 'belajar'
    | 'perlindungan'
    | 'quran';
  categoryLabel: string;
  title: string;
  arabic: string;
  latin: string;
  translation: string;
  reference: string;
  notes?: string;
}

export const DUA_CATEGORIES = [
  { id: 'all', label: 'Semua Kategori' },
  { id: 'setelah_salat', label: 'Setelah Salat' },
  { id: 'pagi_petang', label: 'Pagi & Petang' },
  { id: 'tidur', label: 'Sebelum & Bangun Tidur' },
  { id: 'rumah', label: 'Masuk & Keluar Rumah' },
  { id: 'masjid', label: 'Masuk & Keluar Masjid' },
  { id: 'makan', label: 'Sebelum & Sesudah Makan' },
  { id: 'bepergian', label: 'Bepergian / Safar' },
  { id: 'ampunan', label: 'Memohon Ampun (Taubat)' },
  { id: 'orang_tua', label: 'Untuk Orang Tua' },
  { id: 'belajar', label: 'Belajar & Menuntut Ilmu' },
  { id: 'perlindungan', label: 'Doa Perlindungan' },
  { id: 'quran', label: 'Pilihan Al-Qur\'an' }
] as const;

export const AUTHENTIC_DUAS: DuaItem[] = [
  // 1. Doa Setelah Salat
  {
    id: 'sholat_istighfar',
    category: 'setelah_salat',
    categoryLabel: 'Setelah Salat',
    title: 'Istighfar Sesudah Salam (Dibaca 3x)',
    arabic: 'أَسْتَغْفِرُ اللَّهَ (٣x) ، اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ، تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ',
    latin: 'Astaghfirullah (3x), Allahumma antas-salam wa minkas-salam, tabarakta ya dzal-jalali wal-ikram.',
    translation: 'Aku memohon ampun kepada Allah (3x). Ya Allah, Engkau Mahasejahtera dan dari-Mulah kesejahteraan, Mahasuci Engkau wahai Tuhan Pemilik Keagungan dan Kemuliaan.',
    reference: 'HR. Muslim no. 591'
  },
  {
    id: 'sholat_tahlil',
    category: 'setelah_salat',
    categoryLabel: 'Setelah Salat',
    title: 'Dzikir Tahlil & Penyerahan Diri',
    arabic: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، اللَّهُمَّ لَا مَانِعَ لِمَا أَعْطَيْتَ، وَلَا مُعْطِيَ لِمَا مَنَعْتَ، وَلَا يَنْفَعُ ذَا الْجَدِّ مِنْكَ الْجَدُّ',
    latin: 'Laa ilaha illallahu wahdahu laa syarika lah, lahul-mulku wa lahul-hamdu wa huwa \'ala kulli syai\'in qadir. Allahumma laa mani\'a lima a\'thaita, wa laa mu\'thiya lima mana\'ta, wa laa yanfa\'u dzal-jaddi minkal-jaddu.',
    translation: 'Tiada tuhan selain Allah semata yang tiada sekutu bagi-Nya. Bagi-Nya segala kerajaan dan segala puji, dan Dia Mahakuasa atas segala sesuatu. Ya Allah, tidak ada yang dapat menghalangi apa yang Engkau berikan, dan tidak ada yang dapat memberi apa yang Engkau halangi, dan tidak berguna kekayaan bagi pemiliknya dari azab-Mu.',
    reference: 'HR. Bukhari no. 844 & Muslim no. 593'
  },
  {
    id: 'sholat_tasbih_tahmid_takbir',
    category: 'setelah_salat',
    categoryLabel: 'Setelah Salat',
    title: 'Tasbih, Tahmid, & Takbir (Masing-masing 33x)',
    arabic: 'سُبْحَانَ اللَّهِ (٣٣x) ، الْحَمْدُ لِلَّهِ (٣٣x) ، اللَّهُ أَكْبَرُ (٣٣x)',
    latin: 'Subhanallah (33x), Alhamdulillah (33x), Allahu Akbar (33x)',
    translation: 'Mahasuci Allah (33x), Segala puji bagi Allah (33x), Allah Mahabesar (33x).',
    reference: 'HR. Muslim no. 597'
  },
  {
    id: 'sholat_syukur_ibadah',
    category: 'setelah_salat',
    categoryLabel: 'Setelah Salat',
    title: 'Doa Memohon Kekuatan Ibadah & Syukur',
    arabic: 'اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ',
    latin: 'Allahumma a\'inni \'ala dzikrika wa syukrika wa husni \'ibadatik.',
    translation: 'Ya Allah, bantulah aku untuk senantiasa mengingat-Mu, bersyukur kepada-Mu, dan memperbagus ibadah kepada-Mu.',
    reference: 'HR. Abu Dawud no. 1522 & An-Nasa\'i no. 1303 (Shahih)'
  },

  // 2. Doa Pagi dan Petang
  {
    id: 'pagi_sayyidul_istighfar',
    category: 'pagi_petang',
    categoryLabel: 'Pagi & Petang',
    title: 'Sayyidul Istighfar (Penghulu Istighfar)',
    arabic: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ',
    latin: 'Allahumma anta rabbi laa ilaha illa anta, khalaqtani wa ana \'abduka, wa ana \'ala \'ahdika wa wa\'dika mastatha\'tu. A\'udzu bika min syarri ma shana\'tu, abu\'u laka bini\'matika \'alayya, wa abu\'u bidzanbi faghfir li, fa-innahu laa yaghfirudz-dzunuba illa anta.',
    translation: 'Ya Allah, Engkau adalah Tuhanku, tiada tuhan yang berhak disembah selain Engkau. Engkaulah yang menciptakanku dan aku adalah hamba-Mu. Aku akan setia pada perjanjianku dengan-Mu semampuku. Aku berlindung kepada-Mu dari keburukan yang telah kuperbuat. Aku mengakui segala nikmat-Mu kepadaku dan aku mengakui dosaku, maka ampunilah aku, karena sesungguhnya tidak ada yang dapat mengampuni dosa-dosa selain Engkau.',
    reference: 'HR. Bukhari no. 6306'
  },
  {
    id: 'pagi_petang_perlindungan',
    category: 'pagi_petang',
    categoryLabel: 'Pagi & Petang',
    title: 'Perlindungan Dari Bahaya Langit & Bumi (3x)',
    arabic: 'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ',
    latin: 'Bismillahilladzi laa yadhurru ma\'as-mihi syai\'un fil-ardhi wa laa fis-sama\'i wa huwas-sami\'ul-\'alim.',
    translation: 'Dengan menyebut nama Allah yang bersama nama-Nya tidak ada sesuatu pun di bumi maupun di langit yang dapat mendatangkan bahaya, dan Dia Maha Mendengar lagi Maha Mengetahui.',
    reference: 'HR. Abu Dawud no. 5088 & At-Tirmidzi no. 3388 (Hasan Shahih)'
  },
  {
    id: 'pagi_radhitu_billah',
    category: 'pagi_petang',
    categoryLabel: 'Pagi & Petang',
    title: 'Keridhaan Menjadi Muslim (3x)',
    arabic: 'رَضِيتُ بِاللَّهِ رَبًّا، وَبِالْإِسْلَامِ دِينًا، وَبِمُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ نَبِيًّا',
    latin: 'Radhitu billahi rabba, wa bil-islami dina, wa bi Muhammadin shallallahu \'alaihi wa sallama nabiyya.',
    translation: 'Aku ridha Allah sebagai Tuhanku, Islam sebagai agamaku, dan Nabi Muhammad shallallahu \'alaihi wa sallam sebagai Nabiku.',
    reference: 'HR. Abu Dawud no. 5072 & At-Tirmidzi no. 3389'
  },

  // 3. Doa Sebelum dan Sesudah Tidur
  {
    id: 'tidur_sebelum',
    category: 'tidur',
    categoryLabel: 'Sebelum & Bangun Tidur',
    title: 'Doa Sebelum Tidur',
    arabic: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا',
    latin: 'Bismikallahumma amutu wa ahya.',
    translation: 'Dengan nama-Mu ya Allah, aku mati dan aku hidup.',
    reference: 'HR. Bukhari no. 6324 & Muslim no. 2711'
  },
  {
    id: 'tidur_bangun',
    category: 'tidur',
    categoryLabel: 'Sebelum & Bangun Tidur',
    title: 'Doa Bangun Tidur',
    arabic: 'الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ',
    latin: 'Alhamdulillahilladzi ahyana ba\'da ma amatana wa ilaihin-nusyur.',
    translation: 'Segala puji bagi Allah yang telah menghidupkan kami setelah mematikan kami, dan hanya kepada-Nya tempat kami kembali (dibangkitkan).',
    reference: 'HR. Bukhari no. 6312 & Muslim no. 2711'
  },

  // 4. Doa Masuk dan Keluar Rumah
  {
    id: 'rumah_keluar',
    category: 'rumah',
    categoryLabel: 'Masuk & Keluar Rumah',
    title: 'Doa Keluar Rumah (Tawakkal)',
    arabic: 'بِسْمِ اللَّهِ تَوَكَّلْتُ عَلَى اللَّهِ، لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ',
    latin: 'Bismillahi tawakkaltu \'alallah, laa hawla wa laa quwwata illa billah.',
    translation: 'Dengan nama Allah, aku berserah diri kepada Allah. Tidak ada daya dan kekuatan kecuali dengan pertolongan Allah semata.',
    reference: 'HR. Abu Dawud no. 5095 & At-Tirmidzi no. 3426 (Shahih)'
  },
  {
    id: 'rumah_masuk',
    category: 'rumah',
    categoryLabel: 'Masuk & Keluar Rumah',
    title: 'Doa Masuk Rumah',
    arabic: 'بِسْمِ اللَّهِ وَلَجْنَا، وَبِسْمِ اللَّهِ خَرَجْنَا، وَعَلَى اللَّهِ رَبِّنَا تَوَكَّلْنَا',
    latin: 'Bismillahi walajnaa, wa bismillahi kharajnaa, wa \'alallahi rabbina tawakkalnaa.',
    translation: 'Dengan nama Allah kami masuk, dengan nama Allah kami keluar, dan kepada Allah Tuhan kami, kami bertawakkal.',
    reference: 'HR. Abu Dawud no. 5096'
  },

  // 5. Doa Masuk dan Keluar Masjid
  {
    id: 'masjid_masuk',
    category: 'masjid',
    categoryLabel: 'Masuk & Keluar Masjid',
    title: 'Doa Masuk Masjid',
    arabic: 'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ',
    latin: 'Allahummaf-tah lii abwaaba rahmatik.',
    translation: 'Ya Allah, bukakanlah untukku pintu-pintu rahmat-Mu.',
    reference: 'HR. Muslim no. 713'
  },
  {
    id: 'masjid_keluar',
    category: 'masjid',
    categoryLabel: 'Masuk & Keluar Masjid',
    title: 'Doa Keluar Masjid',
    arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ',
    latin: 'Allahumma inni as-aluka min fadhlik.',
    translation: 'Ya Allah, sesungguhnya aku memohon karunia dan keutamaan dari-Mu.',
    reference: 'HR. Muslim no. 713'
  },

  // 6. Doa Sebelum dan Sesudah Makan
  {
    id: 'makan_sebelum',
    category: 'makan',
    categoryLabel: 'Sebelum & Sesudah Makan',
    title: 'Doa Sebelum Makan',
    arabic: 'اللَّهُمَّ بَارِكْ لَنَا فِيمَا رَزَقْتَنَا وَقِنَا عَذَابَ النَّارِ، بِسْمِ اللَّهِ',
    latin: 'Allahumma baarik lanaa fiimaa razaqtanaa wa qinaa \'adzaban-naar, bismillah.',
    translation: 'Ya Allah, berkahilah kami dalam rezeki yang telah Engkau anugerahkan kepada kami dan peliharalah kami dari siksa neraka. Dengan nama Allah.',
    reference: 'HR. Ibnu Sunni no. 457 & Hadis Bismillah HR. Bukhari no. 5376'
  },
  {
    id: 'makan_sesudah',
    category: 'makan',
    categoryLabel: 'Sebelum & Sesudah Makan',
    title: 'Doa Sesudah Makan',
    arabic: 'الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنَا وَسَقَانَا وَجَعَلَنَا مُسْلِمِينَ',
    latin: 'Alhamdulillahilladzi ath\'amanaa wa saqaanaa wa ja\'alanaa muslimiin.',
    translation: 'Segala puji bagi Allah yang telah memberi makan dan minum kepada kami, serta menjadikan kami orang-orang yang berserah diri (Muslim).',
    reference: 'HR. Abu Dawud no. 3850 & At-Tirmidzi no. 3457'
  },

  // 7. Doa Bepergian / Safar
  {
    id: 'safar_kendaraan',
    category: 'bepergian',
    categoryLabel: 'Bepergian / Safar',
    title: 'Doa Menaiki Kendaraan & Berpergian',
    arabic: 'سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَٰذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ ، وَإِنَّا إِلَىٰ رَبِّنَا لَمُنْقَلِبُونَ',
    latin: 'Subhanalladzi sakh-khara lanaa haadzaa wa maa kunnaa lahu muqriniin, wa innaa ilaa rabbinaa lamunqalibuun.',
    translation: 'Mahasuci Allah yang telah menundukkan semua ini bagi kami padahal sebelumnya kami tidak mampu menguasainya, dan sesungguhnya kami akan kembali kepada Tuhan kami.',
    reference: 'QS. Az-Zukhruf: 13-14 & HR. Muslim no. 1342'
  },
  {
    id: 'safar_perlindungan',
    category: 'bepergian',
    categoryLabel: 'Bepergian / Safar',
    title: 'Doa Memohon Perlindungan Saat Safar',
    arabic: 'اللَّهُمَّ إِنَّا نَسْأَلُكَ فِي سَفَرِنَا هَٰذَا الْبِرَّ وَالتَّقْوَىٰ، وَمِنَ الْعَمَلِ مَا تَرْضَىٰ، اللَّهُمَّ هَوِّنْ عَلَيْنَا سَفَرَنَا هَٰذَا وَاطْوِ عَنَّا بُعْدَهُ',
    latin: 'Allahumma innaa nas-aluka fii safarinaa haadzal-birra wat-taqwaa, wa minal-\'amali maa tardhaa. Allahumma hawwin \'alainaa safaranaa haadzaa wath-wi \'annaa bu\'dah.',
    translation: 'Ya Allah, kami memohon kepada-Mu dalam perjalanan kami ini kebaikan dan ketakwaan, serta perbuatan yang Engkau ridhai. Ya Allah, mudahkanlah perjalanan kami ini dan dekatkanlah kejauhannya.',
    reference: 'HR. Muslim no. 1342'
  },

  // 8. Doa Memohon Ampun (Taubat)
  {
    id: 'ampunan_nabi_adam',
    category: 'ampunan',
    categoryLabel: 'Memohon Ampun (Taubat)',
    title: 'Doa Taubat & Penyesalan Nabi Adam \'Alaihissalam',
    arabic: 'رَبَّنَا ظَلَمْنَا أَنْفُسَنَا وَإِنْ لَمْ تَغْفِرْ لَنَا وَتَرْحَمْنَا لَنَكُونَنَّ مِنَ الْخَاسِرِينَ',
    latin: 'Rabbanaa zhalamnaa anfusanaa wa illam taghfir lanaa wa tarhamnaa lanakuunanna minal-khaasiriin.',
    translation: 'Ya Tuhan kami, kami telah menzalimi diri kami sendiri. Jika Engkau tidak mengampuni kami dan memberi rahmat kepada kami, niscaya pastilah kami termasuk orang-orang yang rugi.',
    reference: 'QS. Al-A\'raf: 23'
  },
  {
    id: 'ampunan_yunus',
    category: 'ampunan',
    categoryLabel: 'Memohon Ampun (Taubat)',
    title: 'Doa Dzun-Nun (Nabi Yunus dalam Kesulitan)',
    arabic: 'لَا إِلَهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ',
    latin: 'Laa ilaha illa anta subhaanaka innii kuntu minazh-zhaalimiin.',
    translation: 'Tidak ada Tuhan selain Engkau, Mahasuci Engkau, sesungguhnya aku adalah termasuk orang-orang yang berbuat zalim.',
    reference: 'QS. Al-Anbiya: 87 & HR. At-Tirmidzi no. 3505'
  },

  // 9. Doa untuk Orang Tua
  {
    id: 'orang_tua_kasih_sayang',
    category: 'orang_tua',
    categoryLabel: 'Untuk Orang Tua',
    title: 'Doa Kasih Sayang & Ampunan untuk Kedua Orang Tua',
    arabic: 'رَبِّ اغْفِرْ لِي وَلِوَالِدَيَّ وَارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا',
    latin: 'Rabbighfir lii wa liwaalidayya warhamhumaa kamaa rabbayaanii shaghiiraa.',
    translation: 'Wahai Tuhanku, ampunilah dosaku dan dosa kedua orang tuaku, dan sayangilah keduanya sebagaimana mereka berdua telah menyayangiku dan mendidikku di waktu kecil.',
    reference: 'QS. Al-Isra\': 24'
  },
  {
    id: 'orang_tua_syukur_nikmat',
    category: 'orang_tua',
    categoryLabel: 'Untuk Orang Tua',
    title: 'Doa Bersyukur Atas Nikmat & Kebaikan Orang Tua',
    arabic: 'رَبِّ أَوْزِعْنِي أَنْ أَشْكُرَ نِعْمَتَكَ الَّتِي أَنْعَمْتَ عَلَيَّ وَعَلَىٰ وَالِدَيَّ وَأَنْ أَعْمَلَ صَالِحًا تَرْضَاهُ وَأَدْخِلْنِي بِرَحْمَتِكَ فِي عِبَادِكَ الصَّالِحِينَ',
    latin: 'Rabbi awzi\'nii an asykura ni\'matakal-latii an\'amta \'alayya wa \'alaa waalidayya wa an a\'mala shaalihan tardhaahu wa adkhilnii birahmatika fii \'ibaadikas-shaalihiin.',
    translation: 'Ya Tuhanku, anugerahkanlah kepadaku ilham untuk tetap mensyukuri nikmat-Mu yang telah Engkau anugerahkan kepadaku dan kepada kedua orang tuaku, dan agar aku dapat mengerjakan kebajikan yang Engkau ridhai; dan masukkanlah aku dengan rahmat-Mu ke dalam golongan hamba-hamba-Mu yang saleh.',
    reference: 'QS. An-Naml: 19'
  },

  // 10. Doa Belajar & Menuntut Ilmu
  {
    id: 'belajar_tambah_ilmu',
    category: 'belajar',
    categoryLabel: 'Belajar & Menuntut Ilmu',
    title: 'Doa Memohon Tambahan Ilmu',
    arabic: 'رَبِّ زِدْنِي عِلْمًا وَارْزُقْنِي فَهْمًا',
    latin: 'Rabbi zidnii \'ilman warzuqnii fahmaa.',
    translation: 'Ya Tuhanku, tambahkanlah ilmu kepadaku dan anugerahkanlah kepadaku pemahaman yang baik.',
    reference: 'QS. Thaha: 114'
  },
  {
    id: 'belajar_ilmu_manfaat',
    category: 'belajar',
    categoryLabel: 'Belajar & Menuntut Ilmu',
    title: 'Doa Memohon Ilmu yang Bermanfaat, Rezeki Halal & Amal Diterima',
    arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا، وَرِزْقًا طَيِّبًا، وَعَمَلًا مُتَقَبَّلًا',
    latin: 'Allahumma innii as-aluka \'ilman naafi\'aa, wa rizqan thayyibaa, wa \'amalan mutaqabbalaa.',
    translation: 'Ya Allah, sesungguhnya aku memohon kepada-Mu ilmu yang bermanfaat, rezeki yang halal lagi baik, dan amal perbuatan yang diterima.',
    reference: 'HR. Ibnu Majah no. 925 & Ahmad 6/305 (Shahih)'
  },

  // 11. Doa Perlindungan
  {
    id: 'lindung_marabahaya',
    category: 'perlindungan',
    categoryLabel: 'Doa Perlindungan',
    title: 'Doa Perlindungan dengan Kalimat Allah yang Sempurna',
    arabic: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ',
    latin: 'A\'udzu bikalimaatillaahit-taammaati min syarri maa khalaq.',
    translation: 'Aku berlindung dengan kalimat-kalimat Allah yang sempurna dari kejahatan makhluk yang telah Dia ciptakan.',
    reference: 'HR. Muslim no. 2708'
  },
  {
    id: 'lindung_syirik',
    category: 'perlindungan',
    categoryLabel: 'Doa Perlindungan',
    title: 'Doa Terhindar dari Syirik',
    arabic: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ أَنْ أُشْرِكَ بِكَ وَأَنَا أَعْلَمُ، وَأَسْتَغْفِرُكَ لِمَا لَا أَعْلَمُ',
    latin: 'Allahumma innii a\'udzu bika an usyrika bika wa ana a\'lam, wa astaghfiruka limaa laa a\'lam.',
    translation: 'Ya Allah, sesungguhnya aku berlindung kepada-Mu dari menyekutukan-Mu sedangkan aku mengetahuinya, dan aku memohon ampunan kepada-Mu terhadap apa yang tidak aku ketahui.',
    reference: 'HR. Ahmad 4/403 & Al-Bukhari dalam Al-Adab Al-Mufrad no. 716'
  },

  // 12. Doa Pilihan dari Al-Qur'an
  {
    id: 'quran_sapu_jagad',
    category: 'quran',
    categoryLabel: 'Pilihan Al-Qur\'an',
    title: 'Doa Kebaikan Dunia dan Akhirat (Doa Sapu Jagad)',
    arabic: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ',
    latin: 'Rabbanaa aatinaa fid-dunyaa hasanah wa fil-aakhirati hasanah wa qinaa \'adzaaban-naar.',
    translation: 'Ya Tuhan kami, berilah kami kebaikan di dunia dan kebaikan di akhirat, dan lindungilah kami dari azab siksa neraka.',
    reference: 'QS. Al-Baqarah: 201'
  },
  {
    id: 'quran_ketetapan_hati',
    category: 'quran',
    categoryLabel: 'Pilihan Al-Qur\'an',
    title: 'Doa Ketetapan Iman & Hati dalam Hidayah',
    arabic: 'رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا وَهَبْ لَنَا مِنْ لَدُنْكَ رَحْمَةً ۚ إِنَّكَ أَنْتَ الْوَهَّابُ',
    latin: 'Rabbanaa laa tuzigh quluubanaa ba\'da idz hadaitanaa wa hab lanaa min ladunka rahmah, innaka antal-wahhab.',
    translation: 'Ya Tuhan kami, janganlah Engkau condongkan hati kami kepada kesesatan setelah Engkau beri petunjuk kepada kami, dan karuniakanlah kepada kami rahmat dari sisi-Mu; sesungguhnya Engkau Mahapemberi karunia.',
    reference: 'QS. Ali \'Imran: 8'
  },
  {
    id: 'quran_keluarga_sakinah',
    category: 'quran',
    categoryLabel: 'Pilihan Al-Qur\'an',
    title: 'Doa Pasangan & Keturunan Penyejuk Hati',
    arabic: 'رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ وَاجْعَلْنَا لِلْمُتَّقِينَ إِمَامًا',
    latin: 'Rabbanaa hab lanaa min azwaajinaa wa dzurriyyaatinaa qurrata a\'yuniw-waj\'alnaa lil-muttaqiina imaamaa.',
    translation: 'Ya Tuhan kami, anugerahkanlah kepada kami pasangan dan keturunan kami sebagai penyejuk hati (kami), dan jadikanlah kami pemimpin bagi orang-orang yang bertakwa.',
    reference: 'QS. Al-Furqan: 74'
  }
];

const DUA_BOOKMARK_KEY = 'aadom_dua_bookmarks_v1';

export class DuaService {
  public getAllDuas(): DuaItem[] {
    return AUTHENTIC_DUAS;
  }

  public getBookmarkedIds(): string[] {
    try {
      const stored = localStorage.getItem(DUA_BOOKMARK_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  public toggleBookmark(id: string): boolean {
    try {
      const current = this.getBookmarkedIds();
      const index = current.indexOf(id);
      let updated: string[];
      let isBookmarked: boolean;

      if (index > -1) {
        updated = current.filter((item) => item !== id);
        isBookmarked = false;
      } else {
        updated = [...current, id];
        isBookmarked = true;
      }

      localStorage.setItem(DUA_BOOKMARK_KEY, JSON.stringify(updated));
      return isBookmarked;
    } catch {
      return false;
    }
  }

  public isBookmarked(id: string): boolean {
    const list = this.getBookmarkedIds();
    return list.includes(id);
  }
}

export const duaService = new DuaService();

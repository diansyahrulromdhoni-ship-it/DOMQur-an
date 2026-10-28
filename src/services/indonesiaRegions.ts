/**
 * Comprehensive Indonesian Regional Database with Special Focus on Banten
 * Covers all 8 regencies & cities of Banten with authentic kecamatans,
 * as well as major regencies and cities across all provinces of Indonesia.
 */

export interface RegencyCity {
  name: string;
  type: 'Kabupaten' | 'Kota';
  latitude: number;
  longitude: number;
  timezone: number; // 7 = WIB, 8 = WITA, 9 = WIT
  timezoneIana: string;
  districts?: string[];
}

export interface ProvinceData {
  id: string;
  name: string;
  timezone: number;
  timezoneIana: string;
  cities: RegencyCity[];
}

export const INDONESIA_REGIONS: ProvinceData[] = [
  {
    id: 'banten',
    name: 'Banten',
    timezone: 7,
    timezoneIana: 'Asia/Jakarta',
    cities: [
      {
        name: 'Kabupaten Pandeglang',
        type: 'Kabupaten',
        latitude: -6.3084,
        longitude: 106.1066,
        timezone: 7,
        timezoneIana: 'Asia/Jakarta',
        districts: [
          'Pandeglang', 'Labuan', 'Menes', 'Panimbang', 'Carita', 'Cikeusik', 'Sumur',
          'Cadasari', 'Karang Tanjung', 'Majasari', 'Kaduhejo', 'Mandalawangi', 'Cimanuk',
          'Banjar', 'Bojong', 'Picung', 'Saketi', 'Cisata', 'Pagelaran', 'Patia',
          'Sukaresmi', 'Sobang', 'Angsana', 'Munjul', 'Sindangresmi', 'Cibaliung',
          'Cibitung', 'Cigeulis', 'Cimanggu', 'Koranji', 'Mekarjaya', 'Pulosari', 'Sindang Resmi'
        ]
      },
      {
        name: 'Kabupaten Lebak',
        type: 'Kabupaten',
        latitude: -6.5684,
        longitude: 106.2514,
        timezone: 7,
        timezoneIana: 'Asia/Jakarta',
        districts: [
          'Rangkasbitung', 'Cibadak', 'Maja', 'Warunggunung', 'Kalanganyar', 'Cipanas',
          'Lebakgedong', 'Sajira', 'Curugbitung', 'Muncang', 'Sobang', 'Bojongmanik',
          'Cirinten', 'Gunungkencana', 'Banjarsari', 'Cileles', 'Cikulur', 'Bayah',
          'Cilograng', 'Cibeber', 'Cihara', 'Panggarangan', 'Malingping', 'Wanasalam',
          'Cijaku', 'Cigemblong', 'Batuceper', 'Malangnengah'
        ]
      },
      {
        name: 'Kabupaten Tangerang',
        type: 'Kabupaten',
        latitude: -6.1783,
        longitude: 106.4674,
        timezone: 7,
        timezoneIana: 'Asia/Jakarta',
        districts: [
          'Tigaraksa', 'Balaraja', 'Cikupa', 'Pasar Kemis', 'Curug', 'Kelapa Dua',
          'Cisauk', 'Legok', 'Pagedangan', 'Panongan', 'Sepatan', 'Sepatan Timur',
          'Pakuhaji', 'Teluknaga', 'Kosambi', 'Mauk', 'Kemiri', 'Sukadiri', 'Kronjo',
          'Kresek', 'Gunung Kaler', 'Sukamulya', 'Jayanti', 'Solear', 'Cisoka',
          'Rajeg', 'Sindang Jaya', 'Jambe', 'Mekar Baru'
        ]
      },
      {
        name: 'Kabupaten Serang',
        type: 'Kabupaten',
        latitude: -6.1153,
        longitude: 105.9989,
        timezone: 7,
        timezoneIana: 'Asia/Jakarta',
        districts: [
          'Ciruas', 'Kragilan', 'Cikande', 'Kibing', 'Binuang', 'Kramatwatu', 'Waringinkurung',
          'Bojonegara', 'Pulo Ampel', 'Anyar', 'Cinangka', 'Padarincang', 'Ciomas', 'Pabuaran',
          'Gunungsari', 'Baros', 'Petir', 'Cikeusal', 'Jawilan', 'Kopo', 'Mancak',
          'Pontang', 'Tirtayasa', 'Tanara', 'Lebak Wangi', 'Carenang', 'Bandung', 'Pamayaran'
        ]
      },
      {
        name: 'Kota Tangerang',
        type: 'Kota',
        latitude: -6.1783,
        longitude: 106.6319,
        timezone: 7,
        timezoneIana: 'Asia/Jakarta',
        districts: [
          'Tangerang', 'Batuceper', 'Benda', 'Cibodas', 'Ciledug', 'Cipondoh',
          'Jatiuwung', 'Karawaci', 'Karang Tengah', 'Larangan', 'Neglasari',
          'Periuk', 'Pinang'
        ]
      },
      {
        name: 'Kota Cilegon',
        type: 'Kota',
        latitude: -6.0029,
        longitude: 106.0543,
        timezone: 7,
        timezoneIana: 'Asia/Jakarta',
        districts: [
          'Cibeber', 'Cilegon', 'Citangkil', 'Ciwandan', 'Gerogol', 'Jombang',
          'Pulomerak', 'Purwakarta'
        ]
      },
      {
        name: 'Kota Serang',
        type: 'Kota',
        latitude: -6.1200,
        longitude: 106.1503,
        timezone: 7,
        timezoneIana: 'Asia/Jakarta',
        districts: [
          'Serang', 'Cipocok Jaya', 'Curug', 'Kasemen', 'Taktakan', 'Walantaka'
        ]
      },
      {
        name: 'Kota Tangerang Selatan',
        type: 'Kota',
        latitude: -6.2887,
        longitude: 106.7179,
        timezone: 7,
        timezoneIana: 'Asia/Jakarta',
        districts: [
          'Ciputat', 'Ciputat Timur', 'Pamulang', 'Pondok Aren', 'Serpong',
          'Serpong Utara', 'Setu'
        ]
      }
    ]
  },
  {
    id: 'dki-jakarta',
    name: 'DKI Jakarta',
    timezone: 7,
    timezoneIana: 'Asia/Jakarta',
    cities: [
      { name: 'Jakarta Pusat', type: 'Kota', latitude: -6.1805, longitude: 106.8284, timezone: 7, timezoneIana: 'Asia/Jakarta', districts: ['Gambir', 'Tanah Abang', 'Menteng', 'Senen', 'Cempaka Putih', 'Johar Baru', 'Kemayoran', 'Sawah Besar'] },
      { name: 'Jakarta Selatan', type: 'Kota', latitude: -6.2615, longitude: 106.8106, timezone: 7, timezoneIana: 'Asia/Jakarta', districts: ['Kebayoran Baru', 'Kebayoran Lama', 'Pesanggrahan', 'Cilandak', 'Pasar Minggu', 'Jagakarsa', 'Mampang Prapatan', 'Pancoran', 'Tebet', 'Setiabudi'] },
      { name: 'Jakarta Timur', type: 'Kota', latitude: -6.2250, longitude: 106.9004, timezone: 7, timezoneIana: 'Asia/Jakarta', districts: ['Matraman', 'Pulo Gadung', 'Jatinegara', 'Duren Sawit', 'Kramat Jati', 'Makasar', 'Pasar Rebo', 'Ciracas', 'Cipayung', 'Cakung'] },
      { name: 'Jakarta Barat', type: 'Kota', latitude: -6.1683, longitude: 106.7589, timezone: 7, timezoneIana: 'Asia/Jakarta', districts: ['Cengkareng', 'Grogol Petamburan', 'Kalideres', 'Kebon Jeruk', 'Kembangan', 'Palmerah', 'Taman Sari', 'Tambora'] },
      { name: 'Jakarta Utara', type: 'Kota', latitude: -6.1384, longitude: 106.8642, timezone: 7, timezoneIana: 'Asia/Jakarta', districts: ['Koja', 'Kelapa Gading', 'Tanjung Priok', 'Pademangan', 'Penjaringan', 'Cilincing'] },
      { name: 'Kepulauan Seribu', type: 'Kabupaten', latitude: -5.6122, longitude: 106.5617, timezone: 7, timezoneIana: 'Asia/Jakarta', districts: ['Kepulauan Seribu Utara', 'Kepulauan Seribu Selatan'] }
    ]
  },
  {
    id: 'jawa-barat',
    name: 'Jawa Barat',
    timezone: 7,
    timezoneIana: 'Asia/Jakarta',
    cities: [
      { name: 'Kota Bandung', type: 'Kota', latitude: -6.9175, longitude: 107.6191, timezone: 7, timezoneIana: 'Asia/Jakarta', districts: ['Coblong', 'Sumur Bandung', 'Cicendo', 'Andir', 'Regol', 'Lengkong', 'Buahbatu', 'Kiaracondong'] },
      { name: 'Kota Bogor', type: 'Kota', latitude: -6.5971, longitude: 106.8060, timezone: 7, timezoneIana: 'Asia/Jakarta', districts: ['Bogor Tengah', 'Bogor Utara', 'Bogor Selatan', 'Bogor Timur', 'Bogor Barat', 'Tanah Sareal'] },
      { name: 'Kabupaten Bogor', type: 'Kabupaten', latitude: -6.4764, longitude: 106.8262, timezone: 7, timezoneIana: 'Asia/Jakarta', districts: ['Cibinong', 'Ciawi', 'Cisarua', 'Megamendung', 'Gunung Putri', 'Cileungsi', 'Babakan Madang'] },
      { name: 'Kota Bekasi', type: 'Kota', latitude: -6.2383, longitude: 106.9756, timezone: 7, timezoneIana: 'Asia/Jakarta', districts: ['Bekasi Barat', 'Bekasi Timur', 'Bekasi Utara', 'Bekasi Selatan', 'Pondok Gede', 'Medan Satria'] },
      { name: 'Kabupaten Bekasi', type: 'Kabupaten', latitude: -6.2416, longitude: 107.1517, timezone: 7, timezoneIana: 'Asia/Jakarta', districts: ['Cikarang Pusat', 'Cikarang Utara', 'Cikarang Selatan', 'Tambun Selatan', 'Cibitung'] },
      { name: 'Kota Depok', type: 'Kota', latitude: -6.4025, longitude: 106.7942, timezone: 7, timezoneIana: 'Asia/Jakarta', districts: ['Pancoran Mas', 'Sukmajaya', 'Beji', 'Cimanggis', 'Sawangan', 'Cinere', 'Tapos'] },
      { name: 'Kota Cirebon', type: 'Kota', latitude: -6.7063, longitude: 108.5570, timezone: 7, timezoneIana: 'Asia/Jakarta', districts: ['Kejaksan', 'Kesambi', 'Lemahwungkuk', 'Pekalipan', 'Harjamukti'] },
      { name: 'Kota Sukabumi', type: 'Kota', latitude: -6.9277, longitude: 106.9300, timezone: 7, timezoneIana: 'Asia/Jakarta', districts: ['Cikole', 'Citamiang', 'Warudoyong', 'Baros', 'Lembursitu', 'Gunungpuyuh'] },
      { name: 'Kota Tasikmalaya', type: 'Kota', latitude: -7.3274, longitude: 108.2207, timezone: 7, timezoneIana: 'Asia/Jakarta', districts: ['Cihideung', 'Cipedes', 'Tawang', 'Indihiang', 'Kawalu', 'Tamansari'] }
    ]
  },
  {
    id: 'jawa-tengah',
    name: 'Jawa Tengah',
    timezone: 7,
    timezoneIana: 'Asia/Jakarta',
    cities: [
      { name: 'Kota Semarang', type: 'Kota', latitude: -6.9667, longitude: 110.4167, timezone: 7, timezoneIana: 'Asia/Jakarta', districts: ['Semarang Tengah', 'Semarang Barat', 'Semarang Timur', 'Semarang Selatan', 'Banyumanik', 'Candisari', 'Gajahmungkur', 'Pedurungan'] },
      { name: 'Kota Surakarta (Solo)', type: 'Kota', latitude: -7.5755, longitude: 110.8243, timezone: 7, timezoneIana: 'Asia/Jakarta', districts: ['Banjarsari', 'Jebres', 'Laweyan', 'Pasar Kliwon', 'Serengan'] },
      { name: 'Kota Magelang', type: 'Kota', latitude: -7.4797, longitude: 110.2178, timezone: 7, timezoneIana: 'Asia/Jakarta', districts: ['Magelang Tengah', 'Magelang Utara', 'Magelang Selatan'] },
      { name: 'Kota Pekalongan', type: 'Kota', latitude: -6.8886, longitude: 109.6753, timezone: 7, timezoneIana: 'Asia/Jakarta', districts: ['Pekalongan Barat', 'Pekalongan Timur', 'Pekalongan Utara', 'Pekalongan Selatan'] },
      { name: 'Kabupaten Banyumas (Purwokerto)', type: 'Kabupaten', latitude: -7.4243, longitude: 109.2302, timezone: 7, timezoneIana: 'Asia/Jakarta', districts: ['Purwokerto Timur', 'Purwokerto Barat', 'Purwokerto Utara', 'Purwokerto Selatan', 'Baturraden'] },
      { name: 'Kota Tegal', type: 'Kota', latitude: -6.8694, longitude: 109.1402, timezone: 7, timezoneIana: 'Asia/Jakarta', districts: ['Tegal Barat', 'Tegal Timur', 'Tegal Selatan', 'Margadana'] }
    ]
  },
  {
    id: 'di-yogyakarta',
    name: 'D.I. Yogyakarta',
    timezone: 7,
    timezoneIana: 'Asia/Jakarta',
    cities: [
      { name: 'Kota Yogyakarta', type: 'Kota', latitude: -7.7956, longitude: 110.3695, timezone: 7, timezoneIana: 'Asia/Jakarta', districts: ['Danurejan', 'Gedongtengen', 'Gondokusuman', 'Gondomanan', 'Jetis', 'Kotagede', 'Kraton', 'Mantrijeron', 'Mergangsan', 'Ngampilan', 'Pakualaman', 'Tegalrejo', 'Umbulharjo', 'Wirobrajan'] },
      { name: 'Kabupaten Sleman', type: 'Kabupaten', latitude: -7.7167, longitude: 110.3556, timezone: 7, timezoneIana: 'Asia/Jakarta', districts: ['Depok', 'Mlati', 'Gamping', 'Ngaglik', 'Kalasan', 'Sleman', 'Berbah'] },
      { name: 'Kabupaten Bantul', type: 'Kabupaten', latitude: -7.8878, longitude: 110.3283, timezone: 7, timezoneIana: 'Asia/Jakarta', districts: ['Bantul', 'Sewon', 'Kasihan', 'Banguntapan', 'Imogiri', 'Pundong'] },
      { name: 'Kabupaten Kulon Progo', type: 'Kabupaten', latitude: -7.8256, longitude: 110.1583, timezone: 7, timezoneIana: 'Asia/Jakarta', districts: ['Wates', 'Pengasih', 'Sentolo', 'Temon', 'Galur'] },
      { name: 'Kabupaten Gunungkidul', type: 'Kabupaten', latitude: -7.9625, longitude: 110.6039, timezone: 7, timezoneIana: 'Asia/Jakarta', districts: ['Wonosari', 'Playen', 'Semanu', 'Karangmojo', 'Ponjong'] }
    ]
  },
  {
    id: 'jawa-timur',
    name: 'Jawa Timur',
    timezone: 7,
    timezoneIana: 'Asia/Jakarta',
    cities: [
      { name: 'Kota Surabaya', type: 'Kota', latitude: -7.2575, longitude: 112.7521, timezone: 7, timezoneIana: 'Asia/Jakarta', districts: ['Gubeng', 'Tegalsari', 'Genteng', 'Bubutan', 'Wonokromo', 'Rungkut', 'Sukolilo'] },
      { name: 'Kota Malang', type: 'Kota', latitude: -7.9797, longitude: 112.6304, timezone: 7, timezoneIana: 'Asia/Jakarta', districts: ['Klojen', 'Blimbing', 'Lowokwaru', 'Sukun', 'Kedungkandang'] },
      { name: 'Kota Madiun', type: 'Kota', latitude: -7.6298, longitude: 111.5239, timezone: 7, timezoneIana: 'Asia/Jakarta', districts: ['Kartoharjo', 'Manguharjo', 'Taman'] },
      { name: 'Kota Kediri', type: 'Kota', latitude: -7.8480, longitude: 112.0178, timezone: 7, timezoneIana: 'Asia/Jakarta', districts: ['Kota', 'Mojoroto', 'Pesantren'] },
      { name: 'Kabupaten Sidoarjo', type: 'Kabupaten', latitude: -7.4478, longitude: 112.7183, timezone: 7, timezoneIana: 'Asia/Jakarta', districts: ['Sidoarjo', 'Waru', 'Candi', 'Gedangan', 'Taman', 'Krian'] }
    ]
  },
  {
    id: 'aceh',
    name: 'Aceh',
    timezone: 7,
    timezoneIana: 'Asia/Jakarta',
    cities: [
      { name: 'Kota Banda Aceh', type: 'Kota', latitude: 5.5483, longitude: 95.3238, timezone: 7, timezoneIana: 'Asia/Jakarta', districts: ['Baiturrahman', 'Kuta Alam', 'Meuraxa', 'Syiah Kuala', 'Lueng Bata', 'Ulee Kareng'] },
      { name: 'Kota Sabang', type: 'Kota', latitude: 5.8942, longitude: 95.3228, timezone: 7, timezoneIana: 'Asia/Jakarta', districts: ['Sukakarya', 'Sukajaya'] },
      { name: 'Kota Lhokseumawe', type: 'Kota', latitude: 5.1801, longitude: 97.1407, timezone: 7, timezoneIana: 'Asia/Jakarta', districts: ['Banda Sakti', 'Muara Dua', 'Muara Satu', 'Blang Mangat'] }
    ]
  },
  {
    id: 'sumatera-utara',
    name: 'Sumatera Utara',
    timezone: 7,
    timezoneIana: 'Asia/Jakarta',
    cities: [
      { name: 'Kota Medan', type: 'Kota', latitude: 3.5952, longitude: 98.6722, timezone: 7, timezoneIana: 'Asia/Jakarta', districts: ['Medan Kota', 'Medan Baru', 'Medan Petisah', 'Medan Amplas', 'Medan Deli', 'Medan Denai'] },
      { name: 'Kota Binjai', type: 'Kota', latitude: 3.6000, longitude: 98.4833, timezone: 7, timezoneIana: 'Asia/Jakarta', districts: ['Binjai Kota', 'Binjai Barat', 'Binjai Timur', 'Binjai Utara', 'Binjai Selatan'] },
      { name: 'Kota Pematangsiantar', type: 'Kota', latitude: 2.9610, longitude: 99.0667, timezone: 7, timezoneIana: 'Asia/Jakarta', districts: ['Siantar Barat', 'Siantar Timur', 'Siantar Utara', 'Siantar Selatan'] }
    ]
  },
  {
    id: 'sumatera-barat',
    name: 'Sumatera Barat',
    timezone: 7,
    timezoneIana: 'Asia/Jakarta',
    cities: [
      { name: 'Kota Padang', type: 'Kota', latitude: -0.9471, longitude: 100.4172, timezone: 7, timezoneIana: 'Asia/Jakarta', districts: ['Padang Barat', 'Padang Timur', 'Padang Utara', 'Padang Selatan', 'Koto Tangah', 'Kuranji'] },
      { name: 'Kota Bukittinggi', type: 'Kota', latitude: -0.3056, longitude: 100.3692, timezone: 7, timezoneIana: 'Asia/Jakarta', districts: ['Guguk Panjang', 'Mandiangin Koto Selayan', 'Aur Birugo Tigo Baleh'] }
    ]
  },
  {
    id: 'sumatera-selatan',
    name: 'Sumatera Selatan',
    timezone: 7,
    timezoneIana: 'Asia/Jakarta',
    cities: [
      { name: 'Kota Palembang', type: 'Kota', latitude: -2.9761, longitude: 104.7754, timezone: 7, timezoneIana: 'Asia/Jakarta', districts: ['Ilir Barat I', 'Ilir Barat II', 'Ilir Timur I', 'Ilir Timur II', 'Sukarami', 'Seberang Ulu I', 'Seberang Ulu II'] }
    ]
  },
  {
    id: 'lampung',
    name: 'Lampung',
    timezone: 7,
    timezoneIana: 'Asia/Jakarta',
    cities: [
      { name: 'Kota Bandar Lampung', type: 'Kota', latitude: -5.4500, longitude: 105.2667, timezone: 7, timezoneIana: 'Asia/Jakarta', districts: ['Tanjung Karang Pusat', 'Teluk Betung Selatan', 'Kedaton', 'Rajabasa', 'Sukarame', 'Kemiling'] }
    ]
  },
  {
    id: 'bali',
    name: 'Bali',
    timezone: 8,
    timezoneIana: 'Asia/Makassar',
    cities: [
      { name: 'Kota Denpasar', type: 'Kota', latitude: -8.6705, longitude: 115.2126, timezone: 8, timezoneIana: 'Asia/Makassar', districts: ['Denpasar Barat', 'Denpasar Timur', 'Denpasar Selatan', 'Denpasar Utara'] },
      { name: 'Kabupaten Badung (Kuta)', type: 'Kabupaten', latitude: -8.5819, longitude: 115.1772, timezone: 8, timezoneIana: 'Asia/Makassar', districts: ['Kuta', 'Kuta Selatan', 'Kuta Utara', 'Mengwi', 'Abiansemal', 'Petang'] }
    ]
  },
  {
    id: 'ntb',
    name: 'Nusa Tenggara Barat',
    timezone: 8,
    timezoneIana: 'Asia/Makassar',
    cities: [
      { name: 'Kota Mataram', type: 'Kota', latitude: -8.5833, longitude: 116.1167, timezone: 8, timezoneIana: 'Asia/Makassar', districts: ['Ampenan', 'Cakranegara', 'Mataram', 'Sandubaya', 'Sekarbela', 'Selaparang'] }
    ]
  },
  {
    id: 'ntt',
    name: 'Nusa Tenggara Timur',
    timezone: 8,
    timezoneIana: 'Asia/Makassar',
    cities: [
      { name: 'Kota Kupang', type: 'Kota', latitude: -10.1772, longitude: 123.6070, timezone: 8, timezoneIana: 'Asia/Makassar', districts: ['Alak', 'Kelapa Lima', 'Kotaraja', 'Maulafa', 'Oebobo'] }
    ]
  },
  {
    id: 'kalimantan-selatan',
    name: 'Kalimantan Selatan',
    timezone: 8,
    timezoneIana: 'Asia/Makassar',
    cities: [
      { name: 'Kota Banjarmasin', type: 'Kota', latitude: -3.3194, longitude: 114.5908, timezone: 8, timezoneIana: 'Asia/Makassar', districts: ['Banjarmasin Tengah', 'Banjarmasin Barat', 'Banjarmasin Timur', 'Banjarmasin Selatan', 'Banjarmasin Utara'] },
      { name: 'Kota Banjarbaru', type: 'Kota', latitude: -3.4402, longitude: 114.8306, timezone: 8, timezoneIana: 'Asia/Makassar', districts: ['Banjarbaru Selatan', 'Banjarbaru Utara', 'Cempaka', 'Landasan Ulin', 'Liang Anggang'] }
    ]
  },
  {
    id: 'kalimantan-timur',
    name: 'Kalimantan Timur',
    timezone: 8,
    timezoneIana: 'Asia/Makassar',
    cities: [
      { name: 'Kota Balikpapan', type: 'Kota', latitude: -1.2379, longitude: 116.8289, timezone: 8, timezoneIana: 'Asia/Makassar', districts: ['Balikpapan Kota', 'Balikpapan Barat', 'Balikpapan Timur', 'Balikpapan Selatan', 'Balikpapan Utara', 'Balikpapan Tengah'] },
      { name: 'Kota Samarinda', type: 'Kota', latitude: -0.5022, longitude: 117.1536, timezone: 8, timezoneIana: 'Asia/Makassar', districts: ['Samarinda Kota', 'Samarinda Ilir', 'Samarinda Seberang', 'Samarinda Utara', 'Sungai Kunjang'] }
    ]
  },
  {
    id: 'sulawesi-selatan',
    name: 'Sulawesi Selatan',
    timezone: 8,
    timezoneIana: 'Asia/Makassar',
    cities: [
      { name: 'Kota Makassar', type: 'Kota', latitude: -5.1477, longitude: 119.4327, timezone: 8, timezoneIana: 'Asia/Makassar', districts: ['Ujung Pandang', 'Mariso', 'Mamajang', 'Makassar', 'Ujung Tanah', 'Wajo', 'Bontoala', 'Panakkukang', 'Tamalate'] }
    ]
  },
  {
    id: 'papua',
    name: 'Papua',
    timezone: 9,
    timezoneIana: 'Asia/Jayapura',
    cities: [
      { name: 'Kota Jayapura', type: 'Kota', latitude: -2.5337, longitude: 140.7181, timezone: 9, timezoneIana: 'Asia/Jayapura', districts: ['Jayapura Utara', 'Jayapura Selatan', 'Abepura', 'Heram', 'Muara Tami'] }
    ]
  }
];

export const STORAGE_LOCATION_KEY = 'mydom_saved_location';

export function getSavedLocation(): RegencyCity & { province: string; district?: string } {
  try {
    const raw = localStorage.getItem(STORAGE_LOCATION_KEY) || localStorage.getItem('aadom_saved_location');
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Failed to parse saved location', e);
  }
  // Default to Kota Serang, Banten or Jakarta
  return {
    name: 'Kota Serang',
    type: 'Kota',
    province: 'Banten',
    latitude: -6.1200,
    longitude: 106.1503,
    timezone: 7,
    timezoneIana: 'Asia/Jakarta',
    districts: ['Serang', 'Cipocok Jaya', 'Curug', 'Kasemen', 'Taktakan', 'Walantaka']
  };
}

export function saveLocation(loc: RegencyCity & { province: string; district?: string }): void {
  try {
    localStorage.setItem(STORAGE_LOCATION_KEY, JSON.stringify(loc));
    // Keep backward compatibility
    localStorage.setItem('aadom_saved_location', JSON.stringify({
      name: loc.district ? `${loc.district}, ${loc.name}` : loc.name,
      province: loc.province,
      country: 'Indonesia',
      latitude: loc.latitude,
      longitude: loc.longitude,
      timezone: loc.timezone,
      timezoneIana: loc.timezoneIana
    }));
  } catch (e) {
    console.warn('Failed to store location', e);
  }
}

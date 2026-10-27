/**
 * Centralized Audio Configuration for AA Dom Qur'an
 * Maps events to verified, high-quality audio streams.
 */

export interface PrayerAudioItem {
  id: 'subuh' | 'dzuhur' | 'ashar' | 'maghrib' | 'isya' | 'imsak' | 'terbit';
  name: string;
  category: 'adzan_subuh' | 'adzan_standar' | 'imsak' | 'terbit';
  url: string;
  description: string;
  defaultEnabled: boolean;
}

export const AUDIO_REMINDERS_CONFIG: Record<string, {
  name: string;
  url: string;
  category: string;
  description: string;
}> = {
  // 1. Subuh specific adzan (with Ash-shalatu khairun minan naum)
  subuh: {
    name: 'Adzan Subuh',
    url: 'https://wflq2j4mi1smqyku.public.blob.vercel-storage.com/adzan_subuh.mp3',
    category: 'adzan_subuh',
    description: 'Lantunan Adzan Subuh dengan seruan Ash-Shalatu Khairum Minan Naum'
  },
  // 2. Standard adzan for Dzuhur, Ashar, Maghrib, Isya
  dzuhur: {
    name: 'Adzan Dzuhur',
    url: 'https://wflq2j4mi1smqyku.public.blob.vercel-storage.com/adzan.mp3',
    category: 'adzan_standar',
    description: 'Lantunan Adzan berkumandang merdu'
  },
  ashar: {
    name: 'Adzan Ashar',
    url: 'https://wflq2j4mi1smqyku.public.blob.vercel-storage.com/adzan.mp3',
    category: 'adzan_standar',
    description: 'Lantunan Adzan berkumandang merdu'
  },
  maghrib: {
    name: 'Adzan Maghrib',
    url: 'https://wflq2j4mi1smqyku.public.blob.vercel-storage.com/adzan.mp3',
    category: 'adzan_standar',
    description: 'Lantunan Adzan berkumandang merdu saat matahari terbenam'
  },
  isya: {
    name: 'Adzan Isya',
    url: 'https://wflq2j4mi1smqyku.public.blob.vercel-storage.com/adzan.mp3',
    category: 'adzan_standar',
    description: 'Lantunan Adzan berkumandang merdu'
  },
  // 3. Imsak reminder
  imsak: {
    name: 'Pengingat Waktu Imsak',
    url: 'https://wflq2j4mi1smqyku.public.blob.vercel-storage.com/imsak.mp3',
    category: 'imsak',
    description: 'Peringatan waktu Imsak (10 menit sebelum Subuh) untuk bersiap puasa'
  },
  // 4. Sunrise / Terbit matahari reminder
  terbit: {
    name: 'Pengingat Terbit Matahari (Syuruq)',
    url: 'https://wflq2j4mi1smqyku.public.blob.vercel-storage.com/ayam.mp3',
    category: 'terbit',
    description: 'Suara alami ayam berkokok menandai fajar telah berganti terbit matahari'
  }
};

/**
 * 4 Distinct Audio Test Channels as strictly requested:
 * 1. Adzan Subuh
 * 2. Adzan Waktu Lain (Dzuhur, Ashar, Maghrib, Isya)
 * 3. Imsak
 * 4. Terbit Matahari (Suara Ayam)
 */
export const AUDIO_TEST_PRESETS = [
  {
    id: 'test_subuh',
    name: 'Adzan Subuh',
    subtitle: 'Suara Khusus Subuh',
    url: 'https://wflq2j4mi1smqyku.public.blob.vercel-storage.com/adzan_subuh.mp3',
    eventKey: 'subuh'
  },
  {
    id: 'test_standar',
    name: 'Adzan Standar',
    subtitle: 'Dzuhur, Ashar, Maghrib, Isya',
    url: 'https://wflq2j4mi1smqyku.public.blob.vercel-storage.com/adzan.mp3',
    eventKey: 'dzuhur'
  },
  {
    id: 'test_imsak',
    name: 'Pengingat Imsak',
    subtitle: 'Sirine / Suara Imsak',
    url: 'https://wflq2j4mi1smqyku.public.blob.vercel-storage.com/imsak.mp3',
    eventKey: 'imsak'
  },
  {
    id: 'test_terbit',
    name: 'Terbit Matahari (Syuruq)',
    subtitle: 'Suara Alami Ayam Berkokok',
    url: 'https://wflq2j4mi1smqyku.public.blob.vercel-storage.com/ayam.mp3',
    eventKey: 'terbit'
  }
] as const;

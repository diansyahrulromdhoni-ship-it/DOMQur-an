/**
 * Qibla Geodesic Service
 * Accurately calculates great-circle forward azimuth towards Kaaba,
 * magnetic declination offset, and handles orientation sensor events.
 */

import { KAABA_COORDS } from './prayerTimeService';

export interface QiblaCalculationResult {
  bearing: number; // degrees from True North (0 - 360)
  distanceKm: number;
  compassDirection: string;
  kaabaLatitude: number;
  kaabaLongitude: number;
  magneticDeclination: number; // degrees offset to convert magnetic to true north
}

export class QiblaService {
  /**
   * Verified Great-Circle Geodesic Forward Azimuth:
   * deltaLongitude = longitudeKa'bah - longitudePengguna
   * y = sin(deltaLongitude) * cos(latitudeKa'bah)
   * x = cos(latitudePengguna) * sin(latitudeKa'bah) - sin(latitudePengguna) * cos(latitudeKa'bah) * cos(deltaLongitude)
   * bearing = (atan2(y, x) * 180 / PI + 360) % 360
   */
  public calculate(latitude: number, longitude: number): QiblaCalculationResult {
    const degToRad = (d: number) => (d * Math.PI) / 180.0;
    const radToDeg = (r: number) => (r * 180.0) / Math.PI;

    const latUserRad = degToRad(latitude);
    const latKaabaRad = degToRad(KAABA_COORDS.latitude);
    const deltaLonRad = degToRad(KAABA_COORDS.longitude - longitude);

    const y = Math.sin(deltaLonRad) * Math.cos(latKaabaRad);
    const x =
      Math.cos(latUserRad) * Math.sin(latKaabaRad) -
      Math.sin(latUserRad) * Math.cos(latKaabaRad) * Math.cos(deltaLonRad);

    let bearing = (radToDeg(Math.atan2(y, x)) + 360) % 360;
    bearing = Math.round(bearing * 10) / 10;

    // Haversine distance
    const R = 6371; // Earth mean radius in km
    const dLat = latKaabaRad - latUserRad;
    const dLon = deltaLonRad;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(latUserRad) * Math.cos(latKaabaRad) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distanceKm = Math.round(R * c);

    // Magnetic Declination Approximation for Indonesia / SE Asia
    // Positive = East declination, Magnetic North is east of True North
    const magneticDeclination = Math.round(((longitude - 100) * 0.04 + 1.0) * 10) / 10;

    let compassDirection = 'Barat Laut';
    if (bearing >= 337.5 || bearing < 22.5) compassDirection = 'Utara';
    else if (bearing >= 22.5 && bearing < 67.5) compassDirection = 'Timur Laut';
    else if (bearing >= 67.5 && bearing < 112.5) compassDirection = 'Timur';
    else if (bearing >= 112.5 && bearing < 157.5) compassDirection = 'Tenggara';
    else if (bearing >= 157.5 && bearing < 202.5) compassDirection = 'Selatan';
    else if (bearing >= 202.5 && bearing < 247.5) compassDirection = 'Barat Daya';
    else if (bearing >= 247.5 && bearing < 292.5) compassDirection = 'Barat';
    else compassDirection = 'Barat Laut';

    return {
      bearing,
      distanceKm,
      compassDirection,
      kaabaLatitude: KAABA_COORDS.latitude,
      kaabaLongitude: KAABA_COORDS.longitude,
      magneticDeclination
    };
  }
}

export const qiblaService = new QiblaService();

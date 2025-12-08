/* API 데이터 가져오기 함수들 */
import axios from 'axios';
import { getDistance } from './mapHelpers';

export interface LocationData {
  id: string;
  title: string | string[];
  subtitle?: string | string[];
  latitude: number;
  longitude: number;
  distance?: number;
  [key: string]: any;
}

/* 음식점 데이터 가져오기 */
export async function fetchRestaurants(
  lat: number,
  lng: number,
  maxDistance: number = 3.0
): Promise<LocationData[]> {
  try {
    const response = await axios.get('/api/solr/search', {
      params: {
        query: '*:*',
        rows: 1000,
      },
    });

    const results = response.data.list || [];
    return results
      .map((item: any) => ({
        ...item,
        distance: getDistance(lat, lng, item.latitude, item.longitude),
      }))
      .filter((item: LocationData) => item.distance! <= maxDistance)
      .sort((a: LocationData, b: LocationData) => a.distance! - b.distance!);
  } catch (error) {
    console.error('음식점 데이터 가져오기 실패:', error);
    return [];
  }
}

/* 걷기여행 데이터 가져오기 */
export async function fetchWalks(
  lat: number,
  lng: number,
  maxDistance: number = 3.0
): Promise<LocationData[]> {
  try {
    const response = await axios.get('/api/walk/search', {
      params: {
        query: '*:*',
        rows: 1000,
      },
    });

    const results = response.data.list || [];
    return results
      .map((item: any) => ({
        ...item,
        distance: getDistance(lat, lng, item.latitude, item.longitude),
      }))
      .filter((item: LocationData) => item.distance! <= maxDistance)
      .sort((a: LocationData, b: LocationData) => a.distance! - b.distance!);
  } catch (error) {
    console.error('걷기여행 데이터 가져오기 실패:', error);
    return [];
  }
}

/* 테마여행 데이터 가져오기 */
export async function fetchThemes(
  lat: number,
  lng: number,
  maxDistance: number = 3.0
): Promise<LocationData[]> {
  try {
    const response = await axios.get('/api/theme/search', {
      params: {
        query: '*:*',
        rows: 1000,
      },
    });

    const results = response.data.list || [];
    return results
      .map((item: any) => ({
        ...item,
        distance: getDistance(lat, lng, item.latitude, item.longitude),
      }))
      .filter((item: LocationData) => item.distance! <= maxDistance)
      .sort((a: LocationData, b: LocationData) => a.distance! - b.distance!);
  } catch (error) {
    console.error('테마여행 데이터 가져오기 실패:', error);
    return [];
  }
}

/* 해양여행 데이터 가져오기 */
export async function fetchMarines(
  lat: number,
  lng: number,
  maxDistance: number = 3.0
): Promise<LocationData[]> {
  try {
    const response = await axios.get('/api/marine/search', {
      params: {
        query: '*:*',
        rows: 1000,
      },
    });

    const results = response.data.list || [];
    return results
      .map((item: any) => ({
        ...item,
        distance: getDistance(lat, lng, item.latitude, item.longitude),
      }))
      .filter((item: LocationData) => item.distance! <= maxDistance)
      .sort((a: LocationData, b: LocationData) => a.distance! - b.distance!);
  } catch (error) {
    console.error('해양여행 데이터 가져오기 실패:', error);
    return [];
  }
}

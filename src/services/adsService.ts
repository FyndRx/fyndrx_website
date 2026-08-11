import { apiService } from './api';
import type { AdsDataFile } from '@/types/Ad';

export interface GetAdsParams {
  zone?: string;
  route?: string;
}

export const adsService = {
  async getAds(params?: GetAdsParams): Promise<AdsDataFile> {
    return apiService.get<AdsDataFile>('/ads', { params });
  },

  // Fire-and-forget beacons: analytics for the admin panel's CTR reporting.
  // Never awaited by callers, errors are swallowed — must not affect UI.
  trackImpression(id: string): void {
    apiService.post(`/ads/${encodeURIComponent(id)}/impression`).catch(() => {});
  },

  trackClick(id: string): void {
    apiService.post(`/ads/${encodeURIComponent(id)}/click`).catch(() => {});
  },
};

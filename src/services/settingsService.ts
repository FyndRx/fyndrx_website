import { apiService } from './api';

export type SettingValue = string | boolean | number | null;

export interface SettingDefinition {
  key: string;
  label: string;
  description: string;
  type: 'toggle' | 'select';
  options: Record<string, string> | null;
  default: SettingValue;
  value: SettingValue;
}

export interface SettingGroup {
  key: string;
  label: string;
  settings: SettingDefinition[];
}

interface SettingsResponse {
  data: Record<string, SettingValue>;
  groups: SettingGroup[];
}

/** Per-user settings (language, time zone, quiet hours, privacy…). The server decides which
 * settings exist for the signed-in account type, so this screen needs no hardcoded list. */
export const settingsService = {
  async getMine(): Promise<SettingGroup[]> {
    const response = await apiService.getAuth<SettingsResponse>('/settings/me');
    return response.groups ?? [];
  },

  /** Partial update — send only the keys that changed. */
  async update(changes: Record<string, SettingValue>): Promise<SettingGroup[]> {
    const response = await apiService.putAuth<SettingsResponse>('/settings/me', changes);
    return response.groups ?? [];
  },

  async reset(): Promise<SettingGroup[]> {
    const response = await apiService.postAuth<SettingsResponse>('/settings/me/reset');
    return response.groups ?? [];
  },
};

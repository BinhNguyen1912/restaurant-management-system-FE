import http from '@/lib/http';

export type GuestTaxSettingsType = {
  branchId: number;
  branchName: string;
  taxRate: number;
  serviceChargeRate: number;
  pricesIncludeTax: boolean;
};

export const guestTaxApiRequest = {
  get: () => http.get<GuestTaxSettingsType>('/guest/tax-settings'),
};

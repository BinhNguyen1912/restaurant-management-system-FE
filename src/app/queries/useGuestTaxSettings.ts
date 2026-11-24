import { guestTaxApiRequest } from '@/apiRequest/guestTax';
import { useQuery } from '@tanstack/react-query';

export const useGuestTaxSettings = () => {
  return useQuery({
    queryKey: ['guest-tax-settings'],
    queryFn: guestTaxApiRequest.get,
    staleTime: 5 * 60 * 1000,
  });
};

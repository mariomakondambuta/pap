import { useQuery } from '@tanstack/react-query';
import { apiRequest } from './client';
import type { PlatformSettings } from '../lib/types';

export function useSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: () => apiRequest<PlatformSettings>('/settings'),
  });
}

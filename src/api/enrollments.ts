import { useQuery } from '@tanstack/react-query';
import { apiRequest } from './client';
import type { LibraryProduct } from '../lib/types';

export function useMyLibrary() {
  return useQuery({
    queryKey: ['library'],
    queryFn: () => apiRequest<{ products: LibraryProduct[] }>('/enrollments/me'),
  });
}

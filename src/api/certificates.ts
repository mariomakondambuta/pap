import { useQuery } from '@tanstack/react-query';
import { apiRequest } from './client';
import type { Certificate } from '../lib/types';

export function useMyCertificates() {
  return useQuery({
    queryKey: ['certificates'],
    queryFn: () => apiRequest<{ certificates: Certificate[] }>('/certificates/me'),
  });
}

export interface VerifiedCertificate {
  certificate_code: string;
  issued_at: string;
  student_name: string;
  product_title: string;
}

export function verifyCertificate(code: string) {
  return apiRequest<{ valid: true; certificate: VerifiedCertificate }>(`/certificates/verify/${encodeURIComponent(code)}`);
}

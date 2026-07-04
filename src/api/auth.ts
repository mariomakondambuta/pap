import { useQuery } from '@tanstack/react-query';
import { apiRequest } from './client';
import type { User } from '../lib/types';

interface AuthResponse {
  token: string;
  user: User;
}

export function loginRequest(email: string, password: string) {
  return apiRequest<AuthResponse>('/auth/login', { method: 'POST', body: { email, password } });
}

export function registerRequest(name: string, email: string, password: string) {
  return apiRequest<AuthResponse>('/auth/register', { method: 'POST', body: { name, email, password } });
}

export function useMe(enabled: boolean) {
  return useQuery({
    queryKey: ['me'],
    queryFn: () => apiRequest<{ user: User }>('/auth/me'),
    enabled,
  });
}

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from './client';
import type { AdminStats, Order, PlatformSettings, User, Withdrawal } from '../lib/types';

export function useAdminStats() {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => apiRequest<AdminStats>('/admin/stats'),
  });
}

export function useAdminUsers() {
  return useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => apiRequest<{ users: User[] }>('/admin/users'),
  });
}

export function useUpdateUserRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role }: { id: number | string; role: 'admin' | 'user' }) =>
      apiRequest<{ success: true }>(`/admin/users/${id}/role`, { method: 'PUT', body: { role } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => apiRequest<{ success: true }>(`/admin/users/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
  });
}

export function useAdminOrders() {
  return useQuery({
    queryKey: ['admin', 'orders'],
    queryFn: () => apiRequest<{ orders: Order[] }>('/admin/orders'),
  });
}

export function useAdminWithdrawals() {
  return useQuery({
    queryKey: ['admin', 'withdrawals'],
    queryFn: () => apiRequest<{ withdrawals: Withdrawal[] }>('/admin/withdrawals'),
  });
}

export function useProcessWithdrawal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, admin_note }: { id: number | string; status: 'paid' | 'rejected'; admin_note?: string }) =>
      apiRequest<{ success: true }>(`/admin/withdrawals/${id}`, { method: 'PUT', body: { status, admin_note } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'withdrawals'] }),
  });
}

export function useUpdateAdminSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { platform_name: string; commission_percent: number | string }) =>
      apiRequest<{ settings: PlatformSettings }>('/admin/settings', { method: 'PUT', body: payload }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['settings'] }),
  });
}

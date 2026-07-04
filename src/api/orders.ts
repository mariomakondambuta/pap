import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from './client';
import type { Order } from '../lib/types';

interface CheckoutResponse {
  orderId: number;
  simulated: boolean;
  checkoutUrl?: string;
}

export function useCheckout() {
  return useMutation({
    mutationFn: (productId: number | string) => apiRequest<CheckoutResponse>('/orders/checkout', { method: 'POST', body: { product_id: productId } }),
  });
}

export function useSimulatePay() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (orderId: number | string) => apiRequest<{ success: true; order: Order }>(`/orders/${orderId}/simulate-pay`, { method: 'POST' }),
    onSuccess: (_d, orderId) => qc.invalidateQueries({ queryKey: ['orders', orderId] }),
  });
}

export function useMyPurchases() {
  return useQuery({
    queryKey: ['orders', 'purchases'],
    queryFn: () => apiRequest<{ orders: Order[] }>('/orders/me'),
  });
}

export function useMySales() {
  return useQuery({
    queryKey: ['orders', 'sales'],
    queryFn: () => apiRequest<{ orders: Order[] }>('/orders/sales/me'),
  });
}

export function useOrder(id: number | string | undefined, options: { refetchInterval?: number } = {}) {
  return useQuery({
    queryKey: ['orders', id],
    queryFn: () => apiRequest<{ order: Order; stripeEnabled: boolean }>(`/orders/${id}`),
    enabled: Boolean(id),
    refetchInterval: options.refetchInterval,
  });
}

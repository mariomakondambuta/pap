import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from './client';
import type { PayoutAccount, Wallet, Withdrawal } from '../lib/types';

export function useWallet() {
  return useQuery({
    queryKey: ['wallet'],
    queryFn: () => apiRequest<Wallet>('/wallet/me'),
  });
}

export function usePayoutAccounts() {
  return useQuery({
    queryKey: ['wallet', 'payout-accounts'],
    queryFn: () => apiRequest<{ accounts: PayoutAccount[] }>('/wallet/payout-accounts'),
  });
}

export interface PayoutAccountPayload {
  method: 'iban' | 'mbway';
  holder_name: string;
  iban?: string;
  phone?: string;
}

export function useCreatePayoutAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: PayoutAccountPayload) => apiRequest<{ account: PayoutAccount }>('/wallet/payout-accounts', { method: 'POST', body: payload }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['wallet'] }),
  });
}

export function useDeletePayoutAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => apiRequest<{ success: true }>(`/wallet/payout-accounts/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['wallet'] }),
  });
}

export function useCreateWithdrawal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { amount_cents: number; payout_account_id: number }) =>
      apiRequest<{ withdrawal: Withdrawal }>('/wallet/withdrawals', { method: 'POST', body: payload }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wallet'] });
      qc.invalidateQueries({ queryKey: ['withdrawals'] });
    },
  });
}

export function useMyWithdrawals() {
  return useQuery({
    queryKey: ['withdrawals', 'mine'],
    queryFn: () => apiRequest<{ withdrawals: Withdrawal[] }>('/wallet/withdrawals/me'),
  });
}

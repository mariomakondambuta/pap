import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from './client';
import type { Lesson, Product } from '../lib/types';

export interface ProductFilters {
  search?: string;
  category?: string;
  format?: string;
  price?: 'gratis' | 'pago' | '';
}

export interface ProductPayload {
  title: string;
  description?: string;
  category?: string;
  format?: string;
  level?: string;
  price?: number | string;
  thumbnail_url?: string;
  published?: boolean;
}

export interface ProductDetail {
  product: Product;
  lessons: Lesson[];
  hasAccess: boolean;
  progress: { completed: number; total: number; percent: number } | null;
  pendingOrderId: number | null;
  isOwner: boolean;
}

function toQueryString(filters: ProductFilters) {
  const params = new URLSearchParams();
  if (filters.search) params.set('search', filters.search);
  if (filters.category) params.set('category', filters.category);
  if (filters.format) params.set('format', filters.format);
  if (filters.price) params.set('price', filters.price);
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export function useProducts(filters: ProductFilters = {}) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => apiRequest<{ products: Product[] }>(`/products${toQueryString(filters)}`),
  });
}

export function useMyProducts() {
  return useQuery({
    queryKey: ['products', 'mine'],
    queryFn: () => apiRequest<{ products: Product[] }>('/products/mine'),
  });
}

export function useAdminProducts() {
  return useQuery({
    queryKey: ['products', 'admin'],
    queryFn: () => apiRequest<{ products: Product[] }>('/products/admin/all'),
  });
}

export function useProduct(id: number | string | undefined) {
  return useQuery({
    queryKey: ['products', id],
    queryFn: () => apiRequest<ProductDetail>(`/products/${id}`),
    enabled: Boolean(id),
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ProductPayload) => apiRequest<{ product: Product }>('/products', { method: 'POST', body: payload }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: Partial<ProductPayload> }) =>
      apiRequest<{ product: Product }>(`/products/${id}`, { method: 'PUT', body: payload }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  });
}

export function useUploadThumbnail() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, file }: { id: number | string; file: File }) => {
      const formData = new FormData();
      formData.append('image', file);
      return apiRequest<{ product: Product }>(`/products/${id}/thumbnail`, { method: 'POST', body: formData });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => apiRequest<{ success: true }>(`/products/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  });
}

export function useEnrollFree() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => apiRequest<{ success: true }>(`/products/${id}/enroll`, { method: 'POST' }),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: ['products', id] });
      qc.invalidateQueries({ queryKey: ['library'] });
    },
  });
}

export interface LessonPayload {
  title: string;
  description?: string;
  type: string;
  order_index?: number | string;
  duration_minutes?: number | string;
  content_url?: string;
  file?: File;
}

function lessonFormData(payload: LessonPayload) {
  const formData = new FormData();
  formData.append('title', payload.title);
  formData.append('description', payload.description || '');
  formData.append('type', payload.type);
  formData.append('order_index', String(payload.order_index ?? 0));
  formData.append('duration_minutes', String(payload.duration_minutes ?? 0));
  if (payload.content_url) formData.append('content_url', payload.content_url);
  if (payload.file) formData.append('file', payload.file);
  return formData;
}

export function useAddLesson() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, payload }: { productId: number | string; payload: LessonPayload }) =>
      apiRequest<{ lesson: Lesson }>(`/products/${productId}/lessons`, { method: 'POST', body: lessonFormData(payload) }),
    onSuccess: (_d, { productId }) => qc.invalidateQueries({ queryKey: ['products', productId] }),
  });
}

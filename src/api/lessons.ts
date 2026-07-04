import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from './client';
import type { Lesson } from '../lib/types';
import type { Certificate } from '../lib/types';
import type { LessonPayload } from './products';

export interface LessonDetail {
  lesson: Lesson;
  completed: boolean;
  previousLesson: { id: number } | null;
  nextLesson: { id: number } | null;
  position: { index: number; total: number };
}

export function useLesson(id: number | string | undefined) {
  return useQuery({
    queryKey: ['lessons', id],
    queryFn: () => apiRequest<LessonDetail>(`/lessons/${id}`),
    enabled: Boolean(id),
  });
}

function lessonFormData(payload: Partial<LessonPayload>) {
  const formData = new FormData();
  if (payload.title !== undefined) formData.append('title', payload.title);
  if (payload.description !== undefined) formData.append('description', payload.description || '');
  if (payload.type !== undefined) formData.append('type', payload.type);
  if (payload.order_index !== undefined) formData.append('order_index', String(payload.order_index));
  if (payload.duration_minutes !== undefined) formData.append('duration_minutes', String(payload.duration_minutes));
  if (payload.content_url) formData.append('content_url', payload.content_url);
  if (payload.file) formData.append('file', payload.file);
  return formData;
}

export function useUpdateLesson() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: Partial<LessonPayload> }) =>
      apiRequest<{ lesson: Lesson }>(`/lessons/${id}`, { method: 'PUT', body: lessonFormData(payload) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  });
}

export function useDeleteLesson() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => apiRequest<{ success: true }>(`/lessons/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  });
}

export function useCompleteLesson() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) =>
      apiRequest<{ success: true; progress: { completed: number; total: number }; certificate: Certificate | null }>(
        `/lessons/${id}/complete`,
        { method: 'POST' }
      ),
    onSuccess: (_d, id) => {
      qc.invalidateQueries({ queryKey: ['lessons', id] });
      qc.invalidateQueries({ queryKey: ['library'] });
      qc.invalidateQueries({ queryKey: ['certificates'] });
    },
  });
}

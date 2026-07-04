import { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Alert } from './Alert';
import { Icon } from '../lib/icons';
import { inputClasses, labelClasses } from './formControls';
import { useProduct, useAddLesson } from '../api/products';
import { useDeleteLesson, useUpdateLesson } from '../api/lessons';
import type { Lesson, LessonType } from '../lib/types';

const TYPE_ICON: Record<LessonType, string> = { video: 'video', pdf: 'file-text', file: 'paperclip' };

interface FormState {
  id: number | null;
  title: string;
  description: string;
  type: LessonType;
  order_index: string;
  duration_minutes: string;
  content_url: string;
}

const EMPTY_FORM: FormState = {
  id: null,
  title: '',
  description: '',
  type: 'video',
  order_index: '0',
  duration_minutes: '0',
  content_url: '',
};

export function ContentManagerModal({
  open,
  onClose,
  productId,
  productTitle,
}: {
  open: boolean;
  onClose: () => void;
  productId: number;
  productTitle: string;
}) {
  const { data } = useProduct(open ? productId : undefined);
  const addLesson = useAddLesson();
  const updateLesson = useUpdateLesson();
  const deleteLesson = useDeleteLesson();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');

  const lessons = data?.lessons || [];

  function editLesson(lesson: Lesson) {
    setForm({
      id: lesson.id,
      title: lesson.title,
      description: lesson.description || '',
      type: lesson.type,
      order_index: String(lesson.order_index),
      duration_minutes: String(lesson.duration_minutes || 0),
      content_url: lesson.content_url.startsWith('/uploads/') ? '' : lesson.content_url,
    });
    setFile(null);
    setError('');
  }

  function resetForm() {
    setForm(EMPTY_FORM);
    setFile(null);
    setError('');
  }

  async function handleDelete(id: number) {
    if (!confirm('Eliminar este conteúdo?')) return;
    await deleteLesson.mutateAsync(id);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!file && !form.content_url.trim()) {
      setError('Indique um link para o conteúdo ou envie um ficheiro.');
      return;
    }
    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      type: form.type,
      order_index: form.order_index,
      duration_minutes: form.duration_minutes,
      content_url: form.content_url.trim() || undefined,
      file: file || undefined,
    };
    try {
      if (form.id) {
        await updateLesson.mutateAsync({ id: form.id, payload });
      } else {
        await addLesson.mutateAsync({ productId, payload });
      }
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao guardar conteúdo.');
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={`Conteúdos — ${productTitle}`} maxWidth="max-w-[680px]">
      <ul className="mb-6 flex list-none flex-col gap-2 p-0">
        {lessons.length === 0 && <li className="text-text-muted">Ainda não há conteúdos neste produto.</li>}
        {lessons.map((lesson) => (
          <li key={lesson.id} className="flex items-center gap-3 rounded-sm border border-border bg-white p-3.5">
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-bg-alt">
              <Icon name={TYPE_ICON[lesson.type] || 'file-text'} size={18} />
            </span>
            <div className="flex-1">
              <div className="font-semibold">{lesson.title}</div>
              <div className="text-[0.8rem] text-text-muted">
                Ordem {lesson.order_index}
                {lesson.duration_minutes ? ` · ${lesson.duration_minutes} min` : ''}
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => editLesson(lesson)}>
                Editar
              </Button>
              <Button type="button" variant="danger" size="sm" onClick={() => handleDelete(lesson.id)}>
                Eliminar
              </Button>
            </div>
          </li>
        ))}
      </ul>

      <h4 className="mb-3">{form.id ? 'Editar conteúdo' : 'Adicionar conteúdo'}</h4>
      <Alert variant="error">{error}</Alert>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className={labelClasses}>Título</label>
          <input className={inputClasses()} required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>
        <div className="mb-4">
          <label className={labelClasses}>Descrição (opcional)</label>
          <textarea className={inputClasses()} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <div className="mb-4 grid grid-cols-2 gap-4">
          <div>
            <label className={labelClasses}>Tipo</label>
            <select className={inputClasses()} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as LessonType })}>
              <option value="video">Vídeo</option>
              <option value="pdf">PDF</option>
              <option value="file">Ficheiro (planilha, doc, zip...)</option>
            </select>
          </div>
          <div>
            <label className={labelClasses}>Ordem</label>
            <input type="number" min={0} className={inputClasses()} value={form.order_index} onChange={(e) => setForm({ ...form, order_index: e.target.value })} />
          </div>
        </div>
        <div className="mb-4">
          <label className={labelClasses}>Duração (minutos, opcional)</label>
          <input type="number" min={0} className={inputClasses()} value={form.duration_minutes} onChange={(e) => setForm({ ...form, duration_minutes: e.target.value })} />
        </div>
        <div className="mb-4">
          <label className={labelClasses}>Link do conteúdo (YouTube ou URL direto)</label>
          <input
            className={inputClasses()}
            placeholder="https://www.youtube.com/watch?v=..."
            value={form.content_url}
            onChange={(e) => setForm({ ...form, content_url: e.target.value })}
          />
        </div>
        <div className="mb-4">
          <label className={labelClasses}>Ou enviar ficheiro</label>
          <input type="file" className={inputClasses()} onChange={(e) => setFile(e.target.files?.[0] || null)} />
        </div>
        <div className="flex gap-3">
          <Button type="submit" className="flex-1" disabled={addLesson.isPending || updateLesson.isPending}>
            Guardar conteúdo
          </Button>
          <Button type="button" variant="outline" onClick={resetForm}>
            Cancelar edição
          </Button>
        </div>
      </form>
    </Modal>
  );
}

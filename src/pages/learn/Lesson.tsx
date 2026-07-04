import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useLesson } from '../../api/lessons';
import { useCompleteLesson } from '../../api/lessons';
import { Spinner } from '../../components/Spinner';
import { EmptyState } from '../../components/EmptyState';
import { Modal } from '../../components/Modal';
import { Button } from '../../components/Button';
import { LinkButton } from '../../components/LinkButton';
import { Icon } from '../../lib/icons';
import { Badge } from '../../components/Badge';

function youtubeEmbedUrl(url: string) {
  const watchMatch = url.match(/[?&]v=([^&]+)/);
  if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}`;
  const shortMatch = url.match(/youtu\.be\/([^?&]+)/);
  if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}`;
  return url;
}

export function Lesson() {
  const { id } = useParams();
  const { data, isLoading, error } = useLesson(id);
  const completeLesson = useCompleteLesson();
  const [showCertModal, setShowCertModal] = useState(false);

  if (isLoading) return <div className="mx-auto max-w-[1180px] px-6 pt-8"><Spinner /></div>;
  if (error || !data) {
    return (
      <div className="mx-auto max-w-[1180px] px-6 pt-8">
        <EmptyState icon="alert-triangle">{error instanceof Error ? error.message : 'Aula não encontrada.'}</EmptyState>
      </div>
    );
  }

  const { lesson, completed, previousLesson, nextLesson, position } = data;

  async function handleComplete() {
    const result = await completeLesson.mutateAsync(lesson.id);
    if (result.certificate && !completed) setShowCertModal(true);
  }

  return (
    <div className="mx-auto max-w-[1180px] px-6 pt-8">
      <Link to={`/curso/${lesson.product_id}`} className="inline-flex items-center gap-1 text-[0.9rem] text-text-muted hover:text-text">
        <Icon name="chevron-left" size={14} /> {lesson.product_title}
      </Link>
      <div className="mt-2 mb-5 flex items-center justify-between">
        <h1 className="mb-0">{lesson.title}</h1>
        <Badge variant="neutral">Aula {position.index} de {position.total}</Badge>
      </div>

      <div className="max-w-[900px]">
        {lesson.type === 'video' ? (
          /youtube\.com|youtu\.be/i.test(lesson.content_url) ? (
            <div className="relative overflow-hidden rounded-md bg-black pt-[56.25%]">
              <iframe src={youtubeEmbedUrl(lesson.content_url)} className="absolute inset-0 h-full w-full border-0" allowFullScreen />
            </div>
          ) : (
            <video controls className="w-full rounded-md bg-black" src={lesson.content_url} />
          )
        ) : (
          <>
            <iframe src={lesson.content_url} className="h-[70vh] w-full rounded-md border border-border" />
            <div className="mt-3">
              <a href={lesson.content_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-sm border border-border px-[14px] py-2 text-[0.85rem] font-heading font-semibold text-text hover:border-primary hover:text-primary">
                Abrir PDF numa nova aba
              </a>
            </div>
          </>
        )}

        {lesson.description && <p className="mt-5">{lesson.description}</p>}

        <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
          <div>{previousLesson && <LinkButton to={`/aula/${previousLesson.id}`} variant="outline"><Icon name="chevron-left" size={16} /> Anterior</LinkButton>}</div>
          <Button variant={completed ? 'outline' : 'primary'} disabled={completed || completeLesson.isPending} onClick={handleComplete}>
            {completed ? <><Icon name="check" size={16} /> Aula concluída</> : 'Marcar como concluída'}
          </Button>
          <div>{nextLesson && <LinkButton to={`/aula/${nextLesson.id}`} variant="outline">Seguinte <Icon name="chevron-right" size={16} /></LinkButton>}</div>
        </div>
      </div>

      <Modal open={showCertModal} onClose={() => setShowCertModal(false)} title="">
        <div className="text-center">
          <div className="text-accent"><Icon name="award" size={48} /></div>
          <h2>Parabéns, concluiu o curso!</h2>
          <p>O seu certificado já está disponível para download.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <LinkButton to="/painel/certificados">Ver certificado</LinkButton>
            <Button variant="outline" onClick={() => setShowCertModal(false)}>Continuar a explorar</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

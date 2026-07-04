import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useProduct, useCreateProduct, useUpdateProduct, useUploadThumbnail, useDeleteProduct, type ProductPayload } from '../../api/products';
import { Button } from '../../components/Button';
import { Alert } from '../../components/Alert';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Dropzone } from '../../components/Dropzone';
import { ContentManagerModal } from '../../components/ContentManagerModal';
import { Icon } from '../../lib/icons';
import { inputClasses, labelClasses } from '../../components/formControls';

interface FormState {
  title: string;
  description: string;
  format: string;
  category: string;
  price: string;
  thumbnail_url: string;
  published: '0' | '1';
}

const BLANK_FORM: FormState = {
  title: '',
  description: '',
  format: 'curso',
  category: '',
  price: '0',
  thumbnail_url: '',
  published: '0',
};

export function ProductEditor() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const idParam = searchParams.get('id');
  const productId = idParam ? Number(idParam) : undefined;
  const formatoParam = searchParams.get('formato');

  const { data, isLoading } = useProduct(productId);
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const uploadThumbnail = useUploadThumbnail();
  const deleteProduct = useDeleteProduct();

  const [form, setForm] = useState<FormState>({ ...BLANK_FORM, format: formatoParam || 'curso' });
  const [snapshot, setSnapshot] = useState<FormState>(form);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showContentModal, setShowContentModal] = useState(false);

  useEffect(() => {
    if (!data) return;
    const next: FormState = {
      title: data.product.title || '',
      description: data.product.description || '',
      format: data.product.format || 'curso',
      category: data.product.category || '',
      price: (data.product.price_cents / 100).toFixed(2),
      thumbnail_url: data.product.thumbnail_url || '',
      published: data.product.published ? '1' : '0',
    };
    setForm(next);
    setSnapshot(next);
  }, [data]);

  const dirty = JSON.stringify(form) !== JSON.stringify(snapshot);
  const isEdit = Boolean(productId);

  function update(patch: Partial<FormState>) {
    setForm((prev) => ({ ...prev, ...patch }));
  }

  function discard() {
    setForm(snapshot);
  }

  async function saveProduct() {
    setError('');
    const payload: ProductPayload = {
      title: form.title.trim(),
      description: form.description.trim(),
      format: form.format,
      category: form.category.trim(),
      price: form.price,
      thumbnail_url: form.thumbnail_url.trim(),
      published: form.published === '1',
    };
    try {
      if (isEdit && productId) {
        const { product } = await updateProduct.mutateAsync({ id: productId, payload });
        const next: FormState = { ...form, title: product.title };
        setForm(next);
        setSnapshot(next);
        setSuccess('Produto atualizado com sucesso.');
      } else {
        const { product } = await createProduct.mutateAsync(payload);
        setSnapshot(form);
        setSuccess('Produto criado. Já pode adicionar conteúdos.');
        setSearchParams({ id: String(product.id) }, { replace: true });
      }
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao guardar produto.');
    }
  }

  async function handleUploadThumbnail(file: File) {
    if (!productId) return;
    try {
      const { product } = await uploadThumbnail.mutateAsync({ id: productId, file });
      update({ thumbnail_url: product.thumbnail_url || '' });
      setSnapshot((prev) => ({ ...prev, thumbnail_url: product.thumbnail_url || '' }));
      setSuccess('Imagem atualizada.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar imagem.');
    }
  }

  async function handleDelete() {
    if (!productId || !data) return;
    if (!confirm(`Eliminar o produto "${data.product.title}"? Esta ação não pode ser revertida.`)) return;
    await deleteProduct.mutateAsync(productId);
    navigate('/negocio/produtos');
  }

  if (isEdit && isLoading) return <p className="text-text-muted">A carregar...</p>;

  return (
    <div className="mx-auto max-w-[1200px]">
      <div className="mb-4.5 flex flex-wrap items-center gap-2.5">
        <button onClick={() => navigate('/negocio/produtos')} className="flex h-[30px] w-[30px] items-center justify-center rounded-[9px] text-text-muted hover:bg-bg-alt" aria-label="Voltar a Produtos">
          <Icon name="chevron-left" size={18} />
        </button>
        <h1 className="mb-0">{isEdit ? data?.product.title || 'Produto' : 'Novo produto'}</h1>
        {isEdit && <Badge variant={form.published === '1' ? 'success' : 'warning'}>{form.published === '1' ? 'Publicado' : 'Rascunho'}</Badge>}
        <div className="ml-auto flex gap-2">
          {isEdit && (
            <>
              <a href={`/curso/${productId}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-[10px] border border-border px-[11px] py-1.5 text-[0.78rem] font-heading font-semibold text-text hover:border-primary hover:text-primary">
                Pré-visualizar
              </a>
              <button onClick={handleDelete} className="inline-flex items-center gap-2 rounded-[10px] border border-border px-[11px] py-1.5 text-[0.78rem] font-heading font-semibold text-text hover:border-primary hover:text-primary">
                Eliminar
              </button>
            </>
          )}
        </div>
      </div>

      {success && <div className="mb-4 rounded-sm bg-success-light px-4 py-3 text-[0.9rem] text-success">{success}</div>}
      <Alert variant="error">{error}</Alert>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          saveProduct();
        }}
      >
        <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(260px,1fr)]">
          <div className="flex flex-col gap-5">
            <Card>
              <h3>Detalhes</h3>
              <div className="mb-4">
                <label className={labelClasses}>Título</label>
                <input className={inputClasses(true)} required placeholder="Ex: Guia completo de marketing digital" value={form.title} onChange={(e) => update({ title: e.target.value })} />
              </div>
              <div>
                <label className={labelClasses}>Descrição</label>
                <textarea className={inputClasses(true)} rows={6} placeholder="Descreva o que o comprador vai encontrar neste produto..." value={form.description} onChange={(e) => update({ description: e.target.value })} />
              </div>
            </Card>

            <Card>
              <h3>Conteúdo multimédia</h3>
              <Dropzone
                disabled={!isEdit}
                onFile={handleUploadThumbnail}
              />
              {form.thumbnail_url && (
                <img src={form.thumbnail_url} alt="Pré-visualização da capa" className="mt-3 block w-full rounded-sm border border-border object-cover" style={{ maxHeight: 220 }} onError={(e) => (e.currentTarget.style.display = 'none')} />
              )}
            </Card>

            <Card>
              <h3>Preço</h3>
              <div>
                <label className={labelClasses}>Preço em € (0 para gratuito)</label>
                <input type="number" min={0} step={0.01} className={inputClasses(true)} value={form.price} onChange={(e) => update({ price: e.target.value })} />
              </div>
            </Card>

            <Card>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="mb-0">Conteúdos do produto</h3>
                <Button type="button" variant="outline" size="sm" disabled={!isEdit} onClick={() => setShowContentModal(true)}>
                  Gerir conteúdos
                </Button>
              </div>
              <p className="mb-0 text-text-muted">
                {isEdit ? `${data?.lessons.length ?? 0} conteúdo(s) adicionado(s).` : 'Grave o produto primeiro para poder adicionar vídeos, PDFs ou ficheiros.'}
              </p>
            </Card>
          </div>

          <div className="flex flex-col gap-5">
            <Card>
              <h3>Estado</h3>
              <select className={inputClasses(true)} value={form.published} onChange={(e) => update({ published: e.target.value as '0' | '1' })}>
                <option value="0">Rascunho</option>
                <option value="1">Publicado</option>
              </select>
            </Card>

            {isEdit && (
              <Card>
                <h3>Vendas</h3>
                <div className="mb-2.5 flex justify-between"><span className="text-text-muted">Conteúdos</span><strong>{data?.lessons.length ?? 0}</strong></div>
                <div className="flex justify-between"><span className="text-text-muted">Alunos</span><strong>{data?.product.student_count ?? 0}</strong></div>
              </Card>
            )}

            <Card>
              <h3>Organização do produto</h3>
              <div className="mb-4">
                <label className={labelClasses}>Tipo</label>
                <select className={inputClasses(true)} value={form.format} onChange={(e) => update({ format: e.target.value })}>
                  <option value="curso">Curso (vídeo-aulas)</option>
                  <option value="ebook">E-book</option>
                  <option value="planilha">Planilha</option>
                  <option value="template">Template</option>
                  <option value="pack">Pack</option>
                  <option value="outro">Outro</option>
                </select>
              </div>
              <div>
                <label className={labelClasses}>Categoria</label>
                <input className={inputClasses(true)} placeholder="Ex: Marketing" value={form.category} onChange={(e) => update({ category: e.target.value })} />
              </div>
            </Card>
          </div>
        </div>
      </form>

      {dirty && (
        <div className="fixed inset-x-0 bottom-0 z-[90] flex items-center justify-between gap-4 bg-dark px-4.5 py-3 text-[0.85rem] text-white shadow-[0_-8px_24px_rgba(0,0,0,0.25)] md:left-[264px]">
          <div className="flex items-center gap-2.5">
            <Icon name="alert-triangle" size={18} />
            Alterações não guardadas
          </div>
          <div className="flex gap-2">
            <button type="button" className="rounded-[10px] px-[11px] py-[6px] text-[0.78rem] font-heading font-semibold text-white hover:bg-white/10" onClick={discard}>
              Descartar
            </button>
            <button type="button" onClick={() => saveProduct()} className="rounded-[10px] bg-gradient-to-b from-[#2c2c2c] to-[#050505] px-[11px] py-[6px] text-[0.78rem] font-heading font-semibold text-white shadow hover:from-[#3a3a3a] hover:to-[#111]">
              Guardar
            </button>
          </div>
        </div>
      )}

      {isEdit && productId && data && (
        <ContentManagerModal open={showContentModal} onClose={() => setShowContentModal(false)} productId={productId} productTitle={data.product.title} />
      )}
    </div>
  );
}

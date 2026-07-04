export function formatPrice(cents: number | null | undefined, currency = 'EUR'): string {
  if (!cents) return 'Grátis';
  return new Intl.NumberFormat('pt-PT', { style: 'currency', currency }).format(cents / 100);
}

export function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max).trim()}…`;
}

export function formatDate(value: string | Date): string {
  return new Date(value).toLocaleDateString('pt-PT', { day: '2-digit', month: 'long', year: 'numeric' });
}

export function formatDateShort(value: string | Date): string {
  return new Date(value).toLocaleDateString('pt-PT');
}

export const FORMAT_LABELS: Record<string, string> = {
  curso: 'Curso',
  ebook: 'E-book',
  planilha: 'Planilha',
  template: 'Template',
  pack: 'Pack',
  outro: 'Produto',
};

export const FORMAT_ICONS: Record<string, string> = {
  curso: 'video',
  ebook: 'book',
  planilha: 'bar-chart',
  template: 'file-text',
  pack: 'package',
  outro: 'grid',
};

export const LEVEL_LABELS: Record<string, string> = {
  iniciante: 'Iniciante',
  intermedio: 'Intermédio',
  avancado: 'Avançado',
};

export const ORDER_STATUS_LABEL: Record<string, string> = {
  paid: 'Pago',
  pending: 'Pendente',
  failed: 'Falhou',
  refunded: 'Reembolsado',
  canceled: 'Cancelado',
};

export const WITHDRAWAL_STATUS_LABEL: Record<string, string> = {
  pending: 'Pendente',
  approved: 'Aprovado',
  paid: 'Pago',
  rejected: 'Rejeitado',
};

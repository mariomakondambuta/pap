export type Role = 'admin' | 'user';
export type ProductFormat = 'curso' | 'ebook' | 'planilha' | 'template' | 'pack' | 'outro';
export type ProductLevel = 'iniciante' | 'intermedio' | 'avancado';
export type LessonType = 'video' | 'pdf' | 'file';
export type OrderStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'canceled';
export type WithdrawalStatus = 'pending' | 'approved' | 'paid' | 'rejected';
export type PayoutMethod = 'iban' | 'mbway' | 'stripe';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  avatar_url: string | null;
  created_at: string;
}

export interface Product {
  id: number;
  seller_id: number;
  title: string;
  description: string | null;
  category: string | null;
  format: ProductFormat;
  level: ProductLevel;
  price_cents: number;
  currency: string;
  thumbnail_url: string | null;
  published: 0 | 1 | boolean;
  is_free: boolean;
  created_at: string;
  updated_at: string;
  seller_name?: string;
  seller_bio?: string;
  lesson_count?: number;
  student_count?: number;
}

export interface Lesson {
  id: number;
  product_id: number;
  title: string;
  description: string | null;
  type: LessonType;
  content_url: string;
  order_index: number;
  duration_minutes: number;
  completed?: boolean;
  product_title?: string;
}

export interface LibraryProduct extends Product {
  enrolled_at: string;
  source: 'free' | 'purchase';
  certificate_code: string | null;
  total_lessons: number;
  completed_lessons: number;
  progress_percent: number;
}

export interface Certificate {
  certificate_code: string;
  issued_at: string;
  product_id: number;
  product_title: string;
}

export interface Order {
  id: number;
  buyer_id: number;
  product_id: number;
  seller_id: number;
  amount_cents: number;
  currency: string;
  platform_fee_cents: number;
  seller_net_cents: number;
  status: OrderStatus;
  payment_provider: 'stripe' | 'simulated';
  created_at: string;
  paid_at: string | null;
  product_title: string;
  thumbnail_url?: string;
  buyer_name?: string;
  seller_name?: string;
}

export interface WalletLedgerEntry {
  id: number;
  type: 'sale' | 'withdrawal' | 'reversal';
  amount_cents: number;
  description: string | null;
  created_at: string;
}

export interface Wallet {
  balance_cents: number;
  total_earned_cents: number;
  pending_withdrawals_cents: number;
  ledger: WalletLedgerEntry[];
}

export interface PayoutAccount {
  id: number;
  method: PayoutMethod;
  holder_name: string | null;
  iban: string | null;
  phone: string | null;
  is_default: boolean;
}

export interface Withdrawal {
  id: number;
  amount_cents: number;
  status: WithdrawalStatus;
  requested_at: string;
  method?: PayoutMethod;
  iban?: string;
  phone?: string;
  user_name?: string;
  user_email?: string;
  holder_name?: string;
}

export interface PlatformSettings {
  platform_name: string;
  commission_percent: number;
  currency: string;
  stripe_enabled: boolean;
}

export interface AdminStats {
  totalUsers: number;
  totalProducts: number;
  publishedProducts: number;
  totalSellers: number;
  totalEnrollments: number;
  totalCertificates: number;
  totalSales: number;
  totalRevenueCents: number;
  totalCommissionCents: number;
  pendingWithdrawals: number;
  pendingWithdrawalsCents: number;
  recentSales: RecentSale[];
}

export interface RecentSale {
  buyer_name: string;
  seller_name: string;
  product_title: string;
  amount_cents: number;
  currency: string;
  paid_at: string | null;
}

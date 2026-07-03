-- EduWeb - Marketplace de infoprodutos (estilo Hotmart)
-- Esquema da base de dados MySQL

CREATE DATABASE IF NOT EXISTS eduweb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE eduweb;

-- Utilizadores: qualquer conta pode comprar e também vender os seus próprios produtos
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'user') NOT NULL DEFAULT 'user',
  bio TEXT DEFAULT NULL,
  avatar_url VARCHAR(255) DEFAULT NULL,
  stripe_account_id VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Definições globais da plataforma (comissão, nome, moeda)
CREATE TABLE IF NOT EXISTS platform_settings (
  id INT PRIMARY KEY DEFAULT 1,
  platform_name VARCHAR(100) NOT NULL DEFAULT 'EduWeb',
  commission_percent DECIMAL(5,2) NOT NULL DEFAULT 15.00,
  currency VARCHAR(3) NOT NULL DEFAULT 'EUR',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Produtos: cursos, e-books, planilhas, templates ou packs vendidos por qualquer utilizador
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  seller_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  category VARCHAR(100) DEFAULT 'Geral',
  format ENUM('curso', 'ebook', 'planilha', 'template', 'pack', 'outro') NOT NULL DEFAULT 'curso',
  level ENUM('iniciante', 'intermedio', 'avancado') NOT NULL DEFAULT 'iniciante',
  price_cents INT NOT NULL DEFAULT 0,
  currency VARCHAR(3) NOT NULL DEFAULT 'EUR',
  thumbnail_url VARCHAR(500) DEFAULT NULL,
  published TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Conteúdos de cada produto (vídeo-aula, PDF ou ficheiro genérico: planilha, docx, zip...)
CREATE TABLE IF NOT EXISTS lessons (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  type ENUM('video', 'pdf', 'file') NOT NULL,
  content_url VARCHAR(500) NOT NULL,
  order_index INT NOT NULL DEFAULT 0,
  duration_minutes INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Acesso concedido a um utilizador sobre um produto (grátis ou após compra paga)
CREATE TABLE IF NOT EXISTS enrollments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  source ENUM('free', 'purchase') NOT NULL DEFAULT 'free',
  enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_enrollment (user_id, product_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Progresso do utilizador em cada conteúdo
CREATE TABLE IF NOT EXISTS lesson_progress (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  lesson_id INT NOT NULL,
  completed TINYINT(1) NOT NULL DEFAULT 0,
  completed_at TIMESTAMP NULL DEFAULT NULL,
  UNIQUE KEY unique_progress (user_id, lesson_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Certificados de conclusão
CREATE TABLE IF NOT EXISTS certificates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  certificate_code VARCHAR(50) NOT NULL UNIQUE,
  issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_certificate (user_id, product_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Encomendas / transações de compra
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  buyer_id INT NOT NULL,
  product_id INT NOT NULL,
  seller_id INT NOT NULL,
  amount_cents INT NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'EUR',
  platform_fee_cents INT NOT NULL DEFAULT 0,
  seller_net_cents INT NOT NULL DEFAULT 0,
  status ENUM('pending', 'paid', 'failed', 'refunded', 'canceled') NOT NULL DEFAULT 'pending',
  payment_provider ENUM('stripe', 'simulated') NOT NULL DEFAULT 'simulated',
  stripe_session_id VARCHAR(255) DEFAULT NULL UNIQUE,
  stripe_payment_intent_id VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  paid_at TIMESTAMP NULL DEFAULT NULL,
  FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Livro-razão da carteira de cada utilizador (vendas creditadas, levantamentos debitados)
CREATE TABLE IF NOT EXISTS wallet_ledger (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  type ENUM('sale', 'withdrawal', 'reversal') NOT NULL,
  amount_cents INT NOT NULL,
  order_id INT DEFAULT NULL,
  withdrawal_id INT DEFAULT NULL,
  description VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Contas de pagamento do produtor (para onde recebe os levantamentos)
CREATE TABLE IF NOT EXISTS payout_accounts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  method ENUM('iban', 'mbway', 'stripe') NOT NULL,
  holder_name VARCHAR(150) DEFAULT NULL,
  iban VARCHAR(50) DEFAULT NULL,
  phone VARCHAR(30) DEFAULT NULL,
  stripe_account_id VARCHAR(255) DEFAULT NULL,
  is_default TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Pedidos de levantamento do saldo da carteira
CREATE TABLE IF NOT EXISTS withdrawal_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  amount_cents INT NOT NULL,
  payout_account_id INT DEFAULT NULL,
  status ENUM('pending', 'approved', 'paid', 'rejected') NOT NULL DEFAULT 'pending',
  admin_note TEXT DEFAULT NULL,
  requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  processed_at TIMESTAMP NULL DEFAULT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (payout_account_id) REFERENCES payout_accounts(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Definições da plataforma por omissão
INSERT INTO platform_settings (id, platform_name, commission_percent, currency)
SELECT 1, 'EduWeb', 15.00, 'EUR'
WHERE NOT EXISTS (SELECT 1 FROM platform_settings WHERE id = 1);

-- Conta de administrador por omissão
-- Email: admin@eduweb.com | Password: admin123
INSERT INTO users (name, email, password_hash, role)
SELECT 'Administrador', 'admin@eduweb.com', '$2a$10$e5JDWrxqmh2jkR2RqhQbwevrzIZAW1UpZMgCc/aZT7Zzu8DgjKJh.', 'admin'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@eduweb.com');

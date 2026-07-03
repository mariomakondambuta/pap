# EduWeb — Marketplace de Infoprodutos

Projeto desenvolvido no âmbito da Prova de Aptidão Profissional (PAP).

EduWeb é um marketplace de infoprodutos (à semelhança da Hotmart): qualquer
utilizador pode **vender** os seus cursos, e-books, planilhas, templates ou
packs, e **comprar** ou aceder gratuitamente aos produtos de outros
produtores. A EduWeb atua como intermediária, processando os pagamentos e
retendo uma comissão configurável em cada venda.

## Funcionalidades

- Uma única conta para vender e para comprar (sem papéis separados)
- Publicação de produtos: cursos (vídeo-aulas), e-books, planilhas,
  templates ou packs — cada um com os seus próprios conteúdos (vídeo, PDF
  ou ficheiro genérico como `.xlsx`, `.docx` ou `.zip`)
- Cada produto pode ser **gratuito** ou **pago**, à escolha do produtor
- Checkout com **Stripe** (cartão de crédito) e **modo de demonstração**
  automático quando não há chaves Stripe configuradas
- Comissão da plataforma configurável pelo administrador, aplicada
  automaticamente em cada venda
- Carteira do produtor: saldo, histórico de movimentos, contas de
  pagamento (IBAN/MB WAY) e pedidos de levantamento
- Acompanhamento de progresso, certificado digital em PDF ao concluir um
  produto e verificação pública do certificado por código
- Painel administrativo com visão total da plataforma: produtos de todos
  os produtores, transações, levantamentos pendentes, utilizadores e
  definições de comissão

## Design

Interface monocromática (preto, branco e tons de cinzento), inspirada no
painel de administração da Shopify: barra superior escura, sidebar clara
com item ativo destacado e conteúdo em cartões brancos sobre fundo cinzento
claro. Layout mobile-first — a sidebar de "A minha conta" e do painel admin
transforma-se numa gaveta (drawer) em ecrãs pequenos, já que a maioria dos
clientes acede pelo telemóvel.

A página `/precos.html` apresenta a comissão da plataforma (definida em
`/admin/index.html → Definições`) de forma transparente, com exemplos de
quanto o produtor recebe por venda — inspirada em
[shopify.com/pt/precos](https://www.shopify.com/pt/precos) e
[stripe.com/en-pt/pricing](https://stripe.com/en-pt/pricing).

## Stack tecnológico

| Camada | Tecnologia |
| --- | --- |
| Marcação e estilos | HTML5, CSS3 (design próprio, sem frameworks) |
| Tipografia | [Poppins](https://fonts.google.com/specimen/Poppins) (títulos/UI) + [Inter](https://fonts.google.com/specimen/Inter) (texto corrido) |
| Cliente | JavaScript (Vanilla, `fetch`) |
| Servidor | Node.js + Express |
| Base de dados | MySQL (via `mysql2`) |
| Autenticação | JWT (`jsonwebtoken`) + `bcryptjs` |
| Pagamentos | Stripe Checkout + Stripe Connect (com modo de simulação) |
| Upload de ficheiros | `multer` |
| Geração de certificados | `pdfkit` |

## Estrutura do projeto

```
pap/
├── server.js                # ponto de entrada da aplicação Express
├── config/db.js             # ligação à base de dados MySQL
├── db/schema.sql            # esquema da base de dados + conta admin inicial
├── middleware/               # autenticação (JWT) e upload (multer)
├── controllers/               # lógica de negócio de cada recurso
├── routes/                   # definição dos endpoints REST (/api/...)
├── utils/                     # JWT, certificados PDF, Stripe, cálculo de comissões
├── uploads/                   # ficheiros enviados (vídeo/PDF/ficheiros) — não versionado
└── public/                    # frontend (HTML/CSS/JS servido estaticamente)
    ├── css/style.css          # design system monocromático + app shell
    ├── js/
    │   ├── icons.js           # ícones SVG inline (sem emojis)
    │   └── app-shell.js       # topbar + sidebar/drawer do painel e do admin
    ├── precos.html            # página de preços (comissão, exemplos, FAQ)
    ├── painel.html            # área pessoal: Biblioteca / Vender / Carteira
    └── admin/index.html       # painel administrativo da plataforma
```

## Como executar localmente

### 1. Requisitos

- [Node.js](https://nodejs.org/) 18 ou superior
- MySQL (ou MariaDB), local ou através do WAMPP

### 2. Instalar dependências

```bash
npm install
```

### 3. Configurar a base de dados

```bash
mysql -u root -p < db/schema.sql
```

Isto cria a base de dados `eduweb` e uma conta de administrador de
demonstração:

- **Email:** `admin@eduweb.com`
- **Password:** `admin123`

> Altere esta password assim que possível num ambiente real.

### 4. Configurar variáveis de ambiente

```bash
cp .env.example .env
```

```
PORT=3000

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=eduweb

JWT_SECRET=troque-este-segredo-em-producao
JWT_EXPIRES_IN=7d

APP_URL=http://localhost:3000

STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
```

### 5. Iniciar o servidor

```bash
npm start
```

A aplicação fica disponível em `http://localhost:3000`.

Para desenvolvimento com recarregamento automático:

```bash
npm run dev
```

## Pagamentos: modo de demonstração vs. Stripe real

A plataforma deteta automaticamente se a Stripe está configurada:

- **Sem `STRIPE_SECRET_KEY`** (predefinição): todas as compras usam um
  **checkout simulado**, claramente identificado como "modo de
  demonstração" — nenhum valor real é cobrado. Isto permite testar e
  demonstrar o fluxo completo de compra sem precisar de uma conta Stripe.
- **Com `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY` e
  `STRIPE_WEBHOOK_SECRET`**: as compras passam a usar o Stripe Checkout
  real. Se o produtor ligar a sua conta Stripe Connect (campo
  `stripe_account_id` do utilizador), o valor líquido é transferido
  automaticamente para a sua conta em cada venda; caso contrário, o valor
  fica na carteira interna da EduWeb, disponível para levantamento manual
  (aprovado pelo administrador).

Nenhum dado de cartão passa pelos servidores da EduWeb em nenhum dos dois
modos — no modo real, isso é sempre feito pela Stripe.

## Fluxo de utilização

1. **Produtor**: cria conta, vai a "A minha conta → Vender", cria um
   produto (curso, e-book, planilha, template ou pack), define o preço
   (0 € para gratuito) e adiciona os conteúdos (vídeo, PDF ou ficheiro).
2. **Comprador**: explora o catálogo (`/cursos.html`), filtra por
   formato/preço/categoria e acede a um produto:
   - Se for **gratuito**, ganha acesso imediato.
   - Se for **pago**, é levado ao checkout (Stripe real ou simulado);
     após o pagamento, o acesso é concedido automaticamente.
3. O comprador vai concluindo os conteúdos; ao terminar todos, recebe um
   **certificado automático** em PDF, verificável publicamente em
   `/verificar.html`.
4. O produtor acompanha as suas vendas e o saldo da carteira em
   "A minha conta → Carteira", adiciona uma conta de pagamento (IBAN ou
   MB WAY) e pede levantamentos.
5. O **administrador** (`/admin/index.html`) tem visão e controlo total:
   todos os produtos, todas as transações, aprova/rejeita levantamentos e
   ajusta a percentagem de comissão da plataforma.

## API (resumo)

| Método | Rota | Descrição |
| --- | --- | --- |
| POST | `/api/auth/register` / `/api/auth/login` | Registo e autenticação |
| GET | `/api/products` | Catálogo público (filtros: `search`, `category`, `format`, `price`) |
| GET | `/api/products/:id` | Detalhe do produto, acesso e progresso |
| GET | `/api/products/mine` | Os meus produtos à venda |
| POST/PUT/DELETE | `/api/products` `/api/products/:id` | Gerir os meus produtos |
| POST | `/api/products/:id/enroll` | Aceder a um produto gratuito |
| POST | `/api/products/:productId/lessons` | Adicionar conteúdo a um produto |
| GET/PUT/DELETE | `/api/lessons/:id` | Consultar/gerir um conteúdo |
| POST | `/api/lessons/:id/complete` | Marcar conteúdo como concluído |
| GET | `/api/enrollments/me` | A minha biblioteca (com progresso) |
| POST | `/api/orders/checkout` | Iniciar compra (Stripe ou simulada) |
| POST | `/api/orders/:id/simulate-pay` | Confirmar pagamento simulado |
| GET | `/api/orders/me` `/api/orders/sales/me` | As minhas compras / vendas |
| GET | `/api/wallet/me` | Saldo e histórico da carteira |
| POST | `/api/wallet/payout-accounts` | Adicionar conta de pagamento |
| POST | `/api/wallet/withdrawals` | Pedir levantamento |
| GET | `/api/certificates/me` `/api/certificates/verify/:code` | Certificados e verificação pública |
| GET | `/api/settings` | Comissão e nome da plataforma (público) |
| GET | `/api/admin/stats` `/api/admin/orders` `/api/admin/withdrawals` | Visão total da plataforma (admin) |
| PUT | `/api/admin/settings` | Alterar comissão da plataforma (admin) |

## Autor

Mário de Jesus Nowa Makondambuta

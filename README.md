# EduWeb — Plataforma de Cursos Online

Projeto desenvolvido no âmbito da Prova de Aptidão Profissional (PAP).

EduWeb é uma plataforma de e-learning onde administradores criam e gerem
cursos (organizados por aulas em vídeo e PDF) e os alunos se inscrevem,
acompanham o seu progresso e recebem um certificado digital ao concluir
cada curso.

## Funcionalidades

- Registo e autenticação de utilizadores (aluno / administrador) com JWT
- Gestão de cursos e aulas (vídeo ou PDF, upload de ficheiro ou link externo)
- Inscrição de alunos nos cursos disponíveis
- Acompanhamento do progresso do aluno aula a aula
- Emissão automática de certificado de conclusão (PDF) ao terminar um curso
- Verificação pública de certificados por código
- Painel administrativo com estatísticas, gestão de cursos, aulas e utilizadores

## Stack tecnológico

| Camada | Tecnologia |
| --- | --- |
| Marcação e estilos | HTML5, CSS3 (design próprio, sem frameworks) |
| Tipografia | [Poppins](https://fonts.google.com/specimen/Poppins) (títulos/UI) + [Inter](https://fonts.google.com/specimen/Inter) (texto corrido) |
| Cliente | JavaScript (Vanilla, `fetch`) |
| Servidor | Node.js + Express |
| Base de dados | MySQL (via `mysql2`) |
| Autenticação | JWT (`jsonwebtoken`) + `bcryptjs` |
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
├── utils/                     # geração de tokens JWT e de certificados PDF
├── uploads/                   # ficheiros de vídeo/PDF enviados (não versionado)
└── public/                    # frontend (HTML/CSS/JS servido estaticamente)
    ├── css/style.css
    ├── js/
    └── admin/index.html      # painel administrativo
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

Crie a base de dados e as tabelas a partir do esquema fornecido:

```bash
mysql -u root -p < db/schema.sql
```

Isto cria a base de dados `eduweb` e uma conta de administrador de
demonstração:

- **Email:** `admin@eduweb.com`
- **Password:** `admin123`

> Altere esta password assim que possível num ambiente real.

### 4. Configurar variáveis de ambiente

Copie o ficheiro de exemplo e ajuste os valores de acordo com a sua
instalação de MySQL/WAMPP:

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

## Fluxo de utilização

1. **Administrador** entra com a conta de demonstração e cria um curso no
   painel (`/admin/index.html`), publica-o e adiciona aulas (vídeo do
   YouTube, ficheiro de vídeo próprio ou documento PDF).
2. **Aluno** regista-se, explora o catálogo (`/cursos.html`) e inscreve-se
   num curso gratuitamente.
3. O aluno vai concluindo as aulas uma a uma; o progresso é apresentado em
   percentagem no seu painel.
4. Ao concluir a última aula, a plataforma emite automaticamente um
   certificado, disponível para download em PDF na página
   `/certificados.html`.
5. Qualquer pessoa pode confirmar a autenticidade de um certificado em
   `/verificar.html`, introduzindo o respetivo código.

## API (resumo)

| Método | Rota | Descrição |
| --- | --- | --- |
| POST | `/api/auth/register` | Criar conta de aluno |
| POST | `/api/auth/login` | Iniciar sessão |
| GET | `/api/courses` | Listar cursos publicados |
| GET | `/api/courses/:id` | Detalhe de um curso e suas aulas |
| POST | `/api/courses/:id/enroll` | Inscrever o aluno autenticado |
| GET | `/api/enrollments/me` | Cursos do aluno com progresso |
| GET | `/api/lessons/:id` | Conteúdo de uma aula (requer inscrição) |
| POST | `/api/lessons/:id/complete` | Marcar aula como concluída |
| GET | `/api/certificates/me` | Certificados do aluno |
| GET | `/api/certificates/:code/download` | Descarregar certificado em PDF |
| GET | `/api/certificates/verify/:code` | Verificação pública de certificado |
| POST/PUT/DELETE | `/api/courses` `/api/lessons` | Gestão de cursos/aulas (admin) |
| GET | `/api/admin/stats` `/api/admin/users` | Estatísticas e gestão de utilizadores (admin) |

## Autor

Mário de Jesus Nowa Makondambuta

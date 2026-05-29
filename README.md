# 📢 SchoolManager: MS6 - NoticeService

## 1. Visão Geral do Projeto
O SchoolManager é um sistema de gestão escolar desenvolvido para digitalizar e acelerar processos administrativos e acadêmicos de escolas. O foco está na produtividade da secretaria e dos professores.

O sistema possui uma arquitetura baseada em **microsserviços**, utilizando um API Gateway como ponto de entrada (validando tokens gerados pelo AuthService) e comunicação híbrida (HTTP/REST para requisições síncronas e RabbitMQ para operações assíncronas). O ecossistema completo conta com 6 microsserviços isolados com seus próprios bancos de dados (MariaDB).

---

## 2. Sobre o NoticeService (MS6)
Este repositório contém exclusivamente o código do **MS6 - NoticeService**. Ele atua como o centro de comunicação interna do SchoolManager, permitindo que administradores publiquem avisos e controlem a visualização por professores.

**Domínio:** Avisos, visibilidade e rastreamento de leitura.

### Responsabilidades Principais
* **Publicação de Avisos:** Administradores podem criar avisos com título, conteúdo, data, prioridade e status.
* **Visibilidade Restrita:** Possibilidade de direcionar um aviso a um conjunto específico de professores (através de `teacher_ids`). Avisos sem restrição são visíveis a todos os professores.
* **Rastreamento de Leitura:** Cada professor possui um registro individual por aviso, indicando se já visualizou a mensagem (data/hora do primeiro acesso).
* **Segurança e Autorização:** Endpoints de criação, edição e remoção são protegidos por token JWT e exigem papel `ADMIN`. Professores autenticados podem listar apenas os avisos que lhes são destinados e marcar como lidos.

### Banco de Dados
Este microsserviço possui seu domínio de dados totalmente isolado, utilizando uma instância de **MariaDB** dedicada apenas às tabelas de avisos (`notices`) e visibilidade/rastreamento (`notice_visibilities`).

---

## 3. Stack Tecnológica

| Camada | Tecnologia |
|--------|-----------|
| Runtime | Node.js 20 |
| Framework | Express 5 |
| ORM | Prisma 5 (`@prisma/client`) |
| Banco de Dados | MySQL / MariaDB |
| Autenticação | JWT (`jsonwebtoken`) – tokens gerados pelo MS1 (AuthService) |
| Validação | `express-validator` |
| Documentação | Swagger UI (`swagger-ui-express` + `yamljs`) |
| Configuração | `dotenv` / Infisical (segredos em produção) |
| Container | Docker (Node 20 Alpine) |
| CI/CD | Jenkins (`Jenkinsfile`) |

---

## 4. Estrutura do Projeto

```
src/
├── config/        # prisma.js (instância do PrismaClient)
├── controllers/   # noticeController.js – requisição/resposta
├── services/      # noticeService.js – regras de negócio
├── repositories/  # noticeRepository.js, noticeVisibilityRepository.js – acesso ao banco
├── middlewares/   # authMiddleware, roleMiddleware, validationMiddleware, errorHandler
├── routes/        # index.js (+ /health), noticeRoutes.js
├── utils/         # constants.js, jwtHelper.js, teachersClient.js
└── server.js      # bootstrap do Express + Swagger
prisma/
└── schema.prisma  # modelos notices e notice_visibilities
swagger.yaml       # especificação OpenAPI 3.0
```

---

## 5. Variáveis de Ambiente

Em **desenvolvimento**, defina as variáveis abaixo em um arquivo `.env` na raiz. Em **produção**, os segredos são injetados via **Infisical** (ver seção 7).

| Variável | Obrigatória | Descrição | Exemplo |
|----------|:----------:|-----------|---------|
| `DATABASE_URL` | ✅ | String de conexão MySQL/MariaDB usada pelo Prisma | `mysql://user:senha@localhost:3306/20261prj5_school_manager_notice` |
| `JWT_SECRET` | ✅ | Segredo para validar tokens JWT emitidos pelo MS1 | `CHAVE_AQUI` |
| `PORT` | ❌ | Porta HTTP do serviço (padrão `3006`) | `3006` |
| `TEACHER_SERVICE_URL` | ✅* | Base URL do MS3 (TeacherService) para validação cruzada de `teacher_ids` | `http://localhost:3003/api` |
| `TEACHER_SERVICE_TIMEOUT_MS` | ❌ | Timeout (ms) das chamadas ao MS3 (padrão `3000`) | `3000` |
| `SERVER_URL` | ❌ | Sobrescreve a URL exibida no Swagger UI | `https://api.schoolmanager.com` |

> *`TEACHER_SERVICE_URL` só é exigida quando avisos são criados com `teacher_ids` (visibilidade restrita). Sem ela, a criação restrita falha com `TEACHER_SERVICE_URL não configurado`.

---

## 6. Instalação e Execução (local)

**Pré-requisitos:** Node.js 20+, MySQL/MariaDB acessível e o banco do domínio já criado (ver `script_schoolManager.sql` no repositório principal).

```bash
# 1. Instalar dependências
npm ci

# 2. Configurar variáveis de ambiente (criar .env conforme seção 5)

# 3. Gerar o Prisma Client
npx prisma generate

# 4. Iniciar o serviço
npm run start    # produção (node)
npm run dev      # desenvolvimento (nodemon, hot-reload)
```

Após subir, o serviço fica disponível em `http://localhost:3006/api` e a documentação em `http://localhost:3006/api-docs`.

---

## 7. Docker e CI/CD

**Build/execução com Docker:**
```bash
docker compose up --build
```
O `Dockerfile` usa build multi-stage (Node 20 Alpine), gera o Prisma Client e, no estágio final, executa o serviço via **Infisical**, que injeta os segredos do ambiente `prod` (path `/ms6-notice-service`) em tempo de execução. O container expõe a porta **9516**.

**Infisical** – o `.env` versionado contém apenas as credenciais de autenticação do Infisical (não os segredos da aplicação):
`INFISICAL_PROJECT_ID`, `INFISICAL_UNIVERSAL_AUTH_CLIENT_ID`, `INFISICAL_UNIVERSAL_AUTH_CLIENT_SECRET`, `INFISICAL_API_URL`.

**Jenkins** – o `Jenkinsfile` define o pipeline: checkout do `main` → `npm ci` + `npx prisma generate` → `docker build` → deploy (`docker run -p 9516:9516`).

---

## 8. Banco de Dados

Domínio isolado com duas tabelas (ver `prisma/schema.prisma`):

**`notices`**
| Coluna | Tipo | Observação |
|--------|------|-----------|
| `notice_id` | INT (PK, auto-increment) | |
| `notice_title` | VARCHAR(45) | obrigatório |
| `notice_content` | VARCHAR(255) | obrigatório |
| `notice_date` | DATE | |
| `notice_status` | INT | `0`=inativo, `1`=ativo, `2`=deletado |
| `notice_priority` | INT | `1`=baixa, `2`=média, `3`=alta, `4`=urgente |

**`notice_visibilities`** (visibilidade restrita + rastreamento de leitura)
| Coluna | Tipo | Observação |
|--------|------|-----------|
| `notice_visibility_id` | INT (PK, auto-increment) | |
| `notice_id` | INT (FK → notices) | |
| `teacher_id` | INT | ID lógico do professor (MS3) |
| `notice_visibility_viewed_in` | TIMESTAMP NULL | `NULL` = ainda não lido |

> **Regra de visibilidade:** um aviso é visível a um professor quando **não possui registros em `notice_visibilities`** (visível a todos) **ou** quando há um registro com o `teacher_id` dele. O campo `viewed` é calculado como `notice_visibility_viewed_in IS NOT NULL`.

---

## 9. Documentação Interativa (Swagger)

A especificação OpenAPI 3.0 fica em [`swagger.yaml`](swagger.yaml) e é servida em tempo de execução:

- **Swagger UI:** `http://localhost:3006/api-docs`

---

## 10. Padrão de Commits

Para mantermos o histórico limpo e rastreável, este projeto utiliza a especificação conforme os exemplos abaixo.

**Formato:** `<tipo>: <mensagem curta>`

**Tipos permitidos:**
- `feat`: Nova funcionalidade (ex: criação de nova rota de aviso).
- `fix`: Correção de bug (ex: ajuste no rastreamento de leitura).
- `chore`: Configurações, dependências e estrutura (ex: setup do banco MariaDB).
- `docs`: Atualização de documentação (ex: melhorias neste README).
- `refactor`: Refatoração de código sem alterar regra de negócio.
- `style`: Formatação de código (linting, prettier).
- `test`: Criação/alteração de testes de segurança ou unitários.

---

# 📡 Endpoints da API

> **Base URL:** `http://localhost:3006/api` (ajuste conforme ambiente)

## 🔐 Autenticação
Todos os endpoints (exceto `/health`) exigem um token JWT válido no header:
`Authorization: Bearer <token>`

---

## 🛠️ Avisos – Administração (apenas ADMIN)

| Método | Endpoint | Descrição | Body (exemplo) |
|--------|----------|-----------|----------------|
| POST | `/notices/createNotice` | Cria um novo aviso (pode definir `teacher_ids` para visibilidade restrita) | `{ "notice_title": "Reunião", "notice_content": "...", "notice_date": "2026-04-18", "notice_priority": 2, "teacher_ids": [1,2] }` |
| GET | `/notices/listNotices` | Lista avisos. ADMIN: ACTIVE+INACTIVE (use `?includeDeleted=true`/`?notice_status=N`). | — |
| GET | `/notices/listNoticeById/{id}` | Busca um aviso pelo ID | — |
| PUT | `/notices/updateNoticeById/{id}` | Atualiza aviso (bloqueado se status=DELETED) | `{ "notice_title": "...", "notice_status": 1 }` |
| DELETE | `/notices/deleteNoticeById/{id}` | Exclusão lógica do aviso (status=2) | — |
| POST | `/notices/restoreNoticeById/{id}` | Restaura aviso deletado (status: 2 → 1) | — |

**Observação:** O campo `teacher_ids` é opcional. Se omitido, o aviso é visível a todos os professores. Se fornecido, apenas os professores com os IDs listados poderão vê-lo.

> **Validação cruzada:** quando `teacher_ids` é informado, cada ID é validado no MS3 via Token Propagation (chamada `GET /api/teachers/listTeacherById/{id}` com o `Authorization` do ADMIN propagado). Se algum `teacher_id` não existir, o `createNotice` retorna `404 TEACHER_NOT_FOUND` e nenhum aviso é gravado. Se o MS3 estiver indisponível/timeout, retorna `503 EXTERNAL_SERVICE_UNAVAILABLE`.

---

## 👩‍🏫 Avisos – Professores (ADMIN ou TEACHER)

| Método | Endpoint | Descrição | Body (exemplo) |
|--------|----------|-----------|----------------|
| GET | `/notices/teacher/{teacherId}` | Lista avisos visíveis para um professor (inclui campo `viewed` indicando se já foi lido) | — |
| POST | `/notices/markAsViewed/{noticeId}` | Marca um aviso como lido pelo professor | TEACHER: sem body (usa `teacher_id` do JWT). ADMIN: `{ "teacher_id": <id> }` obrigatório. |

---

## ❤️ Health Check

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | `/health` | Verifica se o serviço está operacional | ❌ |

---
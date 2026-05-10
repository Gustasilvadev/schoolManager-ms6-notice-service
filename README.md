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

## 3. Padrão de Commits

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
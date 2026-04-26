module.exports = {
  NOTICE_STATUS: {
    ACTIVE: 1,
    INACTIVE: 0,
    DELETED: 2
  },
  NOTICE_PRIORITY: {
    LOW: 1,
    MEDIUM: 2,
    HIGH: 3,
    URGENT: 4
  },
  ROLES: {
    ADMIN: 'ADMIN',
    TEACHER: 'TEACHER'
  },
  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500
  },
  MESSAGES: {
    TOKEN_MISSING: 'Token não fornecido',
    TOKEN_INVALID: 'Token inválido ou expirado',
    FORBIDDEN: 'Acesso negado: permissão insuficiente',
    NOTICE_NOT_FOUND: 'Aviso não encontrado',
    NOTICE_TITLE_REQUIRED: 'Título do aviso é obrigatório',
    NOTICE_CONTENT_REQUIRED: 'Conteúdo do aviso é obrigatório',
    TEACHER_NOT_FOUND: 'Professor não encontrado',
    ALREADY_VIEWED: 'Aviso já foi visualizado por este professor',
    INVALID_DATA: 'Dados inválidos',
    REQUIRED_FIELD: 'Campo obrigatório não preenchido'
  }
};
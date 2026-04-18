const { body, param, validationResult } = require('express-validator');
const { HTTP_STATUS } = require('../utils/constants');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({ errors: errors.array() });
  }
  next();
};

// Criação de aviso
const validateCreateNotice = [
  body('notice_title')
    .notEmpty().withMessage('Título é obrigatório')
    .isLength({ max: 45 }).withMessage('Máximo 45 caracteres'),
  body('notice_content')
    .notEmpty().withMessage('Conteúdo é obrigatório')
    .isLength({ max: 255 }).withMessage('Máximo 255 caracteres'),
  body('notice_priority')
    .optional()
    .isInt({ min: 1, max: 4 }).withMessage('Prioridade deve ser 1 (baixa), 2 (média), 3 (alta) ou 4 (urgente)'),
  body('notice_status')
    .optional()
    .isInt({ min: 0, max: 2 }).withMessage('Status deve ser 0, 1 ou 2'),
  body('teacher_ids')
    .optional()
    .isArray().withMessage('teacher_ids deve ser um array de IDs de professores'),
  body('teacher_ids.*')
    .optional()
    .isInt({ min: 1 }).withMessage('Cada teacher_id deve ser um número inteiro positivo'),
  validate
];

// Atualização de aviso
const validateUpdateNotice = [
  param('id').isInt({ min: 1 }).withMessage('ID inválido'),
  body('notice_title')
    .optional()
    .isLength({ max: 45 }).withMessage('Máximo 45 caracteres'),
  body('notice_content')
    .optional()
    .isLength({ max: 255 }).withMessage('Máximo 255 caracteres'),
  body('notice_priority')
    .optional()
    .isInt({ min: 1, max: 4 }).withMessage('Prioridade deve ser 1-4'),
  body('notice_status')
    .optional()
    .isInt({ min: 0, max: 2 }).withMessage('Status deve ser 0, 1 ou 2'),
  validate
];


const validateMarkAsViewed = [
  param('noticeId').isInt({ min: 1 }).withMessage('ID do aviso inválido'),
  body('teacher_id')
    .isInt({ min: 1 }).withMessage('ID do professor é obrigatório'),
  validate
];

module.exports = {
  validateCreateNotice,
  validateUpdateNotice,
  validateMarkAsViewed
};
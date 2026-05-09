const { MESSAGES } = require('./constants');

const SERVICE_NAME = 'TeacherService';

const buildUrl = (path) => {
  const base = process.env.TEACHER_SERVICE_URL;
  if (!base) {
    throw new Error('TEACHER_SERVICE_URL não configurado');
  }
  return `${base.replace(/\/$/, '')}${path}`;
};

const fetchWithTimeout = async (url, authToken) => {
  const timeoutMs = parseInt(process.env.TEACHER_SERVICE_TIMEOUT_MS, 10) || 3000;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      headers: authToken ? { Authorization: authToken } : {}
    });
  } finally {
    clearTimeout(timer);
  }
};

const findTeacherById = async (teacherId, authToken) => {
  const url = buildUrl(`/teachers/listTeacherById/${encodeURIComponent(teacherId)}`);
  let response;
  try {
    response = await fetchWithTimeout(url, authToken);
  } catch (err) {
    console.error(`[MS6->${SERVICE_NAME}] Falha ao consultar listTeacherById:`, err.message);
    throw new Error(MESSAGES.EXTERNAL_SERVICE_UNAVAILABLE);
  }

  if (response.status === 404) return null;
  if (!response.ok) {
    console.error(`[MS6->${SERVICE_NAME}] listTeacherById retornou HTTP ${response.status}`);
    throw new Error(MESSAGES.EXTERNAL_SERVICE_UNAVAILABLE);
  }
  return await response.json();
};

module.exports = { findTeacherById };

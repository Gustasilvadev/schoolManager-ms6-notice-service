const noticeService = require('../services/noticeService');
const { HTTP_STATUS, MESSAGES, ROLES } = require('../utils/constants');

const createNotice = async (req, res, next) => {
  try {
    const { teacher_ids, ...noticeData } = req.body;
    const newNotice = await noticeService.createNotice(noticeData, teacher_ids);
    return res.status(HTTP_STATUS.CREATED).json(newNotice);
  } catch (error) {
    next(error);
  }
};

const getAllNotices = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, notice_title, notice_status, notice_priority } = req.query;
    const filters = {};
    if (notice_title) filters.notice_title = notice_title;
    if (notice_status !== undefined) filters.notice_status = parseInt(notice_status);
    if (notice_priority) filters.notice_priority = parseInt(notice_priority);
    const result = await noticeService.getAllNotices(filters, parseInt(page), parseInt(limit));
    return res.status(HTTP_STATUS.OK).json(result);
  } catch (error) {
    next(error);
  }
};

const getNoticeById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const notice = await noticeService.getNoticeById(parseInt(id));
    return res.status(HTTP_STATUS.OK).json(notice);
  } catch (error) {
    if (error.message === MESSAGES.NOTICE_NOT_FOUND) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ error: error.message });
    }
    next(error);
  }
};

const updateNotice = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = await noticeService.updateNotice(parseInt(id), req.body);
    return res.status(HTTP_STATUS.OK).json(updated);
  } catch (error) {
    if (error.message === MESSAGES.NOTICE_NOT_FOUND) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ error: error.message });
    }
    next(error);
  }
};

const deleteNotice = async (req, res, next) => {
  try {
    const { id } = req.params;
    await noticeService.deleteNotice(parseInt(id));
    return res.status(HTTP_STATUS.OK).json({ message: 'Aviso desativado com sucesso' });
  } catch (error) {
    if (error.message === MESSAGES.NOTICE_NOT_FOUND) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ error: error.message });
    }
    next(error);
  }
};

const getNoticesForTeacher = async (req, res, next) => {
  try {
    const requestedTeacherId = parseInt(req.params.teacherId);
    if (req.user.role !== ROLES.ADMIN && requestedTeacherId !== req.user.teacher_id) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({ error: MESSAGES.FORBIDDEN });
    }
    const notices = await noticeService.getNoticesForTeacher(requestedTeacherId);
    return res.status(HTTP_STATUS.OK).json(notices);
  } catch (error) {
    next(error);
  }
};

const markAsViewed = async (req, res, next) => {
  try {
    const noticeId = parseInt(req.params.noticeId);
    let teacherId;
    if (req.user.role === ROLES.ADMIN) {
      teacherId = req.body?.teacher_id;
      if (!teacherId) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: 'teacher_id obrigatório quando ADMIN' });
      }
    } else {
      if (!req.user.teacher_id) {
        return res.status(HTTP_STATUS.FORBIDDEN).json({ error: MESSAGES.FORBIDDEN });
      }
      teacherId = req.user.teacher_id;
    }
    await noticeService.markAsViewed(noticeId, teacherId);
    return res.status(HTTP_STATUS.OK).json({ message: 'Aviso marcado como lido' });
  } catch (error) {
    if (error.message === MESSAGES.NOTICE_NOT_FOUND || error.message === MESSAGES.TEACHER_NOT_FOUND) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ error: error.message });
    }
    next(error);
  }
};

module.exports = {
  createNotice,
  getAllNotices,
  getNoticeById,
  updateNotice,
  deleteNotice,
  getNoticesForTeacher,
  markAsViewed
};
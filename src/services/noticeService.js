const prisma = require('../config/prisma');
const noticeRepo = require('../repositories/noticeRepository');
const visibilityRepo = require('../repositories/noticeVisibilityRepository');
const { findTeacherById, listAllTeachers } = require('../utils/teachersClient');
const { sendNoticeCreatedEmail } = require('../utils/email/emailService');
const { NOTICE_STATUS, NOTICE_PRIORITY, MESSAGES, ROLES } = require('../utils/constants');

const notifyNoticeRecipients = async (notice, teacherIds, fetchedTeachers, authToken, sender) => {
  try {
    const recipients = (teacherIds && teacherIds.length > 0)
      ? fetchedTeachers                       // reusa objetos já buscados na validação
      : await listAllTeachers(authToken);     // broadcast: todos os professores ativos

    const senderName = sender?.email || 'Coordenação';
    const base = (process.env.FRONTEND_BASE_URL || 'http://academico3.rj.senac.br/20261prj5/schoolmanagement').replace(/\/$/, '');
    const noticeUrl = `${base}${process.env.NOTICE_PATH || '/notices'}/${notice.notice_id}`;

    const results = await Promise.allSettled(
      recipients
        .filter(t => t && t.teacher_email)
        .map(t => sendNoticeCreatedEmail({
          to: t.teacher_email,
          recipientName: t.teacher_name,
          senderName,
          noticeTitle: notice.notice_title,
          noticeUrl
        }))
    );

    const failed = results.filter(r => r.status === 'rejected').length;
    if (failed) {
      console.error(`[MS6][email] ${failed}/${results.length} email(s) de comunicado falharam`);
    }
  } catch (err) {
    console.error('[MS6][email] Falha ao enviar emails do comunicado:', err.message);
  }
};

const createNotice = async (data, teacherIds = null, authToken = null, sender = null) => {
  let noticeDate = data.notice_date;
  if (noticeDate && typeof noticeDate === 'string' && noticeDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
    noticeDate = new Date(noticeDate + 'T00:00:00Z');
  } else if (!noticeDate) {
    noticeDate = new Date();
  }

  const noticeData = {
    notice_title: data.notice_title,
    notice_content: data.notice_content,
    notice_date: noticeDate,
    notice_status: data.notice_status !== undefined ? data.notice_status : NOTICE_STATUS.ACTIVE,
    notice_priority: data.notice_priority || NOTICE_PRIORITY.MEDIUM
  };

  let created;
  const fetchedTeachers = [];

  if (teacherIds && teacherIds.length > 0) {
    for (const teacherId of teacherIds) {
      const teacher = await findTeacherById(teacherId, authToken);
      if (!teacher) throw new Error(MESSAGES.TEACHER_NOT_FOUND);
      fetchedTeachers.push(teacher); // reaproveitado para o envio de email (tem email/nome)
    }

    created = await prisma.$transaction(async (tx) => {
      const notice = await noticeRepo.create(noticeData, tx);
      for (const teacherId of teacherIds) {
        await visibilityRepo.addVisibility(notice.notice_id, teacherId, tx);
      }
      return notice;
    });
  } else {
    created = await noticeRepo.create(noticeData);
  }

  await notifyNoticeRecipients(created, teacherIds, fetchedTeachers, authToken, sender);

  return created;
};

const getAllNotices = async (filters = {}, page = 1, limit = 10, userRole = ROLES.ADMIN) => {
  const skip = (page - 1) * limit;
  const where = {};
  if (filters.notice_title) where.notice_title = { contains: filters.notice_title };
  if (filters.notice_priority) where.notice_priority = filters.notice_priority;

  if (userRole === ROLES.TEACHER) {
    where.notice_status = NOTICE_STATUS.ACTIVE;
  } else if (filters.notice_status !== undefined) {
    where.notice_status = filters.notice_status;
  } else if (filters.includeDeleted !== true) {
    where.notice_status = { in: [NOTICE_STATUS.ACTIVE, NOTICE_STATUS.INACTIVE] };
  }

  const notices = await noticeRepo.findAll(skip, limit, where);
  const total = await noticeRepo.count(where);
  return { notices, total, page, limit };
};

const getNoticeById = async (id) => {
  const notice = await noticeRepo.findById(id);
  if (!notice) throw new Error(MESSAGES.NOTICE_NOT_FOUND);
  return notice;
};

const updateNotice = async (id, updateData, authToken = null) => {
  const existing = await noticeRepo.findById(id);

  if (!existing) throw new Error(MESSAGES.NOTICE_NOT_FOUND);

  if (existing.notice_status === NOTICE_STATUS.DELETED) {
    throw new Error(MESSAGES.CANNOT_EDIT_DELETED);
  }

  const { teacher_ids, ...noticeData } = updateData;

  if (
    noticeData.notice_date &&
    typeof noticeData.notice_date === 'string' &&
    noticeData.notice_date.match(/^\d{4}-\d{2}-\d{2}$/)
  ) {
    noticeData.notice_date = new Date(noticeData.notice_date + 'T00:00:00Z');
  }

  if (Array.isArray(teacher_ids) && teacher_ids.length > 0) {
    for (const teacherId of teacher_ids) {
      const teacher = await findTeacherById(teacherId, authToken);

      if (!teacher) throw new Error(MESSAGES.TEACHER_NOT_FOUND);
    }
  }

  return await prisma.$transaction(async (tx) => {
    const updated = await noticeRepo.update(id, noticeData, tx);

    if (Array.isArray(teacher_ids)) {
      await visibilityRepo.deleteByNotice(id, tx);

      if (teacher_ids.length > 0) {
        await visibilityRepo.addMany(id, teacher_ids, tx);
      }
    }

    return updated;
  });
};

const deleteNotice = async (id) => {
  const existing = await noticeRepo.findById(id);
  if (!existing) throw new Error(MESSAGES.NOTICE_NOT_FOUND);
  await noticeRepo.softDelete(id);
  return true;
};

const restoreNotice = async (id) => {
  const existing = await noticeRepo.findById(id);
  if (!existing) throw new Error(MESSAGES.NOTICE_NOT_FOUND);
  if (existing.notice_status !== NOTICE_STATUS.DELETED) {
    throw new Error(MESSAGES.NOT_DELETED_CANNOT_RESTORE);
  }
  return await noticeRepo.restore(id);
};

const getNoticesForTeacher = async (teacherId) => {
  const notices = await noticeRepo.findVisibleForTeacher(teacherId, {
    notice_status: NOTICE_STATUS.ACTIVE
  });

  return notices.map(notice => {
    const visibility = notice.notice_visibilities[0];
    return {
      ...notice,
      viewed: visibility ? visibility.notice_visibility_viewed_in !== null : false
    };
  });
};

const markAsViewed = async (noticeId, teacherId) => {
  const notice = await noticeRepo.findById(noticeId);
  if (!notice) throw new Error(MESSAGES.NOTICE_NOT_FOUND);
  await visibilityRepo.markViewed(noticeId, teacherId);
  return true;
};

module.exports = {
  createNotice,
  getAllNotices,
  getNoticeById,
  updateNotice,
  deleteNotice,
  restoreNotice,
  getNoticesForTeacher,
  markAsViewed
};
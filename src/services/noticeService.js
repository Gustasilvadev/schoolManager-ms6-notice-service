const prisma = require('../config/prisma');
const noticeRepo = require('../repositories/noticeRepository');
const visibilityRepo = require('../repositories/noticeVisibilityRepository');
const { NOTICE_STATUS, NOTICE_PRIORITY, MESSAGES } = require('../utils/constants');

const createNotice = async (data, teacherIds = null) => {
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

  if (teacherIds && teacherIds.length > 0) {
    return await prisma.$transaction(async (tx) => {
      const created = await noticeRepo.create(noticeData, tx);
      for (const teacherId of teacherIds) {
        await visibilityRepo.addVisibility(created.notice_id, teacherId, tx);
      }
      return created;
    });
  }

  return await noticeRepo.create(noticeData);
};

const getAllNotices = async (filters = {}, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const where = {};
  if (filters.notice_title) where.notice_title = { contains: filters.notice_title };
  if (filters.notice_status !== undefined) where.notice_status = filters.notice_status;
  if (filters.notice_priority) where.notice_priority = filters.notice_priority;

  const notices = await noticeRepo.findAll(skip, limit, where);
  const total = await noticeRepo.count(where);
  return { notices, total, page, limit };
};

const getNoticeById = async (id) => {
  const notice = await noticeRepo.findById(id);
  if (!notice) throw new Error(MESSAGES.NOTICE_NOT_FOUND);
  return notice;
};

const updateNotice = async (id, updateData) => {
  const existing = await noticeRepo.findById(id);
  if (!existing) throw new Error(MESSAGES.NOTICE_NOT_FOUND);
  const updated = await noticeRepo.update(id, updateData);
  return updated;
};

const deleteNotice = async (id) => {
  const existing = await noticeRepo.findById(id);
  if (!existing) throw new Error(MESSAGES.NOTICE_NOT_FOUND);
  await noticeRepo.softDelete(id);
  return true;
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
  const existing = await visibilityRepo.findOne(noticeId, teacherId);
  if (!existing) throw new Error(MESSAGES.TEACHER_NOT_FOUND);
  await visibilityRepo.markAsViewed(noticeId, teacherId);
  return true;
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
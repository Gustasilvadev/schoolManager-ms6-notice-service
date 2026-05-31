const prisma = require('../config/prisma');

const addVisibility = async (noticeId, teacherId, tx = prisma) => {
  return await tx.notice_visibilities.create({
    data: {
      notice_id: noticeId,
      teacher_id: teacherId,
      notice_visibility_viewed_in: null
    }
  });
};

const findVisibilitiesByNotice = async (noticeId) => {
  return await prisma.notice_visibilities.findMany({
    where: { notice_id: noticeId }
  });
};

const findVisibilitiesByTeacher = async (teacherId) => {
  return await prisma.notice_visibilities.findMany({
    where: { teacher_id: teacherId },
    include: { notices: true }
  });
};

const findOne = async (noticeId, teacherId) => {
  return await prisma.notice_visibilities.findFirst({
    where: { notice_id: noticeId, teacher_id: teacherId }
  });
};

const markViewed = async (noticeId, teacherId) => {
  const existing = await prisma.notice_visibilities.findFirst({
    where: { notice_id: noticeId, teacher_id: teacherId }
  });
  if (existing) {
    return await prisma.notice_visibilities.updateMany({
      where: { notice_id: noticeId, teacher_id: teacherId },
      data: { notice_visibility_viewed_in: new Date() }
    });
  }
  return await prisma.notice_visibilities.create({
    data: {
      notice_id: noticeId,
      teacher_id: teacherId,
      notice_visibility_viewed_in: new Date()
    }
  });
};

const deleteByNotice = async (noticeId, tx = prisma) => {
  return await tx.notice_visibilities.deleteMany({
    where: {
      notice_id: noticeId,
    },
  });
};

const addMany = async (noticeId, teacherIds, tx = prisma) => {
  if (!teacherIds || teacherIds.length === 0) return;

  return await tx.notice_visibilities.createMany({
    data: teacherIds.map((teacherId) => ({
      notice_id: noticeId,
      teacher_id: teacherId,
    })),
  });
};

module.exports = {
  addVisibility,
  addMany,
  deleteByNotice,
  markViewed,
  findVisibilitiesByNotice,
  findVisibilitiesByTeacher,
  findOne,
};
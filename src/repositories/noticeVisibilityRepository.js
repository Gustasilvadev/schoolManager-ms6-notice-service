const prisma = require('../config/prisma');

const addVisibility = async (noticeId, teacherId, tx = prisma) => {
  return await tx.notice_visibilities.create({
    data: {
      notice_id: noticeId,
      teacher_id: teacherId
    }
  });
};

const markAsViewed = async (noticeId, teacherId) => {
  return await prisma.notice_visibilities.updateMany({
    where: {
      notice_id: noticeId,
      teacher_id: teacherId
    },
    data: {
      notice_visibility_viewed_in: new Date()
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

module.exports = {
  addVisibility,
  markAsViewed,
  findVisibilitiesByNotice,
  findVisibilitiesByTeacher,
  findOne
};
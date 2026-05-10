const prisma = require('../config/prisma');
const { NOTICE_STATUS } = require('../utils/constants');

const findAll = async (skip, take, where = {}) => {
  return await prisma.notices.findMany({
    where,
    skip,
    take,
    orderBy: { notice_date: 'desc' },
    include: { notice_visibilities: true }
  });
};

const findVisibleForTeacher = async (teacherId, where = {}) => {
  return await prisma.notices.findMany({
    where: {
      ...where,
      OR: [
        { notice_visibilities: { none: {} } },
        { notice_visibilities: { some: { teacher_id: teacherId } } }
      ]
    },
    orderBy: { notice_date: 'desc' },
    include: {
      notice_visibilities: {
        where: { teacher_id: teacherId }
      }
    }
  });
};

const findById = async (id) => {
  return await prisma.notices.findUnique({
    where: { notice_id: id },
    include: { notice_visibilities: true }
  });
};

const create = async (data, tx = prisma) => {
  return await tx.notices.create({ data });
};

const update = async (id, data) => {
  return await prisma.notices.update({
    where: { notice_id: id },
    data
  });
};

const softDelete = async (id) => {
  return await prisma.notices.update({
    where: { notice_id: id },
    data: { notice_status: NOTICE_STATUS.DELETED }
  });
};

const restore = async (id) => {
  return await prisma.notices.update({
    where: { notice_id: id },
    data: { notice_status: NOTICE_STATUS.ACTIVE }
  });
};

const count = async (where = {}) => {
  return await prisma.notices.count({ where });
};

module.exports = {
  findAll,
  findVisibleForTeacher,
  findById,
  create,
  update,
  softDelete,
  restore,
  count
};
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

const findById = async (id) => {
  return await prisma.notices.findUnique({
    where: { notice_id: id },
    include: { notice_visibilities: true }
  });
};

const create = async (data) => {
  return await prisma.notices.create({ data });
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

const count = async (where = {}) => {
  return await prisma.notices.count({ where });
};

module.exports = {
  findAll,
  findById,
  create,
  update,
  softDelete,
  count
};
const express = require('express');
const router = express.Router();
const noticeController = require('../controllers/noticeController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const {
  validateCreateNotice,
  validateUpdateNotice,
  validateMarkAsViewed
} = require('../middlewares/validationMiddleware');

router.use(authMiddleware);

const ADMIN_ONLY = roleMiddleware(['ADMIN']);
const ADMIN_OR_TEACHER = roleMiddleware(['ADMIN', 'TEACHER']);

router.post('/createNotice', ADMIN_ONLY, validateCreateNotice, noticeController.createNotice);
router.get('/listNotices', ADMIN_ONLY, noticeController.getAllNotices);
router.get('/listNoticeById/:id', ADMIN_ONLY, noticeController.getNoticeById);
router.put('/updateNoticeById/:id', ADMIN_ONLY, validateUpdateNotice, noticeController.updateNotice);
router.delete('/deleteNoticeById/:id', ADMIN_ONLY, noticeController.deleteNotice);
router.post('/restoreNoticeById/:id', ADMIN_ONLY, noticeController.restoreNotice);

router.get('/teacher/:teacherId', ADMIN_OR_TEACHER, noticeController.getNoticesForTeacher);
router.post('/markAsViewed/:noticeId', ADMIN_OR_TEACHER, validateMarkAsViewed, noticeController.markAsViewed);

module.exports = router;
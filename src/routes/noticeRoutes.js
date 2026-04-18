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

// Rotas para ADMIN (CRUD completo)
router.post('/createNotice', roleMiddleware(['ADMIN']), validateCreateNotice, noticeController.createNotice);
router.get('/listNotices', roleMiddleware(['ADMIN']), noticeController.getAllNotices);
router.get('/listNoticeById/:id', roleMiddleware(['ADMIN']), noticeController.getNoticeById);
router.put('/updateNoticeById/:id', roleMiddleware(['ADMIN']), validateUpdateNotice, noticeController.updateNotice);
router.delete('/deleteNoticeById/:id', roleMiddleware(['ADMIN']), noticeController.deleteNotice);

// Rotas para TEACHER (ver avisos e marcar como lido)
router.get('/teacher/:teacherId', roleMiddleware(['TEACHER', 'ADMIN']), noticeController.getNoticesForTeacher);
router.post('/markAsViewed/:noticeId', roleMiddleware(['TEACHER', 'ADMIN']), validateMarkAsViewed, noticeController.markAsViewed);

module.exports = router;
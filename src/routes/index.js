const express = require('express');
const noticeRoutes = require('./noticeRoutes');

const router = express.Router();

router.use('/notices', noticeRoutes);

router.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', service: 'notice-service' });
});

module.exports = router;
const { sendMail } = require('./mailer');
const { noticeCreatedTemplate } = require('./templates/noticeCreated');

const sendNoticeCreatedEmail = async ({ to, recipientName, senderName, noticeTitle, noticeUrl }) => {
  const html = noticeCreatedTemplate({ recipientName, senderName, noticeTitle, noticeUrl });
  return sendMail({ to, subject: `Novo comunicado: ${noticeTitle}`, html });
};

module.exports = { sendNoticeCreatedEmail };

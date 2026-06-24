const noticeCreatedTemplate = ({ recipientName, senderName, noticeTitle, noticeUrl }) => `
<!DOCTYPE html>
<html lang="pt-BR">
<body style="margin:0;padding:0;background-color:#f4f5f7;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f5f7;padding:24px 0;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
        <tr><td style="background-color:#1d4ed8;padding:24px 32px;">
          <h1 style="margin:0;color:#ffffff;font-size:20px;">SchoolManager</h1>
        </td></tr>
        <tr><td style="padding:32px;">
          <p style="margin:0 0 16px;color:#111827;font-size:16px;">Olá, <strong>${recipientName || 'Professor(a)'}</strong>,</p>
          <p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.6;">
            Você recebeu um novo comunicado de <strong>${senderName}</strong> no sistema.
          </p>
          <table role="presentation" width="100%" style="background-color:#f9fafb;border-left:4px solid #1d4ed8;border-radius:4px;margin:0 0 24px;">
            <tr><td style="padding:16px 20px;">
              <p style="margin:0;color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:.5px;">Comunicado</p>
              <p style="margin:4px 0 0;color:#111827;font-size:18px;font-weight:bold;">${noticeTitle}</p>
            </td></tr>
          </table>
          <table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="border-radius:6px;background-color:#1d4ed8;">
            <a href="${noticeUrl}" style="display:inline-block;padding:14px 28px;color:#ffffff;font-size:15px;font-weight:bold;text-decoration:none;">Ler comunicado</a>
          </td></tr></table>
          <p style="margin:24px 0 0;color:#9ca3af;font-size:13px;">Se o botão não funcionar, acesse: <br><a href="${noticeUrl}" style="color:#1d4ed8;">${noticeUrl}</a></p>
        </td></tr>
        <tr><td style="background-color:#f9fafb;padding:20px 32px;border-top:1px solid #e5e7eb;">
          <p style="margin:0;color:#9ca3af;font-size:12px;">Mensagem automática do SchoolManager. Por favor, não responda este email.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

module.exports = { noticeCreatedTemplate };

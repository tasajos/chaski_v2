const nodemailer = require('nodemailer');
const QRCode = require('qrcode');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

function formatFecha(fecha) {
  if (!fecha) return '';
  const d = new Date(fecha);
  return d.toLocaleDateString('es-BO', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

exports.sendQREmail = async (email, nombre, codigoQr, evento) => {
  // Generar QR como buffer PNG (no base64 inline — Gmail lo bloquea)
  const qrBuffer = await QRCode.toBuffer(codigoQr, {
    type: 'png', width: 300, margin: 2,
    color: { dark: '#111827', light: '#FFFFFF' },
  });

  const fechaTexto = formatFecha(evento.fecha);

  await transporter.sendMail({
    from: `"${process.env.SMTP_FROM_NAME || 'Chakuy Events'}" <${process.env.SMTP_USER}>`,
    to: email,
    subject: `Tu QR de acceso — ${evento.titulo}`,
    // El QR se referencia con cid:qrcode@evento — compatible con Gmail
    html: `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#F3F4F6;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F3F4F6;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.1);">

        <!-- Header -->
        <tr>
          <td style="background:#FF6B35;padding:32px 40px;text-align:center;">
            <h1 style="color:#fff;margin:0;font-size:26px;font-weight:800;letter-spacing:-.5px;">
              🐷 ${evento.titulo}
            </h1>
            <p style="color:rgba(255,255,255,.85);margin:8px 0 0;font-size:15px;">Tu acceso está confirmado</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px 40px;">
            <p style="font-size:16px;color:#374151;margin:0 0 8px;">Hola <strong>${nombre}</strong>,</p>
            <p style="font-size:15px;color:#6B7280;margin:0 0 28px;line-height:1.6;">
              Tu participación en <strong>${evento.titulo}</strong> ha sido confirmada.
              Presenta el siguiente código QR al llegar al evento para registrar tu asistencia.
            </p>

            <!-- QR Code — adjunto via CID para compatibilidad con Gmail -->
            <div style="text-align:center;margin:0 0 28px;">
              <img src="cid:qrcode@evento"
                   alt="Código QR de acceso" width="240" height="240"
                   style="border:6px solid #FF6B35;border-radius:16px;padding:8px;display:inline-block;" />
              <p style="font-size:11px;color:#9CA3AF;margin:10px 0 0;font-family:monospace;word-break:break-all;">
                ${codigoQr}
              </p>
            </div>

            <!-- Datos del evento -->
            <table width="100%" cellpadding="0" cellspacing="0"
                   style="background:#FFF7F3;border-radius:12px;border:1px solid #FFD5C2;margin-bottom:28px;">
              <tr><td style="padding:20px 24px;">
                ${fechaTexto ? `
                <p style="margin:0 0 10px;font-size:14px;color:#374151;">
                  <strong style="color:#E85A2A;">📅 Fecha:</strong> ${fechaTexto}
                </p>` : ''}
                ${evento.ubicacion ? `
                <p style="margin:0;font-size:14px;color:#374151;">
                  <strong style="color:#E85A2A;">📍 Lugar:</strong> ${evento.ubicacion}
                </p>` : ''}
              </td></tr>
            </table>

            <p style="font-size:13px;color:#9CA3AF;margin:0;line-height:1.6;">
              Guarda este correo o descarga la imagen del QR. No compartas este código — es personal e intransferible.
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#F9FAFB;padding:20px 40px;text-align:center;border-top:1px solid #E5E7EB;">
            <p style="margin:0;font-size:12px;color:#9CA3AF;">
              Powered by <strong style="color:#5B4CFF;">Chakuy</strong> — Plataforma de Eventos
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`,
    attachments: [
      {
        filename: 'qr-acceso.png',
        content: qrBuffer,
        cid: 'qrcode@evento',   // mismo CID referenciado en el HTML
        contentType: 'image/png',
      },
    ],
  });
};

exports.verifyConnection = async () => {
  return transporter.verify();
};

import nodemailer from 'nodemailer';
import { getDb } from './db';

function getSmtpConfig() {
  const db = getDb();
  const rows = db.prepare("SELECT key, value FROM site_settings WHERE key IN ('smtp_host','smtp_port','smtp_user','smtp_pass')").all() as {key:string,value:string}[];
  const s: Record<string,string> = {};
  for (const r of rows) s[r.key] = r.value;
  return {
    host: s.smtp_host || process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(s.smtp_port || process.env.SMTP_PORT || '587'),
    user: s.smtp_user || process.env.SMTP_USER || '',
    pass: s.smtp_pass || process.env.SMTP_PASS || '',
  };
}

export async function sendEmail(to: string, subject: string, html: string) {
  const config = getSmtpConfig();
  if (!config.user || !config.pass) {
    console.log('[Email] SMTP not configured. Would have sent:', { to, subject });
    return;
  }
  try {
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: false,
      auth: { user: config.user, pass: config.pass },
    });
    await transporter.sendMail({ from: config.user, to, subject, html });
    console.log('[Email] Sent:', subject, 'to', to);
  } catch (error) {
    console.error('[Email] Failed:', error);
  }
}

export async function notifyAdmin(subject: string, html: string) {
  const config = getSmtpConfig();
  if (!config.user) return;
  await sendEmail(config.user, subject, html);
}

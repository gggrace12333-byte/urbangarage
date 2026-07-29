import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY || '';
const emailFrom = process.env.EMAIL_FROM || 'Urban Garage <onboarding@resend.dev>';

// Lazy-init Resend client
let resend: Resend | null = null;
function getResend(): Resend | null {
  if (!resendApiKey) return null;
  if (!resend) resend = new Resend(resendApiKey);
  return resend;
}

export async function sendEmail(to: string, subject: string, html: string) {
  const client = getResend();
  if (!client) return; // Silent skip if not configured

  try {
    await client.emails.send({
      from: emailFrom,
      to,
      subject,
      html,
    });
  } catch {
    // Email failures are non-critical; don't crash the request
  }
}

export async function notifyAdmin(subject: string, html: string) {
  // Send admin notification to the from address (store owner)
  // The checkout API also handles admin notifications
  const client = getResend();
  if (!client) return;

  try {
    await client.emails.send({
      from: emailFrom,
      to: emailFrom, // Admin gets notified at the from address
      subject,
      html,
    });
  } catch {
    // Non-critical
  }
}

export async function sendEmail(to: string, subject: string, html: string) {
  console.log('[Email] Would send:', { to, subject });
}

export async function notifyAdmin(subject: string, html: string) {
  console.log('[Email] Would notify admin:', subject);
}

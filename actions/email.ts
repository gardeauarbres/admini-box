'use server';

import { sendEmail } from '@/lib/email';

export async function sendNotificationEmail(to: string, subject: string, message: string) {
    const html = `
    <div>
      <h1>Notification AdminiBox</h1>
      <p>${message}</p>
      <hr />
      <small>Ceci est un message automatique.</small>
    </div>
    `;

    return await sendEmail({ to, subject, html });
}

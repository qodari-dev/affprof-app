import { env } from '@/env';
import { Resend } from 'resend';

type SendResendEmailInput = {
  from: string;
  to: string[];
  cc?: string[];
  subject: string;
  html: string;
  text: string;
};

let resendClient: Resend | null = null;

function getResendClient() {
  if (!env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not configured');
  }

  if (!resendClient) {
    resendClient = new Resend(env.RESEND_API_KEY);
  }

  return resendClient;
}

export function canSendResendEmail() {
  return Boolean(env.RESEND_API_KEY && env.RESEND_FROM_EMAIL);
}

export async function sendResendEmail(input: SendResendEmailInput) {
  const resend = getResendClient();
  const response = await resend.emails.send({
    from: input.from,
    to: input.to,
    cc: input.cc,
    subject: input.subject,
    html: input.html,
    text: input.text,
  });

  if (response.error || !response.data?.id) {
    throw new Error(response.error?.message || 'Could not send email with Resend');
  }

  return { id: response.data.id };
}

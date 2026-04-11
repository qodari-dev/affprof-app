import { NextResponse } from 'next/server';

import {
  constructStripeWebhookEvent,
  processStripeWebhookEvent,
} from '@/server/services/stripe-webhooks';

export async function POST(request: Request) {
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ message: 'Missing stripe-signature header' }, { status: 400 });
  }

  const payload = await request.text();

  let event;

  try {
    event = constructStripeWebhookEvent(payload, signature);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[stripe-webhook] signature verification failed:', message);
    return NextResponse.json({ message: 'Invalid signature' }, { status: 400 });
  }

  try {
    await processStripeWebhookEvent(event);
  } catch (error) {
    console.error(`[stripe-webhook] Error handling ${event.type}:`, error);
    return NextResponse.json({ message: 'Webhook handler failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true as const });
}

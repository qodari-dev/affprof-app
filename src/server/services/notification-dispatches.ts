import { db, notificationDispatches } from '@/server/db';
import { NotificationDispatches } from '@/server/db/types';
import { and, eq } from 'drizzle-orm';

type NotificationDispatchType = NotificationDispatches['type'];

type QueueNotificationDispatchInput = {
  userId: string;
  type: NotificationDispatchType;
  dedupeKey: string;
  toEmail: string;
  ccEmail?: string | null;
  subject: string;
  payload: Record<string, unknown>;
};

type SendTrackedEmailInput = QueueNotificationDispatchInput & {
  send: () => Promise<{ id?: string | null }>;
};

function normalizeErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message.slice(0, 500);
  }

  return 'Unknown notification error';
}

export async function queueNotificationDispatch(input: QueueNotificationDispatchInput) {
  const [created] = await db
    .insert(notificationDispatches)
    .values({
      userId: input.userId,
      type: input.type,
      dedupeKey: input.dedupeKey,
      toEmail: input.toEmail,
      ccEmail: input.ccEmail ?? null,
      subject: input.subject,
      payload: input.payload,
      status: 'processing',
    })
    .onConflictDoNothing({
      target: [
        notificationDispatches.userId,
        notificationDispatches.type,
        notificationDispatches.dedupeKey,
      ],
    })
    .returning({
      id: notificationDispatches.id,
    });

  return created ?? null;
}

export async function markNotificationDispatchSent(id: string, providerMessageId?: string | null) {
  await db
    .update(notificationDispatches)
    .set({
      status: 'sent',
      providerMessageId: providerMessageId ?? null,
      error: null,
      sentAt: new Date(),
    })
    .where(eq(notificationDispatches.id, id));
}

export async function markNotificationDispatchFailed(id: string, error: unknown) {
  await db
    .update(notificationDispatches)
    .set({
      status: 'failed',
      error: normalizeErrorMessage(error),
    })
    .where(eq(notificationDispatches.id, id));
}

export async function findNotificationDispatch(
  userId: string,
  type: NotificationDispatchType,
  dedupeKey: string,
) {
  return db.query.notificationDispatches.findFirst({
    where: and(
      eq(notificationDispatches.userId, userId),
      eq(notificationDispatches.type, type),
      eq(notificationDispatches.dedupeKey, dedupeKey),
    ),
  });
}

export async function sendTrackedEmailNotification(input: SendTrackedEmailInput) {
  const queued = await queueNotificationDispatch(input);

  if (!queued) {
    return { skipped: true as const, reason: 'duplicate' as const };
  }

  try {
    const result = await input.send();
    await markNotificationDispatchSent(queued.id, result.id);
    return { skipped: false as const, id: queued.id };
  } catch (error) {
    await markNotificationDispatchFailed(queued.id, error);
    throw error;
  }
}

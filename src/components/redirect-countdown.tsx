'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

interface RedirectCountdownProps {
  to: string;
  seconds?: number;
  /** next-intl namespace, e.g. "billing.success" */
  namespace: string;
  /** Translation key inside the namespace. The string must use {count} as the placeholder. */
  labelKey: string;
}

/**
 * Counts down from `seconds` to 0 then pushes to `to`.
 * Renders the label via next-intl with {count} interpolated client-side.
 */
export function RedirectCountdown({ to, seconds = 5, namespace, labelKey }: RedirectCountdownProps) {
  const [count, setCount] = useState(seconds);
  const router = useRouter();
  const t = useTranslations(namespace);

  useEffect(() => {
    if (count <= 0) {
      router.push(to);
      return;
    }
    const timer = setTimeout(() => setCount((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [count, router, to]);

  return (
    <p className="text-sm text-muted-foreground">
      {t(labelKey, { count })}
    </p>
  );
}

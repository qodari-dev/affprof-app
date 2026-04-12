'use client';

import * as React from 'react';
import Image from 'next/image';

import { cn } from '@/lib/utils';

function getBrandInitial(name: string) {
  return name.trim().charAt(0).toUpperCase() || 'B';
}

export function BrandLogo({
  name,
  logoUrl,
  className,
}: {
  name: string;
  logoUrl?: string | null;
  className?: string;
}) {
  const normalizedSrc = logoUrl?.trim() || null;
  const [currentSrc, setCurrentSrc] = React.useState(normalizedSrc);

  React.useEffect(() => {
    setCurrentSrc(normalizedSrc);
  }, [normalizedSrc]);

  return (
    <div
      className={cn(
        'relative flex items-center justify-center overflow-hidden rounded-xl border bg-muted/20',
        className,
      )}
    >
      {currentSrc ? (
        <Image
          src={currentSrc}
          alt={`${name} logo`}
          fill
          sizes="64px"
          className="object-cover"
          unoptimized={currentSrc.startsWith('http')}
          onError={() => setCurrentSrc(null)}
        />
      ) : (
        <span className="text-sm font-semibold text-muted-foreground">{getBrandInitial(name)}</span>
      )}
    </div>
  );
}

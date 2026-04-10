'use client';

import * as React from 'react';
import Image from 'next/image';

import { cn } from '@/lib/utils';

const FALLBACK_PRODUCT_IMAGE = '/no-imagen.png';

export function ProductImage({
  src,
  alt,
  className,
}: {
  src?: string | null;
  alt: string;
  className?: string;
}) {
  const normalizedSrc = src?.trim() || FALLBACK_PRODUCT_IMAGE;
  const [currentSrc, setCurrentSrc] = React.useState(normalizedSrc);

  React.useEffect(() => {
    setCurrentSrc(normalizedSrc);
  }, [normalizedSrc]);

  return (
    <div className={cn('relative overflow-hidden', className)}>
      <Image
        src={currentSrc}
        alt={alt}
        fill
        sizes="96px"
        className="object-cover"
        unoptimized={currentSrc.startsWith('http')}
        onError={() => {
          if (currentSrc !== FALLBACK_PRODUCT_IMAGE) {
            setCurrentSrc(FALLBACK_PRODUCT_IMAGE);
          }
        }}
      />
    </div>
  );
}

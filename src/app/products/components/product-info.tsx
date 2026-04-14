'use client';

import { useLocale, useTranslations } from 'next-intl';
import type { Products } from '@/server/db';
import { Badge } from '@/components/ui/badge';
import {
  DescriptionList,
  type DescriptionSection,
} from '@/components/description-list';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { ProductImage } from './product-image';
import { ProductLinkHealth } from './product-link-health';

export function ProductInfo({
  product,
  opened,
  onOpened,
}: {
  product: Products | undefined;
  opened: boolean;
  onOpened: (opened: boolean) => void;
}) {
  const t = useTranslations('products.info');
  const tp = useTranslations('products');
  const locale = useLocale();

  if (!product) return null;

  const linksCount = product.links?.length ?? 0;

  const sections: DescriptionSection[] = [
    {
      title: t('general'),
      columns: 1,
      items: [
        { label: t('name'), value: product.name },
        {
          label: t('description'),
          value: product.description || undefined,
        },
        {
          label: t('image'),
          value: (
            <div className="flex items-center gap-3">
              <ProductImage
                src={product.imageUrl}
                alt={product.name}
                className="h-12 w-12 rounded-md border object-cover"
              />
              {product.imageUrl ? (
                <a
                  href={product.imageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="truncate text-xs text-primary underline underline-offset-2"
                >
                  {product.imageUrl}
                </a>
              ) : (
                <span className="text-xs text-muted-foreground">{t('noImage')}</span>
              )}
            </div>
          ),
        },
      ],
    },
    {
      title: t('links'),
      columns: 1,
      items: [
        {
          label: t('affiliateLinks'),
          value: (
            <Badge variant={linksCount > 0 ? 'default' : 'outline'}>
              {tp('linksCount', { count: linksCount })}
            </Badge>
          ),
        },
        {
          label: t('linkHealth'),
          value: <ProductLinkHealth links={product.links} />,
        },
      ],
    },
    {
      title: t('activity'),
      columns: 2,
      items: [
        {
          label: t('created'),
          value: new Date(product.createdAt).toLocaleDateString(locale, {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
        },
        {
          label: t('updated'),
          value: product.updatedAt
            ? new Date(product.updatedAt).toLocaleDateString(locale, {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })
            : undefined,
        },
      ],
    },
  ];

  return (
    <Sheet open={opened} onOpenChange={onOpened}>
      <SheetContent className="overflow-y-auto sm:max-w-xl">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ProductImage
              src={product.imageUrl}
              alt={product.name}
              className="h-6 w-6 rounded-md border bg-muted/30"
            />
            {product.name}
          </SheetTitle>
          <SheetDescription>{t('title')}</SheetDescription>
        </SheetHeader>
        <div className="px-6 pb-2">
          <DescriptionList sections={sections} />
        </div>
      </SheetContent>
    </Sheet>
  );
}

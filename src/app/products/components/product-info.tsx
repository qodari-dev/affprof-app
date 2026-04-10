'use client';

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
  if (!product) return null;

  const linksCount = product.links?.length ?? 0;

  const sections: DescriptionSection[] = [
    {
      title: 'General',
      columns: 1,
      items: [
        { label: 'Name', value: product.name },
        {
          label: 'Description',
          value: product.description || undefined,
        },
        {
          label: 'Image',
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
                <span className="text-xs text-muted-foreground">No image uploaded</span>
              )}
            </div>
          ),
        },
      ],
    },
    {
      title: 'Links',
      columns: 1,
      items: [
        {
          label: 'Affiliate links',
          value: (
            <Badge variant={linksCount > 0 ? 'default' : 'outline'}>
              {linksCount} {linksCount === 1 ? 'link' : 'links'}
            </Badge>
          ),
        },
        {
          label: 'Link health',
          value: <ProductLinkHealth links={product.links} />,
        },
      ],
    },
    {
      title: 'Activity',
      columns: 2,
      items: [
        {
          label: 'Created',
          value: new Date(product.createdAt).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
        },
        {
          label: 'Updated',
          value: product.updatedAt
            ? new Date(product.updatedAt).toLocaleDateString('en-US', {
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
          <SheetDescription>Product details and linked affiliate links.</SheetDescription>
        </SheetHeader>
        <div className="px-6 pb-2">
          <DescriptionList sections={sections} />
        </div>
      </SheetContent>
    </Sheet>
  );
}

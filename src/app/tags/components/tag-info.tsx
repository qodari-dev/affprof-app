'use client';

import { useLocale, useTranslations } from 'next-intl';
import type { Tags } from '@/server/db';
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
import { TagBadge } from '@/components/tag-badge';
import { getTagSwatchStyle } from '@/utils/tag-color';

export function TagInfo({
  tag,
  opened,
  onOpened,
}: {
  tag: Tags | undefined;
  opened: boolean;
  onOpened: (opened: boolean) => void;
}) {
  const t = useTranslations('tags.info');
  const tt = useTranslations('tags');
  const locale = useLocale();

  if (!tag) return null;

  const linkedCount = tag.linkTags?.length ?? 0;

  const sections: DescriptionSection[] = [
    {
      title: t('general'),
      columns: 2,
      items: [
        { label: t('name'), value: tag.name },
        {
          label: t('color'),
          value: (
            <div className="flex items-center gap-2">
              <span className="inline-block h-4 w-4 rounded-full" style={getTagSwatchStyle(tag.color)} />
              <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{tag.color}</code>
            </div>
          ),
        },
      ],
    },
    {
      title: t('usage'),
      columns: 2,
      items: [
        {
          label: t('linkedProducts'),
          value: (
            <Badge variant={linkedCount > 0 ? 'default' : 'outline'}>
              {tt('linksCount', { count: linkedCount })}
            </Badge>
          ),
        },
      ],
    },
    {
      title: t('activity'),
      columns: 2,
      items: [
        {
          label: t('created'),
          value: new Date(tag.createdAt).toLocaleDateString(locale, {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
        },
        {
          label: t('updated'),
          value: tag.updatedAt
            ? new Date(tag.updatedAt).toLocaleDateString(locale, {
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
      <SheetContent className="overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <TagBadge name={tag.name} color={tag.color} className="gap-1.5 px-2.5 py-1 text-sm" />
          </SheetTitle>
          <SheetDescription>{t('sheetDescription')}</SheetDescription>
        </SheetHeader>
        <div className="px-6 pb-2">
          <DescriptionList sections={sections} columns={2} />
        </div>
      </SheetContent>
    </Sheet>
  );
}

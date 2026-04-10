'use client';

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
  if (!tag) return null;

  const linkedCount = tag.linkTags?.length ?? 0;

  const sections: DescriptionSection[] = [
    {
      title: 'General',
      columns: 2,
      items: [
        { label: 'Name', value: tag.name },
        {
          label: 'Color',
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
      title: 'Usage',
      columns: 2,
      items: [
        {
          label: 'Linked Products',
          value: (
            <Badge variant={linkedCount > 0 ? 'default' : 'outline'}>
              {linkedCount} {linkedCount === 1 ? 'link' : 'links'}
            </Badge>
          ),
        },
      ],
    },
    {
      title: 'Activity',
      columns: 2,
      items: [
        {
          label: 'Created',
          value: new Date(tag.createdAt).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
        },
        {
          label: 'Updated',
          value: tag.updatedAt
            ? new Date(tag.updatedAt).toLocaleDateString('en-US', {
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
          <SheetDescription>Tag details and usage information.</SheetDescription>
        </SheetHeader>
        <div className="px-6 pb-2">
          <DescriptionList sections={sections} columns={2} />
        </div>
      </SheetContent>
    </Sheet>
  );
}

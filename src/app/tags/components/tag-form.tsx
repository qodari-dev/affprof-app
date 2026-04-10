'use client';

import * as React from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Save } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldError, FieldLabel, FieldDescription } from '@/components/ui/field';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { CreateTagBodySchema } from '@/schemas/tag';
import { useCreateTag, useUpdateTag } from '@/hooks/queries/use-tag-queries';
import type { Tags } from '@/server/db';
import { TagBadge } from '@/components/tag-badge';
import { getTagSwatchStyle, isLightTagColor, TAG_COLOR_PALETTE } from '@/utils/tag-color';

// ============================================================================
// Types
// ============================================================================

type FormValues = z.infer<typeof CreateTagBodySchema>;

// ============================================================================
// Component
// ============================================================================

export function TagForm({
  tag,
  opened,
  onOpened,
}: {
  tag: Tags | undefined;
  opened: boolean;
  onOpened: (opened: boolean) => void;
}) {
  const isEditing = !!tag;

  const form = useForm<FormValues>({
    resolver: zodResolver(CreateTagBodySchema),
    defaultValues: {
      name: '',
      color: '#3B82F6',
    },
  });

  React.useEffect(() => {
    if (opened) {
      form.reset({
        name: tag?.name ?? '',
        color: tag?.color ?? '#3B82F6',
      });
    }
  }, [opened, tag, form]);

  const tagName = useWatch({
    control: form.control,
    name: 'name',
  });

  const { mutateAsync: create, isPending: isCreating } = useCreateTag();
  const { mutateAsync: update, isPending: isUpdating } = useUpdateTag();
  const isPending = isCreating || isUpdating;

  const onSubmit = async (values: FormValues) => {
    try {
      if (isEditing) {
        await update({ params: { id: tag.id }, body: values });
      } else {
        await create({ body: values });
      }
      onOpened(false);
    } catch {
      // Error handled by mutation onError
    }
  };

  return (
    <Sheet open={opened} onOpenChange={onOpened}>
      <SheetContent className="overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{isEditing ? 'Edit tag' : 'Create tag'}</SheetTitle>
          <SheetDescription>
            {isEditing
              ? 'Update the tag name and color.'
              : 'Create a new tag to organize your links and products.'}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-1 flex-col gap-6 px-6 pb-2">
          {/* Name */}
          <Controller
            name="name"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid || undefined}>
                <FieldLabel>Name</FieldLabel>
                <Input
                  placeholder="e.g. Tech, Fitness, Amazon"
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  autoFocus
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          {/* Color */}
          <Controller
            name="color"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid || undefined}>
                <FieldLabel>Color</FieldLabel>
                <div className="mb-3">
                  <TagBadge name={tagName || 'Preview'} color={field.value || '#3B82F6'} />
                </div>
                <div className="flex flex-wrap gap-2">
                  {TAG_COLOR_PALETTE.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      title={c.label}
                      onClick={() => field.onChange(c.value)}
                      className={`h-9 w-9 rounded-full border-2 transition-all ${
                        field.value === c.value
                          ? 'scale-110'
                          : 'border-transparent hover:scale-105 hover:border-muted-foreground/40'
                      }`}
                      style={{
                        ...getTagSwatchStyle(c.value),
                        borderColor:
                          field.value === c.value
                            ? isLightTagColor(c.value)
                              ? 'rgba(17, 24, 39, 0.9)'
                              : 'rgba(255, 255, 255, 0.9)'
                            : undefined,
                      }}
                    />
                  ))}
                </div>
                <FieldDescription>
                  Pick a color with automatic contrast for badges and filters.
                </FieldDescription>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </form>

        <SheetFooter>
          <Button variant="outline" className="min-w-32" onClick={() => onOpened(false)}>
            Cancel
          </Button>
          <Button
            type="submit"
            className="min-w-40"
            disabled={isPending}
            onClick={form.handleSubmit(onSubmit)}
          >
            {isPending ? <Loader2 className="animate-spin" /> : <Save />}
            {isEditing ? 'Save changes' : 'Create tag'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

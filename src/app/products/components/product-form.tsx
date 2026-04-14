'use client';

import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ImagePlus, Loader2, Save, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Field, FieldError, FieldLabel, FieldDescription } from '@/components/ui/field';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import {
  CreateProductBodySchema,
  PRODUCT_IMAGE_ALLOWED_TYPES,
  PRODUCT_IMAGE_MAX_BYTES,
} from '@/schemas/product';
import {
  useCreateProduct,
  usePresignProductImageUpload,
  useUpdateProduct,
} from '@/hooks/queries/use-product-queries';
import type { Products } from '@/server/db';
import { ProductImage } from './product-image';

// ============================================================================
// Types
// ============================================================================

type FormInputValues = z.input<typeof CreateProductBodySchema>;
type FormValues = z.output<typeof CreateProductBodySchema>;

// ============================================================================
// Component
// ============================================================================

export function ProductForm({
  product,
  opened,
  onOpened,
}: {
  product: Products | undefined;
  opened: boolean;
  onOpened: (opened: boolean) => void;
}) {
  const isEditing = !!product;
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const t = useTranslations('products.form');
  const tc = useTranslations('common');

  const form = useForm<FormInputValues, undefined, FormValues>({
    resolver: zodResolver(CreateProductBodySchema),
    defaultValues: {
      name: '',
      description: '',
      imageUrl: '',
    },
  });

  React.useEffect(() => {
    if (opened) {
      form.reset({
        name: product?.name ?? '',
        description: product?.description ?? '',
        imageUrl: product?.imageUrl ?? '',
      });
    }
  }, [opened, product, form]);

  const { mutateAsync: create, isPending: isCreating } = useCreateProduct();
  const { mutateAsync: update, isPending: isUpdating } = useUpdateProduct();
  const { mutateAsync: presignImageUpload, isPending: isPreparingImageUpload } =
    usePresignProductImageUpload();
  const [isUploadingImage, setIsUploadingImage] = React.useState(false);
  const isPending = isCreating || isUpdating;
  const imageUrl = form.watch('imageUrl') ?? '';

  const onSubmit = async (values: FormValues) => {
    // Clean empty strings to undefined
    const body = {
      ...values,
      description: values.description || undefined,
      imageUrl: values.imageUrl || undefined,
    };

    try {
      if (isEditing) {
        await update({ params: { id: product.id }, body });
      } else {
        await create({ body });
      }
      onOpened(false);
    } catch {
      // Error handled by mutation onError
    }
  };

  const handleImageUpload = React.useCallback(
    async (file: File) => {
      if (!PRODUCT_IMAGE_ALLOWED_TYPES.includes(file.type as (typeof PRODUCT_IMAGE_ALLOWED_TYPES)[number])) {
        toast.error(t('invalidFormat'));
        return;
      }

      if (file.size > PRODUCT_IMAGE_MAX_BYTES) {
        toast.error(t('imageTooLarge'), {
          description: t('imageSizeLimit'),
        });
        return;
      }

      setIsUploadingImage(true);

      try {
        const response = await presignImageUpload({
          body: {
            fileName: file.name,
            contentType: file.type as (typeof PRODUCT_IMAGE_ALLOWED_TYPES)[number],
            fileSize: file.size,
          },
        });

        const upload = await fetch(response.body.uploadUrl, {
          method: response.body.method,
          headers: {
            'Content-Type': file.type || 'application/octet-stream',
          },
          body: file,
        });

        if (!upload.ok) {
          throw new Error('Upload failed');
        }

        form.setValue('imageUrl', response.body.publicUrl, {
          shouldDirty: true,
          shouldValidate: true,
        });
        toast.success(t('imageUploaded'));
      } catch {
        toast.error(t('imageUploadError'));
      } finally {
        setIsUploadingImage(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    },
    [form, presignImageUpload, t],
  );

  return (
    <Sheet open={opened} onOpenChange={onOpened}>
      <SheetContent className="overflow-y-auto sm:max-w-xl lg:max-w-2xl">
        <SheetHeader>
          <SheetTitle>{isEditing ? t('editTitle') : t('createTitle')}</SheetTitle>
          <SheetDescription>
            {isEditing ? t('editDescription') : t('createDescription')}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-1 flex-col gap-6 px-6 pb-2">
          {/* Name */}
          <Controller
            name="name"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid || undefined}>
                <FieldLabel>{t('name')}</FieldLabel>
                <Input
                  placeholder={t('namePlaceholder')}
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  autoFocus
                />
                <FieldDescription>
                  {t('nameHelp')}
                </FieldDescription>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          {/* Description */}
          <Controller
            name="description"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid || undefined}>
                <FieldLabel>{t('description')}</FieldLabel>
                <Textarea
                  placeholder={t('descriptionPlaceholder')}
                  rows={3}
                  value={field.value ?? ''}
                  onChange={field.onChange}
                />
                <FieldDescription>
                  {t('descriptionHelp')}
                </FieldDescription>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Field>
            <FieldLabel>{t('image')}</FieldLabel>
            <div className="flex flex-col gap-4 rounded-xl border bg-muted/20 p-4">
              <div className="flex items-start gap-4">
                <ProductImage
                  src={imageUrl}
                  alt="Product preview"
                  className="h-24 w-24 rounded-lg border bg-muted/30 object-cover"
                />
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <p className="text-sm font-medium">
                    {imageUrl ? t('currentImage') : t('noImage')}
                  </p>
                  <p className="break-all text-xs text-muted-foreground">
                    {imageUrl || 'Fallback: /no-imagen.png'}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isPreparingImageUpload || isUploadingImage}
                    >
                      {isPreparingImageUpload || isUploadingImage ? (
                        <Loader2 className="animate-spin" />
                      ) : (
                        <ImagePlus />
                      )}
                      {imageUrl ? t('replaceImage') : t('uploadImage')}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        form.setValue('imageUrl', '', {
                          shouldDirty: true,
                          shouldValidate: true,
                        })
                      }
                      disabled={!imageUrl}
                    >
                      <Trash2 />
                      {t('removeImage')}
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {t('imageHelp')}
                  </p>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept={PRODUCT_IMAGE_ALLOWED_TYPES.join(',')}
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) {
                    void handleImageUpload(file);
                  }
                }}
              />
            </div>
          </Field>
        </form>

        <SheetFooter>
          <Button variant="outline" className="min-w-32" onClick={() => onOpened(false)}>
            {tc('cancel')}
          </Button>
          <Button
            type="submit"
            className="min-w-40"
            disabled={isPending}
            onClick={form.handleSubmit(onSubmit)}
          >
            {isPending ? <Loader2 className="animate-spin" /> : <Save />}
            {isEditing ? tc('save') : tc('create')}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

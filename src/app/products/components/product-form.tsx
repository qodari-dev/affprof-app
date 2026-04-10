'use client';

import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ImagePlus, Loader2, Save, Trash2 } from 'lucide-react';
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
        toast.error('Only JPG, PNG, and WEBP images are allowed');
        return;
      }

      if (file.size > PRODUCT_IMAGE_MAX_BYTES) {
        toast.error('Image is too large', {
          description: 'Please choose an image smaller than 4 MB.',
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
        toast.success('Product image uploaded');
      } catch {
        toast.error('Could not upload image');
      } finally {
        setIsUploadingImage(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    },
    [form, presignImageUpload],
  );

  return (
    <Sheet open={opened} onOpenChange={onOpened}>
      <SheetContent className="overflow-y-auto sm:max-w-xl lg:max-w-2xl">
        <SheetHeader>
          <SheetTitle>{isEditing ? 'Edit product' : 'Create product'}</SheetTitle>
          <SheetDescription>
            {isEditing
              ? 'Update the product details.'
              : 'Create a new product to group your affiliate links.'}
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
                  placeholder='e.g. "Blue Yeti Microphone"'
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  autoFocus
                />
                <FieldDescription>
                  The product or item you&apos;re promoting with affiliate links.
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
                <FieldLabel>Description</FieldLabel>
                <Textarea
                  placeholder="Optional short description..."
                  rows={3}
                  value={field.value ?? ''}
                  onChange={field.onChange}
                />
                <FieldDescription>
                  A brief note about this product (only visible to you).
                </FieldDescription>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Field>
            <FieldLabel>Product image</FieldLabel>
            <div className="flex flex-col gap-4 rounded-xl border bg-muted/20 p-4">
              <div className="flex items-start gap-4">
                <ProductImage
                  src={imageUrl}
                  alt="Product preview"
                  className="h-24 w-24 rounded-lg border bg-muted/30 object-cover"
                />
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <p className="text-sm font-medium">
                    {imageUrl ? 'Current image' : 'No image selected'}
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
                      {imageUrl ? 'Replace image' : 'Upload image'}
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
                      Remove
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Upload a JPG, PNG, or WEBP image up to 4 MB to store it in DigitalOcean Spaces.
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
            <FieldDescription>
              Images are uploaded directly to DigitalOcean Spaces. Manual URLs are disabled here.
            </FieldDescription>
          </Field>
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
            {isEditing ? 'Save changes' : 'Create product'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

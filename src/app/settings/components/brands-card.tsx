'use client';

import * as React from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  CheckCircle2,
  ImagePlus,
  Loader2,
  Palette,
  Pencil,
  Plus,
  Save,
  Star,
  Trash2,
} from 'lucide-react';

import { BrandLogo } from '@/components/brand-logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  BRAND_LOGO_ALLOWED_TYPES,
  BRAND_LOGO_MAX_BYTES,
  CreateBrandBodySchema,
} from '@/schemas/brand';
import {
  useBrands,
  useCreateBrand,
  useDeleteBrand,
  usePresignBrandLogoUpload,
  useSetDefaultBrand,
  useUpdateBrand,
} from '@/hooks/queries/use-brand-queries';
import type { Brands } from '@/server/db';
import { toast } from 'sonner';

type FormInputValues = z.input<typeof CreateBrandBodySchema>;
type FormValues = z.output<typeof CreateBrandBodySchema>;

function BrandColorField({
  label,
  description,
  value,
  onChange,
  invalid,
  errorMessage,
}: {
  label: string;
  description: string;
  value: string;
  onChange: (value: string) => void;
  invalid: boolean;
  errorMessage?: string;
}) {
  return (
    <Field data-invalid={invalid || undefined}>
      <FieldLabel>{label}</FieldLabel>
      <div className="flex items-center gap-3">
        <Input
          type="color"
          value={value}
          onChange={(event) => onChange(event.target.value.toUpperCase())}
          className="h-10 w-16 cursor-pointer rounded-lg p-1"
        />
        <Input
          value={value}
          onChange={(event) => onChange(event.target.value.toUpperCase())}
          placeholder="#111111"
          className="font-mono uppercase"
        />
      </div>
      <FieldDescription>{description}</FieldDescription>
      {invalid && errorMessage ? <FieldError errors={[{ message: errorMessage }]} /> : null}
    </Field>
  );
}

function BrandFormSheet({
  brand,
  opened,
  onOpened,
}: {
  brand?: Brands;
  opened: boolean;
  onOpened: (opened: boolean) => void;
}) {
  const isEditing = Boolean(brand);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const form = useForm<FormInputValues, undefined, FormValues>({
    resolver: zodResolver(CreateBrandBodySchema),
    defaultValues: {
      name: '',
      logoUrl: '',
      qrForeground: '#111111',
      qrBackground: '#FFFFFF',
      isDefault: false,
    },
  });

  React.useEffect(() => {
    if (opened) {
      form.reset({
        name: brand?.name ?? '',
        logoUrl: brand?.logoUrl ?? '',
        qrForeground: brand?.qrForeground ?? '#111111',
        qrBackground: brand?.qrBackground ?? '#FFFFFF',
        isDefault: brand?.isDefault ?? false,
      });
    }
  }, [brand, form, opened]);

  const brandName = useWatch({ control: form.control, name: 'name' }) ?? '';
  const logoUrl = useWatch({ control: form.control, name: 'logoUrl' }) ?? '';
  const qrForeground = useWatch({ control: form.control, name: 'qrForeground' }) ?? '#111111';
  const qrBackground = useWatch({ control: form.control, name: 'qrBackground' }) ?? '#FFFFFF';

  const { mutateAsync: createBrand, isPending: isCreating } = useCreateBrand();
  const { mutateAsync: updateBrand, isPending: isUpdating } = useUpdateBrand();
  const { mutateAsync: presignLogoUpload, isPending: isPreparingUpload } = usePresignBrandLogoUpload();
  const [isUploadingLogo, setIsUploadingLogo] = React.useState(false);
  const isPending = isCreating || isUpdating;

  const handleLogoUpload = React.useCallback(
    async (file: File) => {
      if (!BRAND_LOGO_ALLOWED_TYPES.includes(file.type as (typeof BRAND_LOGO_ALLOWED_TYPES)[number])) {
        toast.error('Only JPG, PNG, and WEBP images are allowed');
        return;
      }

      if (file.size > BRAND_LOGO_MAX_BYTES) {
        toast.error('Logo is too large', {
          description: 'Please choose an image smaller than 4 MB.',
        });
        return;
      }

      setIsUploadingLogo(true);

      try {
        const response = await presignLogoUpload({
          body: {
            fileName: file.name,
            contentType: file.type as (typeof BRAND_LOGO_ALLOWED_TYPES)[number],
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

        form.setValue('logoUrl', response.body.publicUrl, {
          shouldDirty: true,
          shouldValidate: true,
        });
        toast.success('Brand logo uploaded');
      } catch {
        toast.error('Could not upload brand logo');
      } finally {
        setIsUploadingLogo(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    },
    [form, presignLogoUpload],
  );

  const onSubmit = async (values: FormValues) => {
    const body = {
      ...values,
      logoUrl: values.logoUrl || undefined,
    };

    try {
      if (brand) {
        await updateBrand({
          params: { id: brand.id },
          body,
        });
      } else {
        await createBrand({ body });
      }

      onOpened(false);
    } catch {
      // handled by mutation
    }
  };

  return (
    <Sheet open={opened} onOpenChange={onOpened}>
      <SheetContent className="overflow-y-auto sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>{isEditing ? 'Edit brand' : 'Create brand'}</SheetTitle>
          <SheetDescription>
            Save reusable logos and QR colors so links can generate branded codes without duplicated uploads.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-1 flex-col gap-6 px-6 pb-2">
          <div className="rounded-2xl border bg-muted/20 p-4">
            <div className="flex items-center gap-4">
              <BrandLogo name={brandName || 'Brand'} logoUrl={logoUrl} className="size-16 rounded-2xl" />
              <div className="min-w-0 flex-1 space-y-2">
                <div>
                  <div className="font-medium">{brandName || 'Brand preview'}</div>
                  <div className="text-sm text-muted-foreground">
                    This style will appear in QR previews and downloads.
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="size-7 rounded-full border"
                    style={{ backgroundColor: qrForeground }}
                    aria-hidden="true"
                  />
                  <div
                    className="size-7 rounded-full border"
                    style={{ backgroundColor: qrBackground }}
                    aria-hidden="true"
                  />
                </div>
              </div>
            </div>
          </div>

          <Controller
            name="name"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid || undefined}>
                <FieldLabel>Name</FieldLabel>
                <Input
                  placeholder="e.g. AffProf, Carlos Media, Q4 Promo"
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  autoFocus
                />
                <FieldDescription>Use a short label that will be easy to recognize in the QR modal.</FieldDescription>
                {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
              </Field>
            )}
          />

          <Field>
            <FieldLabel>Logo</FieldLabel>
            <div className="flex flex-col gap-4 rounded-xl border bg-muted/20 p-4">
              <div className="flex items-start gap-4">
                <BrandLogo name={brandName || 'Brand'} logoUrl={logoUrl} className="size-20 rounded-2xl" />
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <p className="text-sm font-medium">{logoUrl ? 'Current logo' : 'No logo selected'}</p>
                  <p className="break-all text-xs text-muted-foreground">{logoUrl || 'QR will render without a center logo.'}</p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isPreparingUpload || isUploadingLogo}
                    >
                      {isPreparingUpload || isUploadingLogo ? (
                        <Loader2 className="animate-spin" />
                      ) : (
                        <ImagePlus />
                      )}
                      {logoUrl ? 'Replace logo' : 'Upload logo'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        form.setValue('logoUrl', '', {
                          shouldDirty: true,
                          shouldValidate: true,
                        })
                      }
                      disabled={!logoUrl}
                    >
                      <Trash2 />
                      Remove
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Upload a JPG, PNG, or WEBP image up to 4 MB to DigitalOcean Spaces.
                  </p>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept={BRAND_LOGO_ALLOWED_TYPES.join(',')}
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) {
                    void handleLogoUpload(file);
                  }
                }}
              />
            </div>
            <FieldDescription>
              The same uploaded asset can be reused across as many QR codes as needed.
            </FieldDescription>
          </Field>

          <Controller
            name="qrForeground"
            control={form.control}
            render={({ field, fieldState }) => (
              <BrandColorField
                label="QR foreground"
                description="Main QR color. Darker colors scan more reliably."
                value={field.value ?? '#111111'}
                onChange={field.onChange}
                invalid={fieldState.invalid}
                errorMessage={fieldState.error?.message}
              />
            )}
          />

          <Controller
            name="qrBackground"
            control={form.control}
            render={({ field, fieldState }) => (
              <BrandColorField
                label="QR background"
                description="Keep enough contrast against the foreground for reliable scans."
                value={field.value ?? '#FFFFFF'}
                onChange={field.onChange}
                invalid={fieldState.invalid}
                errorMessage={fieldState.error?.message}
              />
            )}
          />

          <Controller
            name="isDefault"
            control={form.control}
            render={({ field }) => (
              <Field orientation="horizontal">
                <Switch checked={field.value ?? false} onCheckedChange={field.onChange} />
                <div className="flex flex-col gap-0.5">
                  <FieldLabel>Default brand</FieldLabel>
                  <FieldDescription>
                    Preselect this brand when opening the QR dialog for new downloads.
                  </FieldDescription>
                </div>
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
            {isEditing ? 'Save changes' : 'Create brand'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function BrandListItem({
  brand,
  onEdit,
  onDelete,
  onSetDefault,
  deleting,
  settingDefault,
}: {
  brand: Brands;
  onEdit: (brand: Brands) => void;
  onDelete: (brand: Brands) => void;
  onSetDefault: (brand: Brands) => void;
  deleting: boolean;
  settingDefault: boolean;
}) {
  return (
    <div className="rounded-2xl border bg-muted/15 p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <BrandLogo name={brand.name} logoUrl={brand.logoUrl} className="size-14 rounded-2xl" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <div className="truncate font-medium">{brand.name}</div>
              {brand.isDefault ? (
                <div className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/20 dark:text-emerald-200">
                  <Star className="size-3" />
                  Default
                </div>
              ) : null}
            </div>
            <div className="mt-2 flex items-center gap-2">
              <div
                className="size-6 rounded-full border"
                style={{ backgroundColor: brand.qrForeground }}
                aria-hidden="true"
              />
              <div
                className="size-6 rounded-full border"
                style={{ backgroundColor: brand.qrBackground }}
                aria-hidden="true"
              />
              <span className="text-xs text-muted-foreground">
                {brand.qrForeground} / {brand.qrBackground}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {!brand.isDefault ? (
            <Button type="button" size="sm" variant="outline" onClick={() => onSetDefault(brand)} disabled={settingDefault}>
              {settingDefault ? <Loader2 className="animate-spin" /> : <CheckCircle2 />}
              Set default
            </Button>
          ) : null}
          <Button type="button" size="sm" variant="outline" onClick={() => onEdit(brand)}>
            <Pencil />
            Edit
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={() => onDelete(brand)} disabled={deleting}>
            {deleting ? <Loader2 className="animate-spin" /> : <Trash2 />}
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}

export function BrandsCard() {
  const { data, isLoading } = useBrands();
  const { mutateAsync: deleteBrand, isPending: isDeleting } = useDeleteBrand();
  const { mutateAsync: setDefaultBrand, isPending: isSettingDefault } = useSetDefaultBrand();
  const [formOpened, setFormOpened] = React.useState(false);
  const [editingBrand, setEditingBrand] = React.useState<Brands | undefined>(undefined);

  const brands = data?.status === 200 ? data.body : [];

  const handleCreate = React.useCallback(() => {
    setEditingBrand(undefined);
    setFormOpened(true);
  }, []);

  const handleEdit = React.useCallback((brand: Brands) => {
    setEditingBrand(brand);
    setFormOpened(true);
  }, []);

  const handleDelete = React.useCallback(
    async (brand: Brands) => {
      try {
        await deleteBrand({ params: { id: brand.id } });
      } catch {
        // handled by mutation
      }
    },
    [deleteBrand],
  );

  const handleSetDefault = React.useCallback(
    async (brand: Brands) => {
      try {
        await setDefaultBrand({
          params: { id: brand.id },
          body: {},
        });
      } catch {
        // handled by mutation
      }
    },
    [setDefaultBrand],
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Brands</CardTitle>
          <CardDescription>Reusable logos and QR styling presets.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Brands</CardTitle>
          <CardDescription>
            Save reusable logos and QR colors. The QR modal can then switch between brands without uploading assets again.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {brands.length === 0 ? (
            <div className="rounded-2xl border border-dashed bg-muted/20 p-6">
              <div className="flex items-start gap-4">
                <div className="flex size-12 items-center justify-center rounded-2xl border bg-background">
                  <Palette className="size-5 text-muted-foreground" />
                </div>
                <div className="space-y-1.5">
                  <div className="font-medium">No brands yet</div>
                  <p className="text-sm text-muted-foreground">
                    Add a brand once, upload its logo, and reuse that style across QR downloads.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            brands.map((brand) => (
              <BrandListItem
                key={brand.id}
                brand={brand}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onSetDefault={handleSetDefault}
                deleting={isDeleting}
                settingDefault={isSettingDefault}
              />
            ))
          )}
        </CardContent>
        <CardFooter className="border-t bg-muted/10">
          <Button type="button" onClick={handleCreate}>
            <Plus />
            Add brand
          </Button>
        </CardFooter>
      </Card>

      <BrandFormSheet
        brand={editingBrand}
        opened={formOpened}
        onOpened={(opened) => {
          setFormOpened(opened);
          if (!opened) {
            setEditingBrand(undefined);
          }
        }}
      />
    </>
  );
}

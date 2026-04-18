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
import { useTranslations } from 'next-intl';

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
import { useDeleteStorageFile } from '@/hooks/queries/use-storage-queries';
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
  const t = useTranslations('settings.brands.form');
  const isEditing = Boolean(brand);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const form = useForm<FormInputValues, undefined, FormValues>({
    resolver: zodResolver(CreateBrandBodySchema),
    defaultValues: {
      name: '',
      logoKey: '',
      qrForeground: '#111111',
      qrBackground: '#FFFFFF',
      isDefault: false,
    },
  });

  // previewUrl is only used for display — the form submits logoKey (the Spaces file key)
  const [previewUrl, setPreviewUrl] = React.useState('');
  // pendingKey tracks files uploaded in this session but not yet saved — so we can delete them if replaced/cancelled
  const pendingKeyRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (opened) {
      form.reset({
        name: brand?.name ?? '',
        logoKey: brand?.logoKey ?? '',
        qrForeground: brand?.qrForeground ?? '#111111',
        qrBackground: brand?.qrBackground ?? '#FFFFFF',
        isDefault: brand?.isDefault ?? false,
      });
      setPreviewUrl(brand?.logoUrl ?? '');
      pendingKeyRef.current = null;
    }
  }, [brand, form, opened]);

  const brandName = useWatch({ control: form.control, name: 'name' }) ?? '';
  const qrForeground = useWatch({ control: form.control, name: 'qrForeground' }) ?? '#111111';
  const qrBackground = useWatch({ control: form.control, name: 'qrBackground' }) ?? '#FFFFFF';

  const { mutateAsync: createBrand, isPending: isCreating } = useCreateBrand();
  const { mutateAsync: updateBrand, isPending: isUpdating } = useUpdateBrand();
  const { mutateAsync: presignLogoUpload, isPending: isPreparingUpload } = usePresignBrandLogoUpload();
  const { mutateAsync: deleteStorageFile } = useDeleteStorageFile();
  const [isUploadingLogo, setIsUploadingLogo] = React.useState(false);
  const isPending = isCreating || isUpdating;

  const handleLogoUpload = React.useCallback(
    async (file: File) => {
      if (!BRAND_LOGO_ALLOWED_TYPES.includes(file.type as (typeof BRAND_LOGO_ALLOWED_TYPES)[number])) {
        toast.error(t('toastInvalidFormat'));
        return;
      }

      if (file.size > BRAND_LOGO_MAX_BYTES) {
        toast.error(t('toastLogoTooLarge'), {
          description: t('toastLogoSizeLimit'),
        });
        return;
      }

      setIsUploadingLogo(true);

      try {
        const response = await presignLogoUpload({
          body: {
            contentType: file.type as (typeof BRAND_LOGO_ALLOWED_TYPES)[number],
            fileSize: file.size,
          },
        });

        const upload = await fetch(response.body.uploadUrl, {
          method: response.body.method,
          headers: response.body.uploadHeaders as Record<string, string>,
          body: file,
        });

        if (!upload.ok) {
          throw new Error('Upload failed');
        }

        // If there was a previous unsaved upload, delete it from Spaces
        if (pendingKeyRef.current) {
          void deleteStorageFile({ body: { fileKey: pendingKeyRef.current } });
        }

        form.setValue('logoKey', response.body.fileKey, {
          shouldDirty: true,
          shouldValidate: true,
        });
        setPreviewUrl(response.body.publicUrl);
        pendingKeyRef.current = response.body.fileKey;
        toast.success(t('toastUploaded'));
      } catch {
        toast.error(t('toastUploadError'));
      } finally {
        setIsUploadingLogo(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    },
    [form, presignLogoUpload, t, deleteStorageFile],
  );

  const onSubmit = async (values: FormValues) => {
    const body = {
      ...values,
      logoKey: values.logoKey || undefined,
    };

    try {
      if (brand) {
        await updateBrand({ params: { id: brand.id }, body });
      } else {
        await createBrand({ body });
      }

      // Saved successfully — the pending key is now in DB, don't delete it
      pendingKeyRef.current = null;
      onOpened(false);
    } catch {
      // handled by mutation
    }
  };

  const handleClose = (open: boolean) => {
    // If closing without saving and there's a pending unsaved upload, delete it
    if (!open && pendingKeyRef.current) {
      void deleteStorageFile({ body: { fileKey: pendingKeyRef.current } });
      pendingKeyRef.current = null;
    }
    onOpened(open);
  };

  return (
    <Sheet open={opened} onOpenChange={handleClose}>
      <SheetContent className="overflow-y-auto sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>{isEditing ? t('editTitle') : t('createTitle')}</SheetTitle>
          <SheetDescription>{t('description')}</SheetDescription>
        </SheetHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-1 flex-col gap-6 px-6 pb-2">
          <div className="rounded-2xl border bg-muted/20 p-4">
            <div className="flex items-center gap-4">
              <BrandLogo name={brandName || t('brandFallback')} logoUrl={previewUrl} className="size-16 rounded-2xl" />
              <div className="min-w-0 flex-1 space-y-2">
                <div>
                  <div className="font-medium">{brandName || t('brandPreview')}</div>
                  <div className="text-sm text-muted-foreground">
                    {t('brandPreviewHelp')}
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
                <FieldLabel>{t('name')}</FieldLabel>
                <Input
                  placeholder={t('namePlaceholder')}
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  autoFocus
                />
                <FieldDescription>{t('nameHelp')}</FieldDescription>
                {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
              </Field>
            )}
          />

          <Field>
            <FieldLabel>{t('logo')}</FieldLabel>
            <div className="flex flex-col gap-4 rounded-xl border bg-muted/20 p-4">
              <div className="flex items-start gap-4">
                <BrandLogo name={brandName || t('brandFallback')} logoUrl={previewUrl} className="size-20 rounded-2xl" />
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <p className="text-sm font-medium">{previewUrl ? t('currentLogo') : t('noLogo')}</p>
                  <p className="break-all text-xs text-muted-foreground">{previewUrl || t('noLogoHelp')}</p>
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
                      {previewUrl ? t('replaceLogo') : t('uploadLogo')}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        // Delete from Spaces if it's an unsaved upload
                        if (pendingKeyRef.current) {
                          void deleteStorageFile({ body: { fileKey: pendingKeyRef.current } });
                          pendingKeyRef.current = null;
                        }
                        form.setValue('logoKey', '', { shouldDirty: true, shouldValidate: true });
                        setPreviewUrl('');
                      }}
                      disabled={!previewUrl}
                    >
                      <Trash2 />
                      {t('remove')}
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {t('logoUploadHelp')}
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
              {t('logoReuse')}
            </FieldDescription>
          </Field>

          <Controller
            name="qrForeground"
            control={form.control}
            render={({ field, fieldState }) => (
              <BrandColorField
                label={t('qrForeground')}
                description={t('qrForegroundHelp')}
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
                label={t('qrBackground')}
                description={t('qrBackgroundHelp')}
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
                  <FieldLabel>{t('defaultBrand')}</FieldLabel>
                  <FieldDescription>
                    {t('defaultBrandHelp')}
                  </FieldDescription>
                </div>
              </Field>
            )}
          />
        </form>

        <SheetFooter>
          <Button variant="outline" className="min-w-32" onClick={() => handleClose(false)}>
            {t('cancel')}
          </Button>
          <Button
            type="submit"
            className="min-w-40"
            disabled={isPending}
            onClick={form.handleSubmit(onSubmit)}
          >
            {isPending ? <Loader2 className="animate-spin" /> : <Save />}
            {isEditing ? t('saveChanges') : t('createBrand')}
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
  const t = useTranslations('settings.brands');
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
                  {t('default')}
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
              {t('setDefault')}
            </Button>
          ) : null}
          <Button type="button" size="sm" variant="outline" onClick={() => onEdit(brand)}>
            <Pencil />
            {t('edit')}
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={() => onDelete(brand)} disabled={deleting}>
            {deleting ? <Loader2 className="animate-spin" /> : <Trash2 />}
            {t('delete')}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function BrandsCard() {
  const t = useTranslations('settings.brands');
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
          <CardTitle>{t('title')}</CardTitle>
          <CardDescription>{t('loadingDescription')}</CardDescription>
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
          <CardTitle>{t('title')}</CardTitle>
          <CardDescription>
            {t('description')}
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
                  <div className="font-medium">{t('empty')}</div>
                  <p className="text-sm text-muted-foreground">
                    {t('emptyDescription')}
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
            {t('addBrand')}
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

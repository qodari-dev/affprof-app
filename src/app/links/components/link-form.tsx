'use client';

import * as React from 'react';
import Image from 'next/image';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Check, ChevronsUpDown, Loader2, Save, Sparkles } from 'lucide-react';

import { BrandLogo } from '@/components/brand-logo';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
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
import { useCreateLink, useUpdateLink } from '@/hooks/queries/use-link-queries';
import { useProducts } from '@/hooks/queries/use-product-queries';
import { useTags } from '@/hooks/queries/use-tag-queries';
import { useProfile } from '@/hooks/queries/use-profile-queries';
import {
  getPrimaryVerifiedCustomDomainHostname,
  useCustomDomains,
} from '@/hooks/queries/use-custom-domain-queries';
import { getDefaultBrandId, useBrands } from '@/hooks/queries/use-brand-queries';
import { cn } from '@/lib/utils';
import type { Links } from '@/server/db';
import { TagBadge } from '@/components/tag-badge';
import { buildShortLinkPattern } from '@/utils/short-link';
import {
  buildTrackedDestinationUrl,
  parseTrackedDestinationUrl,
} from '@/utils/tracked-destination-url';

// ============================================================================
// Types
// ============================================================================

const LinkFormSchema = z.object({
  productId: z.string().uuid({ message: 'Please select a product' }),
  brandId: z.union([z.literal(''), z.string().uuid()]).optional(),
  baseUrl: z.string().url().max(2048),
  fallbackUrl: z.union([z.literal(''), z.string().url().max(2048)]).optional(),
  utmSource: z.union([z.literal(''), z.string().max(255)]).optional(),
  utmMedium: z.union([z.literal(''), z.string().max(255)]).optional(),
  utmCampaign: z.union([z.literal(''), z.string().max(255)]).optional(),
  utmContent: z.union([z.literal(''), z.string().max(255)]).optional(),
  utmTerm: z.union([z.literal(''), z.string().max(255)]).optional(),
  platform: z.string().min(1, 'Platform is required').max(50),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, {
    message: 'Slug must contain only lowercase letters, numbers, and hyphens',
  }),
  isEnabled: z.boolean().default(true),
  notes: z.string().max(500).optional(),
});

type FormInputValues = z.input<typeof LinkFormSchema>;
type FormValues = z.output<typeof LinkFormSchema>;

// ============================================================================
// Helpers
// ============================================================================

function toSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function compareTagsByName(a: { name: string }, b: { name: string }) {
  return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
}

function ProductOptionPreview({
  name,
  description,
  imageUrl,
  compact = false,
}: {
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  compact?: boolean;
}) {
  const [imageFailed, setImageFailed] = React.useState(false);
  const imageSrc = imageUrl && !imageFailed ? imageUrl : '/no-imagen.png';

  return (
    <div className="flex min-w-0 items-center gap-3">
      <div
        className={cn(
          'relative shrink-0 overflow-hidden rounded-md border bg-muted/30',
          compact ? 'h-8 w-8' : 'h-10 w-10',
        )}
      >
        <Image
          src={imageSrc}
          alt={name}
          fill
          sizes={compact ? '32px' : '40px'}
          className="object-cover"
          unoptimized={imageSrc.startsWith('http')}
          onError={() => setImageFailed(true)}
        />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{name}</p>
        {!compact && description ? (
          <p className="truncate text-xs text-muted-foreground">{description}</p>
        ) : null}
      </div>
    </div>
  );
}

// ============================================================================
// Component
// ============================================================================

export function LinkForm({
  link,
  opened,
  onOpened,
}: {
  link: Links | undefined;
  opened: boolean;
  onOpened: (opened: boolean) => void;
}) {
  const isEditing = !!link;
  const [productPickerOpen, setProductPickerOpen] = React.useState(false);

  // Fetch data for selectors
  const { data: productsData } = useProducts({ page: 1, limit: 100 });
  const productList = productsData?.body?.data;
  const products = React.useMemo(() => productList ?? [], [productList]);

  const { data: tagsData } = useTags({ page: 1, limit: 100 });
  const tagList = tagsData?.body?.data;
  const allTags = React.useMemo(() => tagList ?? [], [tagList]);
  const { data: brandsData } = useBrands();
  const brands = React.useMemo(
    () => (brandsData?.status === 200 ? brandsData.body : []),
    [brandsData],
  );

  const { data: profileData } = useProfile();
  const { data: customDomainsData } = useCustomDomains();
  const userSlug = profileData?.status === 200 ? profileData.body.slug : 'your-account';
  const primaryCustomDomain = customDomainsData?.status === 200
    ? getPrimaryVerifiedCustomDomainHostname(customDomainsData.body)
    : null;

  // Selected tags (managed outside form since it's a separate API)
  const [selectedTagIds, setSelectedTagIds] = React.useState<string[]>([]);

  // Track if slug was manually edited
  const [slugManuallyEdited, setSlugManuallyEdited] = React.useState(false);

  const form = useForm<FormInputValues, undefined, FormValues>({
    resolver: zodResolver(LinkFormSchema),
    defaultValues: {
      productId: '',
      brandId: '',
      baseUrl: '',
      fallbackUrl: '',
      utmSource: '',
      utmMedium: '',
      utmCampaign: '',
      utmContent: '',
      utmTerm: '',
      platform: '',
      slug: '',
      isEnabled: true,
      notes: '',
    },
  });

  React.useEffect(() => {
    if (opened) {
      const parsedDestination = link
        ? parseTrackedDestinationUrl(link.baseUrl || link.originalUrl)
        : null;

      form.reset({
        productId: link?.productId ?? '',
        brandId: link?.brandId ?? '',
        baseUrl: parsedDestination?.baseUrl ?? '',
        fallbackUrl: link?.fallbackUrl ?? '',
        utmSource: link?.utmSource ?? parsedDestination?.utmSource ?? '',
        utmMedium: link?.utmMedium ?? parsedDestination?.utmMedium ?? '',
        utmCampaign: link?.utmCampaign ?? parsedDestination?.utmCampaign ?? '',
        utmContent: link?.utmContent ?? parsedDestination?.utmContent ?? '',
        utmTerm: link?.utmTerm ?? parsedDestination?.utmTerm ?? '',
        platform: link?.platform ?? '',
        slug: link?.slug ?? '',
        isEnabled: link?.isEnabled ?? true,
        notes: link?.notes ?? '',
      });
      setSelectedTagIds(link?.linkTags?.map((lt) => lt.tagId) ?? []);
      setSlugManuallyEdited(isEditing);
    }
  }, [opened, link, form, isEditing]);

  React.useEffect(() => {
    if (!opened || isEditing) return;

    const currentBrandId = form.getValues('brandId');
    if (currentBrandId) return;

    const defaultBrandId = getDefaultBrandId(brands);
    if (defaultBrandId) {
      form.setValue('brandId', defaultBrandId, { shouldDirty: false });
    }
  }, [opened, isEditing, form, brands]);

  const { mutateAsync: create, isPending: isCreating } = useCreateLink();
  const { mutateAsync: update, isPending: isUpdating } = useUpdateLink();
  const isPending = isCreating || isUpdating;
  const selectedProductId = useWatch({
    control: form.control,
    name: 'productId',
  });
  const selectedBrandId = useWatch({
    control: form.control,
    name: 'brandId',
  });
  const baseUrl = useWatch({
    control: form.control,
    name: 'baseUrl',
  });
  const utmSource = useWatch({
    control: form.control,
    name: 'utmSource',
  });
  const utmMedium = useWatch({
    control: form.control,
    name: 'utmMedium',
  });
  const utmCampaign = useWatch({
    control: form.control,
    name: 'utmCampaign',
  });
  const utmContent = useWatch({
    control: form.control,
    name: 'utmContent',
  });
  const utmTerm = useWatch({
    control: form.control,
    name: 'utmTerm',
  });
  const selectedProduct = products.find((product) => product.id === selectedProductId);
  const selectedBrand = brands.find((brand) => brand.id === selectedBrandId);
  const selectedTags = allTags
    .filter((tag) => selectedTagIds.includes(tag.id))
    .sort(compareTagsByName);
  const availableTags = allTags
    .filter((tag) => !selectedTagIds.includes(tag.id))
    .sort(compareTagsByName);

  // Auto-suggest slug from product + platform
  const handleSuggestSlug = React.useCallback(() => {
    const productId = form.getValues('productId');
    const platform = form.getValues('platform');
    const product = products.find((p) => p.id === productId);

    if (product) {
      const parts = [product.name, platform].filter(Boolean);
      const suggested = toSlug(parts.join(' '));
      if (suggested) {
        form.setValue('slug', suggested, { shouldValidate: true });
      }
    }
  }, [form, products]);

  const handleNormalizeBaseUrl = React.useCallback(() => {
    const value = form.getValues('baseUrl');
    if (!value) return;

    try {
      const parsed = parseTrackedDestinationUrl(value);
      form.setValue('baseUrl', parsed.baseUrl, { shouldValidate: true });

      if (parsed.utmSource) form.setValue('utmSource', parsed.utmSource, { shouldValidate: false });
      if (parsed.utmMedium) form.setValue('utmMedium', parsed.utmMedium, { shouldValidate: false });
      if (parsed.utmCampaign) form.setValue('utmCampaign', parsed.utmCampaign, { shouldValidate: false });
      if (parsed.utmContent) form.setValue('utmContent', parsed.utmContent, { shouldValidate: false });
      if (parsed.utmTerm) form.setValue('utmTerm', parsed.utmTerm, { shouldValidate: false });
    } catch {
      // Zod validation handles invalid URLs.
    }
  }, [form]);

  const finalDestinationUrl = React.useMemo(() => {
    if (!baseUrl) return '';

    try {
      return buildTrackedDestinationUrl(baseUrl, {
        utmSource,
        utmMedium,
        utmCampaign,
        utmContent,
        utmTerm,
      });
    } catch {
      return '';
    }
  }, [baseUrl, utmCampaign, utmContent, utmMedium, utmSource, utmTerm]);

  const onSubmit = async (values: FormValues) => {
    try {
      if (isEditing) {
        await update({
          params: { id: link.id },
          body: {
            brandId: values.brandId || null,
            baseUrl: values.baseUrl,
            fallbackUrl: values.fallbackUrl || null,
            utmSource: values.utmSource || null,
            utmMedium: values.utmMedium || null,
            utmCampaign: values.utmCampaign || null,
            utmContent: values.utmContent || null,
            utmTerm: values.utmTerm || null,
            slug: values.slug,
            platform: values.platform,
            isEnabled: values.isEnabled,
            notes: values.notes || undefined,
            tagIds: selectedTagIds,
          },
        });
      } else {
        await create({
          body: {
            productId: values.productId,
            brandId: values.brandId || undefined,
            baseUrl: values.baseUrl,
            fallbackUrl: values.fallbackUrl || undefined,
            utmSource: values.utmSource || undefined,
            utmMedium: values.utmMedium || undefined,
            utmCampaign: values.utmCampaign || undefined,
            utmContent: values.utmContent || undefined,
            utmTerm: values.utmTerm || undefined,
            slug: values.slug,
            platform: values.platform,
            notes: values.notes || undefined,
            tagIds: selectedTagIds.length > 0 ? selectedTagIds : undefined,
          },
        });
      }
      onOpened(false);
    } catch {
      // Error handled by mutation onError
    }
  };

  const toggleTag = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId],
    );
  };

  return (
    <Sheet open={opened} onOpenChange={onOpened}>
      <SheetContent className="overflow-y-auto sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>{isEditing ? 'Edit link' : 'Create link'}</SheetTitle>
          <SheetDescription>
            {isEditing
              ? 'Update the affiliate link details.'
              : 'Add a new affiliate link to track clicks and monitor status.'}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-1 flex-col gap-6 px-6 pb-2">
          {/* Product */}
          <Controller
            name="productId"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid || undefined}>
                <FieldLabel>Product</FieldLabel>
                {isEditing ? (
                  <div className="flex min-h-12 items-center rounded-lg border border-input bg-muted/20 px-3 py-2">
                    {selectedProduct ? (
                      <ProductOptionPreview
                        name={selectedProduct.name}
                        description={selectedProduct.description}
                        imageUrl={selectedProduct.imageUrl}
                      />
                    ) : (
                      <span className="text-sm text-muted-foreground">Product locked for this link</span>
                    )}
                  </div>
                ) : (
                  <Popover open={productPickerOpen} onOpenChange={setProductPickerOpen}>
                    <PopoverTrigger
                      render={
                        <Button
                          type="button"
                          variant="outline"
                          role="combobox"
                          aria-expanded={productPickerOpen}
                          className={cn(
                            'h-auto min-h-12 w-full justify-between rounded-lg px-3 py-2',
                            !selectedProduct && 'text-muted-foreground',
                          )}
                        >
                          {selectedProduct ? (
                            <ProductOptionPreview
                              name={selectedProduct.name}
                              description={selectedProduct.description}
                              imageUrl={selectedProduct.imageUrl}
                              compact
                            />
                          ) : (
                            <span className="text-sm">Select a product...</span>
                          )}
                          <ChevronsUpDown className="ml-3 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      }
                    />
                    <PopoverContent className="w-[420px] max-w-[calc(100vw-2rem)] p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Search products..." />
                        <CommandList>
                          <CommandEmpty>No products found.</CommandEmpty>
                          <CommandGroup>
                            {products.map((product) => {
                              const isSelected = field.value === product.id;

                              return (
                                <CommandItem
                                  key={product.id}
                                  value={`${product.name} ${product.description ?? ''}`}
                                  onSelect={() => {
                                    field.onChange(product.id);
                                    setProductPickerOpen(false);
                                  }}
                                  className="gap-3 rounded-md px-3 py-2"
                                >
                                  <ProductOptionPreview
                                    name={product.name}
                                    description={product.description}
                                    imageUrl={product.imageUrl}
                                  />
                                  <Check className={cn('ml-2 h-4 w-4 shrink-0', isSelected ? 'opacity-100' : 'opacity-0')} />
                                </CommandItem>
                              );
                            })}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                )}
                <FieldDescription>
                  The product this affiliate link belongs to.
                </FieldDescription>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          {/* Base URL */}
          <Controller
            name="baseUrl"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid || undefined}>
                <FieldLabel>Base URL</FieldLabel>
                <Input
                  placeholder="https://www.amazon.com/dp/B08N5..."
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={handleNormalizeBaseUrl}
                />
                <FieldDescription>
                  Paste the destination URL. If it already includes UTM parameters, AffProf will extract them automatically.
                </FieldDescription>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          {/* UTM Builder */}
          <div className="rounded-xl border bg-muted/15 p-4">
            <div className="mb-4 space-y-1">
              <p className="text-sm font-medium">UTM tracking</p>
              <p className="text-xs text-muted-foreground">
                Build a consistent tracked destination URL for campaigns, channels, and placements.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Controller
                name="utmSource"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid || undefined}>
                    <FieldLabel>UTM Source</FieldLabel>
                    <Input placeholder="instagram" value={field.value ?? ''} onChange={field.onChange} />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <Controller
                name="utmMedium"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid || undefined}>
                    <FieldLabel>UTM Medium</FieldLabel>
                    <Input placeholder="bio" value={field.value ?? ''} onChange={field.onChange} />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <Controller
                name="utmCampaign"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid || undefined}>
                    <FieldLabel>UTM Campaign</FieldLabel>
                    <Input placeholder="spring-launch" value={field.value ?? ''} onChange={field.onChange} />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <Controller
                name="utmContent"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid || undefined}>
                    <FieldLabel>UTM Content</FieldLabel>
                    <Input placeholder="hero-button" value={field.value ?? ''} onChange={field.onChange} />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <Controller
                name="utmTerm"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field className="md:col-span-2" data-invalid={fieldState.invalid || undefined}>
                    <FieldLabel>UTM Term</FieldLabel>
                    <Input placeholder="creator-tools" value={field.value ?? ''} onChange={field.onChange} />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </div>

            <div className="mt-4 rounded-lg border bg-background p-3">
              <div className="mb-1 text-xs font-medium tracking-[0.08em] text-muted-foreground uppercase">
                Final destination URL
              </div>
              <Textarea
                value={finalDestinationUrl}
                readOnly
                className="min-h-[92px] resize-none bg-muted/20"
              />
              <p className="mt-2 text-xs text-muted-foreground">
                AffProf rebuilds and saves this final URL on the backend to keep the destination and UTM fields in sync.
              </p>
            </div>
          </div>

          {/* QR Brand */}
          <Controller
            name="brandId"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid || undefined}>
                <FieldLabel>QR brand</FieldLabel>
                <select
                  className="flex h-10 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30"
                  value={field.value ?? ''}
                  onChange={field.onChange}
                >
                  <option value="">Standard AffProf QR</option>
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                      {brand.isDefault ? ' (Default)' : ''}
                    </option>
                  ))}
                </select>
                <FieldDescription>
                  Pick a saved brand to prefill this link&apos;s QR logo and color style.
                </FieldDescription>
                {selectedBrand ? (
                  <div className="mt-3 flex items-center gap-3 rounded-xl border bg-muted/15 p-3">
                    <BrandLogo name={selectedBrand.name} logoUrl={selectedBrand.logoUrl} className="size-10 rounded-xl" />
                    <div className="min-w-0 flex-1">
                      <div className="font-medium">{selectedBrand.name}</div>
                      <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                        <div
                          className="size-4 rounded-full border"
                          style={{ backgroundColor: selectedBrand.qrForeground }}
                          aria-hidden="true"
                        />
                        <div
                          className="size-4 rounded-full border"
                          style={{ backgroundColor: selectedBrand.qrBackground }}
                          aria-hidden="true"
                        />
                        <span className="truncate">
                          {selectedBrand.qrForeground} / {selectedBrand.qrBackground}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : null}
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          {/* Fallback URL */}
          <Controller
            name="fallbackUrl"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid || undefined}>
                <FieldLabel>Fallback URL</FieldLabel>
                <Input
                  placeholder="https://yourbrand.com/backup-page"
                  value={field.value ?? ''}
                  onChange={field.onChange}
                />
                <FieldDescription>
                  If this link is disabled or currently marked broken, visitors will be redirected here instead.
                </FieldDescription>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          {/* Platform */}
          <Controller
            name="platform"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid || undefined}>
                <FieldLabel>Platform</FieldLabel>
                <Input
                  placeholder="e.g. amazon, shareasale, impact, rakuten..."
                  value={field.value}
                  onChange={field.onChange}
                />
                <FieldDescription>
                  The affiliate network or marketplace for this link.
                </FieldDescription>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          {/* Slug */}
          <Controller
            name="slug"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid || undefined}>
                <FieldLabel>Slug</FieldLabel>
                <div className="flex gap-2">
                  <Input
                    placeholder="blue-yeti-amazon"
                    value={field.value}
                    onChange={(e) => {
                      field.onChange(e);
                      setSlugManuallyEdited(true);
                    }}
                    className="flex-1"
                  />
                  {!slugManuallyEdited && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="shrink-0"
                      onClick={handleSuggestSlug}
                      disabled={!selectedProductId}
                    >
                      <Sparkles className="mr-1 h-3 w-3" />
                      Suggest
                    </Button>
                  )}
                </div>
                <FieldDescription>
                  Short link: <strong>{buildShortLinkPattern(userSlug, field.value || 'slug', primaryCustomDomain)}</strong>
                </FieldDescription>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          {/* Availability */}
          <Controller
            name="isEnabled"
            control={form.control}
            render={({ field }) => (
              <Field>
                <div className="flex items-start justify-between gap-4 rounded-lg border bg-muted/20 px-4 py-3">
                  <div className="space-y-1">
                    <FieldLabel>Link availability</FieldLabel>
                    <FieldDescription>
                      {field.value
                        ? 'This short link is active and can redirect visitors.'
                        : 'This short link is disabled and will return not found.'}
                    </FieldDescription>
                  </div>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    aria-label="Toggle link availability"
                  />
                </div>
              </Field>
            )}
          />

          {/* Tags */}
          <Field>
            <FieldLabel>Tags</FieldLabel>
            {allTags.length > 0 ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-xs font-medium tracking-[0.08em] text-muted-foreground uppercase">
                    Selected tags
                  </p>
                  {selectedTags.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {selectedTags.map((tag) => (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() => toggleTag(tag.id)}
                          className="rounded-full transition-all"
                          aria-pressed
                        >
                          <TagBadge
                            name={tag.name}
                            color={tag.color}
                            className="gap-1.5 px-2.5 py-1 text-xs ring-2 ring-primary/25 ring-offset-2 ring-offset-background"
                          />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No tags selected yet.
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-medium tracking-[0.08em] text-muted-foreground uppercase">
                    Available tags
                  </p>
                  {availableTags.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {availableTags.map((tag) => (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() => toggleTag(tag.id)}
                          className="rounded-full opacity-80 transition-all hover:opacity-100"
                        >
                          <TagBadge
                            name={tag.name}
                            color={tag.color}
                            className="gap-1.5 px-2.5 py-1 text-xs border-border/60"
                          />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      All tags are already selected.
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No tags created yet. Create tags first to organize your links.
              </p>
            )}
            <FieldDescription>
              Select tags to categorize this link.
            </FieldDescription>
          </Field>

          {/* Notes */}
          <Controller
            name="notes"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid || undefined}>
                <FieldLabel>Notes</FieldLabel>
                <Textarea
                  placeholder="Optional notes..."
                  rows={2}
                  value={field.value ?? ''}
                  onChange={field.onChange}
                />
                <FieldDescription>
                  Internal notes (only visible to you).
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
            {isEditing ? 'Save changes' : 'Create link'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

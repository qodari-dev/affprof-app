'use client';

import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field';
import { Skeleton } from '@/components/ui/skeleton';
import { UpdateProfileBodySchema } from '@/schemas/profile';
import { useProfile, useUpdateProfile } from '@/hooks/queries/use-profile-queries';
import { buildShortLinkPattern } from '@/utils/short-link';

type FormValues = z.infer<typeof UpdateProfileBodySchema>;

const COMMON_TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Bogota',
  'America/Sao_Paulo',
  'America/Buenos_Aires',
  'America/Mexico_City',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Europe/Madrid',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Kolkata',
  'Asia/Dubai',
  'Australia/Sydney',
  'Pacific/Auckland',
];

export function ProfileCard() {
  const { data: profileData, isLoading } = useProfile();
  const { mutateAsync: updateProfile, isPending: isSaving } = useUpdateProfile();
  const [isFormReady, setIsFormReady] = React.useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(UpdateProfileBodySchema),
    defaultValues: {
      name: '',
      slug: '',
      timezone: 'UTC',
    },
  });

  React.useEffect(() => {
    if (profileData?.status === 200 && profileData.body) {
      const u = profileData.body;
      form.reset({
        name: u.name ?? '',
        slug: u.slug ?? '',
        timezone: u.timezone ?? 'UTC',
      });
      setIsFormReady(true);
    }
  }, [profileData, form]);

  const onSubmit = React.useCallback(
    async (values: FormValues) => {
      try {
        const result = await updateProfile({ body: values });
        if (result.status === 200) {
          toast.success('Profile updated successfully');
        }
      } catch {
        // Error handled by mutation onError
      }
    },
    [updateProfile]
  );

  if (isLoading || !isFormReady) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Your personal information and short link slug.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          {Array(3)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Your personal information and short link slug.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          {/* Name */}
          <Controller
            name="name"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid || undefined}>
                <FieldLabel>Name</FieldLabel>
                <Input
                  placeholder="Your name"
                  value={field.value ?? ''}
                  onChange={field.onChange}
                />
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
                <FieldLabel>Short link slug</FieldLabel>
                <Input
                  placeholder="my-brand"
                  value={field.value ?? ''}
                  onChange={field.onChange}
                />
                <FieldDescription>
                  Your short links will be: <strong>{buildShortLinkPattern(field.value || 'my-brand')}</strong>
                </FieldDescription>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          {/* Timezone */}
          <Controller
            name="timezone"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid || undefined}>
                <FieldLabel>Timezone</FieldLabel>
                <select
                  className="flex h-10 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30"
                  value={field.value ?? 'UTC'}
                  onChange={field.onChange}
                >
                  {COMMON_TIMEZONES.map((tz) => (
                    <option key={tz} value={tz}>
                      {tz.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
                <FieldDescription>
                  Used for analytics and digest email scheduling.
                </FieldDescription>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button type="submit" size="sm" disabled={isSaving}>
            {isSaving ? <Loader2 className="animate-spin" /> : <Save />}
            Save profile
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}

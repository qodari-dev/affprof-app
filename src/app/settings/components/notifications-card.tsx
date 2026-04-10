'use client';

import * as React from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field';
import { Skeleton } from '@/components/ui/skeleton';
import { UpdateUserSettingsBodySchema } from '@/schemas/user-settings';
import { useUserSettings, useUpdateUserSettings } from '@/hooks/queries/use-user-settings-queries';

type FormValues = z.infer<typeof UpdateUserSettingsBodySchema>;

const WEEKDAYS = [
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' },
] as const;

export function NotificationsCard() {
  const { data: settingsData, isLoading } = useUserSettings();
  const { mutateAsync: updateSettings, isPending: isSaving } = useUpdateUserSettings();
  const [isFormReady, setIsFormReady] = React.useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(UpdateUserSettingsBodySchema),
    defaultValues: {
      emailOnBrokenLink: true,
      weeklyDigest: true,
      digestDay: 'monday',
      ccEmail: null,
    },
  });

  React.useEffect(() => {
    if (settingsData?.status === 200 && settingsData.body) {
      const s = settingsData.body;
      form.reset({
        emailOnBrokenLink: s.emailOnBrokenLink ?? true,
        weeklyDigest: s.weeklyDigest ?? true,
        digestDay: (s.digestDay as FormValues['digestDay']) ?? 'monday',
        ccEmail: s.ccEmail ?? null,
      });
      setIsFormReady(true);
    }
  }, [settingsData, form]);

  const weeklyDigestEnabled = useWatch({
    control: form.control,
    name: 'weeklyDigest',
  });

  const onSubmit = React.useCallback(
    async (values: FormValues) => {
      try {
        const result = await updateSettings({ body: values });
        if (result.status === 200) {
          toast.success('Notification settings updated');
        }
      } catch {
        // Error handled by mutation onError
      }
    },
    [updateSettings]
  );

  if (isLoading || !isFormReady) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Configure email alerts and weekly digest.</CardDescription>
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
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Configure email alerts and weekly digest.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          {/* Broken link alert */}
          <Controller
            name="emailOnBrokenLink"
            control={form.control}
            render={({ field }) => (
              <Field orientation="horizontal">
                <Switch
                  checked={field.value ?? true}
                  onCheckedChange={field.onChange}
                />
                <div className="flex flex-col gap-0.5">
                  <FieldLabel>Broken link alerts</FieldLabel>
                  <FieldDescription>
                    Get notified by email when one of your affiliate links is detected as broken.
                  </FieldDescription>
                </div>
              </Field>
            )}
          />

          {/* Weekly digest toggle */}
          <Controller
            name="weeklyDigest"
            control={form.control}
            render={({ field }) => (
              <Field orientation="horizontal">
                <Switch
                  checked={field.value ?? true}
                  onCheckedChange={field.onChange}
                />
                <div className="flex flex-col gap-0.5">
                  <FieldLabel>Weekly digest</FieldLabel>
                  <FieldDescription>
                    Get a summary email with clicks, broken links, and top performers.
                  </FieldDescription>
                </div>
              </Field>
            )}
          />

          {/* Digest day */}
          <Controller
            name="digestDay"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid || undefined}>
                <FieldLabel>Digest day</FieldLabel>
                <select
                  className="flex h-10 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30"
                  value={field.value ?? 'monday'}
                  onChange={field.onChange}
                  disabled={!weeklyDigestEnabled}
                >
                  {WEEKDAYS.map((day) => (
                    <option key={day.value} value={day.value}>
                      {day.label}
                    </option>
                  ))}
                </select>
                <FieldDescription>
                  The day of the week you want to receive your digest email.
                </FieldDescription>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          {/* CC email */}
          <Controller
            name="ccEmail"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid || undefined}>
                <FieldLabel>CC email</FieldLabel>
                <Input
                  type="email"
                  placeholder="team@example.com"
                  value={field.value ?? ''}
                  onChange={(e) => field.onChange(e.target.value || null)}
                />
                <FieldDescription>
                  Optionally send a copy of all alert emails to this address.
                </FieldDescription>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button type="submit" size="sm" disabled={isSaving}>
            {isSaving ? <Loader2 className="animate-spin" /> : <Save />}
            Save notifications
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}

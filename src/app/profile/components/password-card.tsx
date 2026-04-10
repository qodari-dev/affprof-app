'use client';

import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, KeyRound } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { ChangePasswordBodySchema } from '@/schemas/profile';
import { useChangePassword } from '@/hooks/queries/use-profile-queries';

const PasswordFormSchema = ChangePasswordBodySchema.extend({
  confirmPassword: z.string().min(8),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type FormValues = z.infer<typeof PasswordFormSchema>;

export function PasswordCard() {
  const { mutateAsync: changePassword, isPending } = useChangePassword();

  const form = useForm<FormValues>({
    resolver: zodResolver(PasswordFormSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = React.useCallback(
    async (values: FormValues) => {
      try {
        const result = await changePassword({
          body: {
            currentPassword: values.currentPassword,
            newPassword: values.newPassword,
          },
        });
        if (result.status === 204) {
          toast.success('Password changed successfully');
          form.reset();
        }
      } catch {
        // Error handled by mutation onError
      }
    },
    [changePassword, form]
  );

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle>Password</CardTitle>
          <CardDescription>Change your account password.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          {/* Current password */}
          <Controller
            name="currentPassword"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid || undefined}>
                <FieldLabel>Current password</FieldLabel>
                <Input
                  type="password"
                  autoComplete="current-password"
                  placeholder="Enter current password"
                  value={field.value}
                  onChange={field.onChange}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          {/* New password */}
          <Controller
            name="newPassword"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid || undefined}>
                <FieldLabel>New password</FieldLabel>
                <Input
                  type="password"
                  autoComplete="new-password"
                  placeholder="Enter new password"
                  value={field.value}
                  onChange={field.onChange}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          {/* Confirm password */}
          <Controller
            name="confirmPassword"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid || undefined}>
                <FieldLabel>Confirm new password</FieldLabel>
                <Input
                  type="password"
                  autoComplete="new-password"
                  placeholder="Confirm new password"
                  value={field.value}
                  onChange={field.onChange}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button type="submit" size="sm" disabled={isPending}>
            {isPending ? <Loader2 className="animate-spin" /> : <KeyRound />}
            Change password
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}

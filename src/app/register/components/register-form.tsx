'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Check, Eye, EyeOff, Loader2, Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { PRICING } from '@/config/pricing';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { ModeToggle } from '@/components/mode-toggle';
import { useRegister } from '@/hooks/queries/use-auth-queries';
import { cn } from '@/lib/utils';
import { RegisterBodySchema, type RegisterBody } from '@/schemas/auth';
import { getTsRestError } from '@/utils/get-ts-rest-error-message';

import logoLight from '../../../../public/logo-fondo-blanco.png';
import logoDark from '../../../../public/logo-fondo-negro.png';

// ============================================================================
// Plan options
// ============================================================================

type PlanId = RegisterBody['plan'];
type FormInputValues = z.input<typeof RegisterBodySchema>;
type FormValues = z.output<typeof RegisterBodySchema>;

// ============================================================================
// Component
// ============================================================================

export function RegisterForm({ initialPlan = 'free' }: { initialPlan?: PlanId }) {
  const t = useTranslations('auth.register');
  const tPro = useTranslations('billing.plans.pro');
  const tProAnnual = useTranslations('billing.plans.pro_annual');

  const [showPassword, setShowPassword] = React.useState(false);

  const form = useForm<FormInputValues, undefined, FormValues>({
    resolver: zodResolver(RegisterBodySchema),
    defaultValues: {
      email: '',
      firstName: '',
      lastName: '',
      password: '',
      plan: initialPlan,
    },
  });

  const { mutateAsync: register, isPending } = useRegister();
  const selectedPlan = useWatch({ control: form.control, name: 'plan' });

  const plans = React.useMemo(
    () => [
      {
        id: 'free' as const,
        name: t('plans.free.name'),
        price: t('plans.free.price'),
        description: t('plans.free.description'),
        highlight: false,
      },
      {
        id: 'pro' as const,
        name: tPro('name'),
        price: PRICING.pro.label,
        description: tPro('description'),
        trial: tPro('trial'),
        highlight: false,
      },
      {
        id: 'pro_annual' as const,
        name: tProAnnual('name'),
        price: PRICING.proAnnual.label,
        subPrice: PRICING.proAnnual.subLabel,
        description: tProAnnual('description'),
        trial: tProAnnual('trial'),
        highlight: true,
      },
    ],
    [t, tPro, tProAnnual],
  );

  const onSubmit = React.useCallback(async (values: FormValues) => {
    try {
      const result = await register({ body: values });

      if (result.status === 201) {
        if (result.body.checkoutUrl) {
          // Paid plan → hand off to Stripe Checkout
          window.location.assign(result.body.checkoutUrl);
          return;
        }

        // Free plan → trigger IAM login flow via the proxy
        toast.success(t('toastSuccessFree'));
        window.location.assign('/dashboard');
        return;
      }

      // Non-201 → surface server error message
      const { message, code } = getTsRestError(result);

      if (code === 'EMAIL_EXISTS') {
        form.setError('email', { type: 'server', message: t('errors.emailExists') });
        toast.error(t('errors.emailExists'));
        return;
      }

      toast.error(message ?? t('errors.generic'));
    } catch (error) {
      const { message } = getTsRestError(error);
      toast.error(message ?? t('errors.generic'));
    }
  }, [register, form, t]);

  return (
    <div className="relative flex min-h-svh w-full flex-col bg-gradient-to-br from-background via-background to-muted/40">
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 py-5 sm:px-10">
        <Link href="https://affprof.com" className="flex items-center" aria-label="AffProf">
          <Image
            src={logoLight}
            alt="AffProf"
            className="block h-8 w-auto object-contain dark:hidden"
            sizes="140px"
            priority
          />
          <Image
            src={logoDark}
            alt="AffProf"
            className="hidden h-8 w-auto object-contain dark:block"
            sizes="140px"
            priority
          />
        </Link>
        <ModeToggle />
      </header>

      {/* Main */}
      <main className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-3xl">
          {/* Heading */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              {t('title')}
            </h1>
            <p className="mt-3 text-balance text-muted-foreground">
              {t('subtitle')}
            </p>
          </div>

          {/* Card */}
          <div className="rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col gap-7"
              noValidate
            >
              <FieldGroup>
                {/* Name */}
                <div className="grid gap-5 sm:grid-cols-2">
                  <Controller
                    name="firstName"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid || undefined}>
                        <FieldLabel htmlFor="firstName">{t('firstName')}</FieldLabel>
                        <Input
                          id="firstName"
                          autoComplete="given-name"
                          placeholder={t('firstNamePlaceholder')}
                          value={field.value}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                        />
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      </Field>
                    )}
                  />

                  <Controller
                    name="lastName"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid || undefined}>
                        <FieldLabel htmlFor="lastName">{t('lastName')}</FieldLabel>
                        <Input
                          id="lastName"
                          autoComplete="family-name"
                          placeholder={t('lastNamePlaceholder')}
                          value={field.value}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                        />
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      </Field>
                    )}
                  />
                </div>

                {/* Email */}
                <Controller
                  name="email"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid || undefined}>
                      <FieldLabel htmlFor="email">{t('email')}</FieldLabel>
                      <Input
                        id="email"
                        type="email"
                        autoComplete="email"
                        placeholder={t('emailPlaceholder')}
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />

                {/* Password */}
                <Controller
                  name="password"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid || undefined}>
                      <FieldLabel htmlFor="password">{t('password')}</FieldLabel>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          autoComplete="new-password"
                          placeholder={t('passwordPlaceholder')}
                          value={field.value}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((prev) => !prev)}
                          className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground transition hover:text-foreground"
                          aria-label={showPassword ? t('hidePassword') : t('showPassword')}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      <FieldDescription>{t('passwordHelp')}</FieldDescription>
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />

                {/* Plan selector */}
                <Controller
                  name="plan"
                  control={form.control}
                  render={({ field }) => (
                    <Field>
                      <FieldLabel>{t('plan')}</FieldLabel>
                      <div
                        role="radiogroup"
                        aria-label={t('plan')}
                        className="grid gap-3 sm:grid-cols-3"
                      >
                        {plans.map((plan) => {
                          const isSelected = field.value === plan.id;
                          return (
                            <button
                              key={plan.id}
                              type="button"
                              role="radio"
                              aria-checked={isSelected}
                              onClick={() => field.onChange(plan.id)}
                              className={cn(
                                'group/plan relative flex flex-col gap-2 rounded-xl border p-4 text-left transition-all',
                                'hover:border-foreground/30',
                                isSelected
                                  ? 'border-primary ring-2 ring-primary/30'
                                  : 'border-border',
                                plan.highlight && !isSelected && 'border-emerald-300/70',
                              )}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <span className="text-sm font-semibold">{plan.name}</span>
                                <div className="flex shrink-0 items-center gap-1.5">
                                  {plan.highlight && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase text-emerald-700 dark:text-emerald-400">
                                      <Sparkles className="size-3" />
                                      {t('plans.recommended')}
                                    </span>
                                  )}
                                  {isSelected && (
                                    <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                                      <Check className="h-3 w-3" />
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-baseline gap-1.5">
                                <span className="text-base font-medium">{plan.price}</span>
                                {'subPrice' in plan && (
                                  <span className="text-xs text-muted-foreground">{plan.subPrice}</span>
                                )}
                              </div>
                              {'trial' in plan && (
                                <span className="inline-flex w-fit items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:text-emerald-400">
                                  {plan.trial}
                                </span>
                              )}
                              <span className="text-xs leading-relaxed text-muted-foreground">
                                {plan.description}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                      <FieldDescription>
                        {field.value === 'free' ? t('planHelpFree') : t('planHelpPaid')}
                      </FieldDescription>
                    </Field>
                  )}
                />
              </FieldGroup>

              {/* Submit */}
              <Button
                type="submit"
                size="lg"
                className="h-11 w-full rounded-lg text-base"
                disabled={isPending}
              >
                {isPending && <Loader2 className="animate-spin" />}
                {selectedPlan === 'free' ? t('submitFree') : t('submitPaid')}
              </Button>

              {/* Terms */}
              <p className="text-center text-xs text-muted-foreground">
                {t.rich('terms', {
                  termsLink: (chunks) => (
                    <Link
                      href="https://affprof.com/terms"
                      className="underline underline-offset-4 hover:text-foreground"
                    >
                      {chunks}
                    </Link>
                  ),
                  privacyLink: (chunks) => (
                    <Link
                      href="https://affprof.com/privacy"
                      className="underline underline-offset-4 hover:text-foreground"
                    >
                      {chunks}
                    </Link>
                  ),
                })}
              </p>
            </form>
          </div>

          {/* Login link */}
          <p className="mt-6 text-center text-sm text-muted-foreground">
            {t.rich('hasAccount', {
              loginLink: (chunks) => (
                <Link
                  href="/dashboard"
                  className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
                >
                  {chunks}
                </Link>
              ),
            })}
          </p>
        </div>
      </main>
    </div>
  );
}

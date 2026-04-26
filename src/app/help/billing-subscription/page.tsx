import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  CreditCard,
  DollarSign,
  Globe2,
  Mail,
  ReceiptText,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import { getLocale, getTranslations } from 'next-intl/server';

import { PageLayout } from '@/components/sidebar/page-layout';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { Locale } from '@/i18n/config';

type BillingContent = {
  heroDescription: string;
  summary: Array<{ title: string; body: string }>;
  plansTitle: string;
  plansDescription: string;
  questionsTitle: string;
  questionsDescription: string;
  helpTitle: string;
  helpBody: string;
  terms: string;
  termsHref: string;
  termsLabel: string;
  plans: Array<{
    name: string;
    price: string;
    description: string;
    highlight?: string;
    features: string[];
  }>;
  sections: Array<{
    id: string;
    icon: LucideIcon;
    title: string;
    description: string;
    items: string[];
  }>;
  faqs: Array<{ question: string; answer: string }>;
};

const billingContent = {
  en: {
    heroDescription:
      'Manage your AffProf plan, payment method, invoices, and subscription changes. AffProf uses Stripe to handle all payments - your card details never touch our servers.',
    summary: [
      {
        title: 'Stripe powered',
        body: 'Payments, cards, invoices, and portal access are handled securely by Stripe.',
      },
      { title: '14-day Pro trial', body: 'Start with full Pro access before the first paid charge.' },
      {
        title: 'Data preserved',
        body: 'Products, links, analytics, and settings are preserved if your plan changes.',
      },
    ],
    plansTitle: 'Plans',
    plansDescription:
      'Choose Free to test the core workflow, or Pro when you need advanced protection and branding.',
    questionsTitle: 'Common questions',
    questionsDescription: 'Short answers to the billing questions users ask most often.',
    helpTitle: 'Need help with billing?',
    helpBody:
      'Email hello@affprof.com with your account email and any relevant invoice numbers. We reply within 24 hours, faster for Pro users.',
    terms: 'For legal details, review the Terms of Service.',
    termsHref: 'https://affprof.com/en/terms',
    termsLabel: 'Terms of Service',
    plans: [
      {
        name: 'Free',
        price: '$0/month',
        description:
          'A real starting point for testing AffProf with a smaller catalog. No credit card required.',
        features: [
          'Up to 2 products',
          'Up to 10 links',
          'QR codes with the default AffProf style',
          'Full click analytics',
          'UTM parameter support',
          'Daily link monitoring with email alerts',
        ],
      },
      {
        name: 'Pro Monthly',
        price: '$9/month',
        description: 'The full feature set with monthly flexibility.',
        highlight: '14-day trial',
        features: [
          'Unlimited products and links',
          'Branded QR codes with your colors and logo',
          'Custom domain for short links',
          'Fallback URL when a link breaks',
          'Bulk import via CSV',
          'Faster monitoring, 4x a day',
          'Priority email support',
        ],
      },
      {
        name: 'Pro Annual',
        price: '$79/year',
        description: 'The same Pro feature set, billed once a year.',
        highlight: '$6.58/month',
        features: [
          'Everything in Pro Monthly',
          'Save 27% vs monthly',
          'Roughly 2 months free',
          'Best for long-term creator workflows',
          'Annual billing through Stripe',
        ],
      },
    ],
    sections: [
      {
        id: 'trial',
        icon: CalendarClock,
        title: 'The 14-day free trial',
        description:
          'When you upgrade to Pro monthly or annual, Stripe starts a 14-day trial with the full Pro feature set.',
        items: [
          'Card required: Stripe Checkout collects your payment method, but you are not charged immediately.',
          'Full Pro access: every Pro feature is unlocked from day one.',
          'Automatic conversion: when the trial ends, Stripe charges the selected plan unless you cancel first.',
          'Cancel anytime: cancel before the trial ends to return to Free without a charge.',
          'Trial reminders: AffProf sends an email reminder 3 days before your trial ends and records that email in notification history.',
        ],
      },
      {
        id: 'upgrade',
        icon: Sparkles,
        title: 'How to upgrade',
        description: 'Upgrades start from Billing and finish securely in Stripe Checkout.',
        items: [
          'Go to Billing in the sidebar.',
          'Click Open billing or pick a plan from the Plans section.',
          'Enter your card details in Stripe Checkout and confirm.',
          'Return to AffProf with full Pro access immediately.',
        ],
      },
      {
        id: 'switching',
        icon: RotateCcw,
        title: 'Switching Monthly and Annual',
        description: 'Existing Pro subscriptions are managed from the Stripe Customer Portal.',
        items: [
          'Go to Billing and open the billing portal.',
          'Choose Update subscription in Stripe.',
          'Select the new billing cadence and confirm.',
          'Stripe handles proration for unused time on the current plan.',
        ],
      },
      {
        id: 'canceling',
        icon: ShieldCheck,
        title: 'Canceling your subscription',
        description: 'There are no cancellation fees or lock-ins.',
        items: [
          'Open Billing, then open the Stripe billing portal.',
          'Choose Cancel subscription and confirm in Stripe.',
          'You keep full Pro access until the end of your current billing period.',
          'Your data stays intact: links, products, analytics, brands, and custom domain settings are preserved.',
          'After that, your account moves to Free. Extra links are paused, not deleted, and your custom domain can be re-enabled by upgrading again.',
        ],
      },
      {
        id: 'refunds',
        icon: DollarSign,
        title: 'Refunds',
        description:
          'We offer a full refund on your first paid charge if you request it within 7 days of that charge.',
        items: [
          'Email hello@affprof.com with the email associated with your account.',
          'Include your invoice number from Billing history when possible.',
          'Refunds are processed within 2 business days and appear on your card within 5-10 business days depending on your bank.',
          'Refunds are not available after the 7-day window, for partial billing periods, or for renewals after the first charge.',
        ],
      },
      {
        id: 'payments',
        icon: CreditCard,
        title: 'Payment methods and failed payments',
        description: 'AffProf supports any payment method Stripe accepts in your country.',
        items: [
          'Major credit and debit cards are supported, plus Apple Pay, Google Pay, and some local methods where available.',
          'Update your card from Billing by opening the Stripe Customer Portal.',
          'If a payment fails, Stripe retries the charge and sends payment emails.',
          'If all retries fail, your subscription can pause and your account moves to Free with preserved data.',
        ],
      },
      {
        id: 'history',
        icon: ReceiptText,
        title: 'Billing history',
        description: 'Billing history lists every invoice for your AffProf subscription.',
        items: [
          'See invoice number, amount, currency, status, created date, and billing period.',
          'Open the hosted Stripe invoice from AffProf.',
          'Download the PDF invoice for accounting or expense reports.',
          'Update business billing details in Stripe so future invoices use the right information.',
        ],
      },
      {
        id: 'taxes',
        icon: Globe2,
        title: 'Currencies and taxes',
        description: 'Stripe calculates supported currencies and taxes during checkout.',
        items: [
          'AffProf prices are listed in USD.',
          'Stripe automatically converts to your local currency based on billing country when supported.',
          'Applicable taxes are added at checkout based on your billing address.',
          'For Canadian customers, GST/HST is calculated based on province.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Can I have multiple subscriptions on one account?',
        answer:
          'No. One account has one subscription. If you need separate billing for multiple brands, create separate AffProf accounts.',
      },
      {
        question: 'What happens if I downgrade from Pro to Free?',
        answer:
          'You keep Pro features until the end of the billing period, then move to Free. Extra links are paused, and your custom domain stops resolving until you upgrade again.',
      },
      {
        question: 'Do you offer team plans or volume discounts?',
        answer:
          'Not yet. If you need multiple seats or agency workflows, email hello@affprof.com and we will review the use case.',
      },
      {
        question: 'Do you offer a free trial without entering a card?',
        answer:
          'The Free plan is available without a card. The 14-day Pro trial requires a card through Stripe Checkout.',
      },
    ],
  },
  es: {
    heroDescription:
      'Maneja tu plan de AffProf, método de pago, facturas, y cambios de suscripción. AffProf usa Stripe para manejar todos los pagos - los detalles de tu tarjeta nunca tocan nuestros servidores.',
    summary: [
      {
        title: 'Procesado por Stripe',
        body: 'Pagos, tarjetas, facturas y acceso al portal se manejan de forma segura con Stripe.',
      },
      {
        title: 'Trial Pro de 14 días',
        body: 'Empieza con acceso Pro completo antes del primer cobro pagado.',
      },
      {
        title: 'Data preservada',
        body: 'Productos, links, analytics y settings se preservan si tu plan cambia.',
      },
    ],
    plansTitle: 'Planes',
    plansDescription:
      'Usa Free para probar el flujo principal, o Pro cuando necesites protección avanzada y branding.',
    questionsTitle: 'Preguntas comunes',
    questionsDescription: 'Respuestas rápidas a las preguntas de facturación más comunes.',
    helpTitle: '¿Necesitas ayuda con facturación?',
    helpBody:
      'Escribe a hello@affprof.com con tu email de cuenta y cualquier número de factura relevante. Respondemos dentro de 24 horas, más rápido para usuarios Pro.',
    terms: 'Para detalles legales, revisa los Términos de Servicio.',
    termsHref: 'https://affprof.com/es/terms',
    termsLabel: 'Términos de Servicio',
    plans: [
      {
        name: 'Free',
        price: '$0/mes',
        description:
          'Un punto de partida real para probar AffProf con un catálogo más pequeño. No se requiere tarjeta de crédito.',
        features: [
          'Hasta 2 productos',
          'Hasta 10 links',
          'Códigos QR con el estilo por defecto de AffProf',
          'Analytics de clicks completos',
          'Soporte para UTM parameters',
          'Monitoreo diario de links con alertas por email',
        ],
      },
      {
        name: 'Pro Mensual',
        price: '$9/mes',
        description: 'Set completo de features con flexibilidad mensual.',
        highlight: 'Trial de 14 días',
        features: [
          'Productos y links ilimitados',
          'QR codes con tu marca, colores y logo',
          'Dominio personalizado para links cortos',
          'Fallback URL cuando un link se rompe',
          'Importación masiva por CSV',
          'Monitoreo más rápido, 4x al día',
          'Soporte prioritario por email',
        ],
      },
      {
        name: 'Pro Anual',
        price: '$79/año',
        description: 'El mismo set Pro completo, facturado una vez al año.',
        highlight: '$6.58/mes',
        features: [
          'Todo lo de Pro Mensual',
          'Ahorra 27% vs mensual',
          'Aproximadamente 2 meses gratis',
          'Ideal para workflows de creator a largo plazo',
          'Facturación anual con Stripe',
        ],
      },
    ],
    sections: [
      {
        id: 'trial',
        icon: CalendarClock,
        title: 'El trial gratis de 14 días',
        description:
          'Cuando pasas a Pro mensual o anual, Stripe inicia un trial de 14 días con el set completo de features Pro.',
        items: [
          'Se requiere tarjeta: Stripe Checkout guarda tu método de pago, pero no se te cobra inmediatamente.',
          'Acceso Pro completo: cada feature Pro está desbloqueada desde el día 1.',
          'Conversión automática: cuando el trial termina, Stripe cobra el plan elegido a menos que canceles antes.',
          'Cancela cuando quieras: si cancelas antes de que termine el trial, no se hace ningún cobro y vuelves a Free.',
          'Recordatorios del trial: AffProf envía un email 3 días antes de que termine tu trial y registra ese email en el historial de notificaciones.',
        ],
      },
      {
        id: 'upgrade',
        icon: Sparkles,
        title: 'Cómo pasar a Pro',
        description: 'El upgrade empieza desde Billing y termina de forma segura en Stripe Checkout.',
        items: [
          'Ve a Billing en el sidebar.',
          'Haz click en Open billing o elige un plan en la sección Plans.',
          'Ingresa los detalles de tu tarjeta en Stripe Checkout y confirma.',
          'Vuelves a AffProf con acceso Pro completo inmediatamente.',
        ],
      },
      {
        id: 'switching',
        icon: RotateCcw,
        title: 'Cambiar entre Mensual y Anual',
        description: 'Las suscripciones Pro existentes se manejan desde Stripe Customer Portal.',
        items: [
          'Ve a Billing y abre el portal de facturación.',
          'Elige Update subscription en Stripe.',
          'Selecciona la nueva cadencia de facturación y confirma.',
          'Stripe maneja la prorata por el tiempo no usado del plan actual.',
        ],
      },
      {
        id: 'canceling',
        icon: ShieldCheck,
        title: 'Cancelar tu suscripción',
        description: 'No hay cargos por cancelación ni lock-in.',
        items: [
          'Abre Billing y luego abre el portal de Stripe.',
          'Elige Cancel subscription y confirma en Stripe.',
          'Mantienes acceso Pro completo hasta el final del período de facturación actual.',
          'Tu data se mantiene intacta: links, productos, analytics, marcas y dominio personalizado se preservan.',
          'Después, tu cuenta pasa a Free. Los links extra se pausan, no se borran, y puedes reactivar tu dominio personalizado pasando a Pro otra vez.',
        ],
      },
      {
        id: 'refunds',
        icon: DollarSign,
        title: 'Reembolsos',
        description:
          'Ofrecemos un reembolso completo en tu primer cobro pagado si lo solicitas dentro de 7 días del cobro.',
        items: [
          'Escríbenos a hello@affprof.com con el email asociado a tu cuenta.',
          'Incluye el número de factura desde Billing history cuando sea posible.',
          'Procesamos reembolsos dentro de 2 días hábiles; pueden aparecer en tu tarjeta dentro de 5-10 días hábiles según tu banco.',
          'No hay reembolsos después de la ventana de 7 días, por períodos parciales, o por renovaciones después del primer cobro.',
        ],
      },
      {
        id: 'payments',
        icon: CreditCard,
        title: 'Métodos de pago y pagos fallidos',
        description: 'AffProf soporta cualquier método de pago que Stripe acepte en tu país.',
        items: [
          'Se soportan tarjetas principales, Apple Pay, Google Pay y algunos métodos locales donde estén disponibles.',
          'Actualiza tu tarjeta desde Billing abriendo Stripe Customer Portal.',
          'Si un pago falla, Stripe reintenta el cobro y envía emails sobre el pago.',
          'Si todos los reintentos fallan, la suscripción puede pausarse y tu cuenta pasa a Free con la data preservada.',
        ],
      },
      {
        id: 'history',
        icon: ReceiptText,
        title: 'Historial de facturación',
        description: 'Billing history muestra cada factura de tu suscripción a AffProf.',
        items: [
          'Puedes ver número de factura, monto, moneda, status, fecha de creación y período cubierto.',
          'Abre la factura completa alojada en Stripe desde AffProf.',
          'Descarga el PDF para contabilidad o reportes de gastos.',
          'Actualiza tus datos de facturación en Stripe para que facturas futuras usen la información correcta.',
        ],
      },
      {
        id: 'taxes',
        icon: Globe2,
        title: 'Monedas e impuestos',
        description: 'Stripe calcula monedas soportadas e impuestos durante checkout.',
        items: [
          'Los precios de AffProf están listados en USD.',
          'Stripe puede convertir a moneda local según tu país de facturación cuando esté soportado.',
          'Los impuestos aplicables se agregan en checkout según tu dirección de facturación.',
          'Para clientes canadienses, GST/HST se calcula según la provincia.',
        ],
      },
    ],
    faqs: [
      {
        question: '¿Puedo tener múltiples suscripciones en una cuenta?',
        answer:
          'No. Una cuenta tiene una suscripción. Si necesitas facturación separada para múltiples marcas, crea cuentas AffProf separadas.',
      },
      {
        question: '¿Qué pasa si bajo de Pro a Free?',
        answer:
          'Mantienes features Pro hasta el final del período de facturación, después pasas a Free. Los links extra se pausan y tu dominio personalizado deja de resolver hasta que vuelvas a Pro.',
      },
      {
        question: '¿Ofrecen planes de equipo o descuentos por volumen?',
        answer:
          'Todavía no. Si necesitas múltiples seats o workflows de agencia, escríbenos a hello@affprof.com y revisamos el caso.',
      },
      {
        question: '¿Ofrecen un trial gratis sin ingresar tarjeta?',
        answer:
          'El plan Free está disponible sin tarjeta. El trial Pro de 14 días sí requiere tarjeta por Stripe Checkout.',
      },
    ],
  },
} satisfies Record<Locale, BillingContent>;

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item} className="flex gap-2 text-sm leading-6 text-muted-foreground">
          <CheckCircle2 className="mt-1 size-4 shrink-0 text-primary" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function TextWithEmail({ text }: { text: string }) {
  const [before, after] = text.split('hello@affprof.com');

  if (after === undefined) return text;

  return (
    <>
      {before}
      <a className="font-medium text-primary hover:underline" href="mailto:hello@affprof.com">
        hello@affprof.com
      </a>
      {after}
    </>
  );
}

function TextWithLink({
  text,
  label,
  href,
}: {
  text: string;
  label: string;
  href: string;
}) {
  const [before, after] = text.split(label);

  if (after === undefined) return text;

  return (
    <>
      {before}
      <a className="font-medium text-primary hover:underline" href={href}>
        {label}
      </a>
      {after}
    </>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('help');
  return { title: t('topics.billing.title') };
}

export default async function BillingSubscriptionHelpPage() {
  const t = await getTranslations('help');
  const tCommon = await getTranslations('common');
  const tNav = await getTranslations('nav');
  const locale = (await getLocale()) as Locale;
  const content = billingContent[locale];
  const title = t('topics.billing.title');

  // TODO: Add automated trial-ending reminder emails and log the dispatch in notification history.
  return (
    <PageLayout
      breadcrumbs={[
        { label: tCommon('home'), href: '/' },
        { label: tNav('help'), href: '/help' },
        { label: title },
      ]}
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 py-4">
        <Link
          href="/help"
          className="inline-flex w-fit items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          {t('backToHelp')}
        </Link>

        <section className="rounded-2xl border bg-card p-6">
          <div className="mb-5 flex size-12 items-center justify-center rounded-2xl bg-primary/10">
            <CreditCard className="size-6 text-primary" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{title}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
            {content.heroDescription}
          </p>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {content.summary.map((item) => (
              <div key={item.title} className="rounded-xl border bg-muted/20 p-4">
                <div className="text-sm font-medium">{item.title}</div>
                <p className="mt-1 text-sm text-muted-foreground">{item.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">{content.plansTitle}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{content.plansDescription}</p>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            {content.plans.map((plan) => (
              <Card key={plan.name} className="rounded-2xl">
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle>{plan.name}</CardTitle>
                      <CardDescription className="mt-1">{plan.description}</CardDescription>
                    </div>
                    {plan.highlight ? <Badge variant="secondary">{plan.highlight}</Badge> : null}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-2xl font-semibold">{plan.price}</div>
                  <BulletList items={plan.features} />
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          {content.sections.map(
            ({ id, icon: Icon, title: sectionTitle, description, items }) => (
              <Card key={id} id={id} className="scroll-mt-20 rounded-2xl">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border bg-background">
                      <Icon className="size-5 text-muted-foreground" />
                    </div>
                    <div>
                      <CardTitle>{sectionTitle}</CardTitle>
                      <CardDescription className="mt-1">{description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <BulletList items={items} />
                </CardContent>
              </Card>
            ),
          )}
        </section>

        <section className="rounded-2xl border bg-muted/20 p-5">
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div>
              <h2 className="text-xl font-semibold">{content.questionsTitle}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{content.questionsDescription}</p>
            </div>
            <Mail className="size-5 text-muted-foreground" />
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {content.faqs.map((faq) => (
              <div key={faq.question} className="rounded-xl border bg-background p-4">
                <div className="text-sm font-medium">{faq.question}</div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border bg-card p-5">
          <h2 className="text-xl font-semibold">{content.helpTitle}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            <TextWithEmail text={content.helpBody} />
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            <TextWithLink
              text={content.terms}
              label={content.termsLabel}
              href={content.termsHref}
            />
          </p>
        </section>
      </div>
    </PageLayout>
  );
}

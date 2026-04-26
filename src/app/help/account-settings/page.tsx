import type { Metadata } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Bell,
  Globe2,
  Info,
  KeyRound,
  Mail,
  QrCode,
  Settings,
  Trash2,
  User,
  type LucideIcon,
} from 'lucide-react';
import { getLocale, getTranslations } from 'next-intl/server';

import { PageLayout } from '@/components/sidebar/page-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { Locale } from '@/i18n/config';

type TextBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'subheading'; text: string }
  | { type: 'url'; text: string }
  | { type: 'bullets'; items: string[] }
  | { type: 'warning' | 'tip'; text: string }
  | { type: 'related'; href: string; label: string };

type ArticleSection = {
  id: string;
  title: string;
  icon: LucideIcon;
  blocks: TextBlock[];
};

type AccountContent = {
  metadataTitle: string;
  title: string;
  description: string;
  backLabel: string;
  introCards: Array<{ title: string; body: string }>;
  tocTitle: string;
  sections: ArticleSection[];
  helpTitle: string;
  helpBody: string;
};

const accountContent = {
  en: {
    metadataTitle: 'Account & settings - AffProf Help',
    title: 'Account & settings',
    description:
      'Manage your profile details, security, notifications, and account-wide defaults from one place. This guide covers the Profile, Settings, and notification screens.',
    backLabel: 'Back to Help Center',
    introCards: [
      {
        title: 'Profile basics',
        body: 'Name, short link slug, timezone, language, password, and account deletion.',
      },
      {
        title: 'Notifications',
        body: 'Broken link alerts, weekly digest, CC email, and email delivery history.',
      },
      {
        title: 'Account defaults',
        body: 'Default fallback URL, brands, QR codes, and custom domain entry points.',
      },
    ],
    tocTitle: 'In this guide',
    sections: [
      {
        id: 'profile',
        title: 'Profile',
        icon: User,
        blocks: [
          {
            type: 'paragraph',
            text: 'Found under Profile in the sidebar. It controls your personal information and how your short links look.',
          },
          { type: 'subheading', text: 'Name' },
          {
            type: 'paragraph',
            text: 'Your display name. It appears in the Home welcome message and is used internally for support emails. It does not appear publicly on your short links.',
          },
          { type: 'subheading', text: 'Short link slug' },
          {
            type: 'paragraph',
            text: 'This is the most important setting in your profile because it appears in every default AffProf short link you create. Your short links follow this pattern:',
          },
          { type: 'url', text: 'affprof.com/go/{your-slug}/{link-slug}' },
          {
            type: 'paragraph',
            text: 'For example, if your slug is jose, your links look like affprof.com/go/jose/airpods-pro.',
          },
          {
            type: 'warning',
            text: 'Be careful changing this later. Any short link you have already shared will break if you change your slug. Old slug links return a 404. If you need to migrate to a new slug, contact hello@affprof.com first so we can help avoid breakage.',
          },
          {
            type: 'paragraph',
            text: 'If you connect a custom domain, this slug does not appear in your branded URLs. Your custom domain replaces both affprof.com/go/ and your account slug.',
          },
          { type: 'subheading', text: 'Timezone' },
          {
            type: 'bullets',
            items: [
              'Analytics views use your timezone when showing clicks by day and date breakdowns.',
              'Weekly digest scheduling uses your timezone so the email arrives in the morning locally.',
              'UTC is the default. Change it to your real timezone for accurate reporting.',
            ],
          },
          { type: 'subheading', text: 'Language' },
          {
            type: 'bullets',
            items: [
              'Choose English or Spanish for the app interface.',
              'Transactional emails follow your selected language where supported.',
              'Help Center articles use the same language setting.',
            ],
          },
        ],
      },
      {
        id: 'password',
        title: 'Password',
        icon: KeyRound,
        blocks: [
          {
            type: 'paragraph',
            text: 'Change your account password from Profile -> Password.',
          },
          {
            type: 'paragraph',
            text: 'You need to enter your current password to confirm the change. After changing it, you stay signed in on this device. Other signed-in devices need to re-authenticate the next time they are used.',
          },
          {
            type: 'tip',
            text: 'Forgot your password? Sign out and use the forgot password link on the login page. We will email you a reset link.',
          },
        ],
      },
      {
        id: 'notifications',
        title: 'Notifications',
        icon: Bell,
        blocks: [
          {
            type: 'paragraph',
            text: 'Found under Settings -> Notifications. It controls when AffProf sends you emails.',
          },
          { type: 'subheading', text: 'Broken link alerts' },
          {
            type: 'paragraph',
            text: 'When enabled, you receive an email any time AffProf detects a broken link in your account. Alerts are sent at most once per link every 24 hours, so one failing link does not flood your inbox.',
          },
          {
            type: 'paragraph',
            text: 'You can disable alerts globally here, or per link in the link edit form.',
          },
          { type: 'subheading', text: 'Weekly digest' },
          {
            type: 'bullets',
            items: [
              'Total clicks across all links for the last 7 days.',
              'Top performing links and products.',
              'Any broken links from that week.',
              'Trend compared with the previous week.',
            ],
          },
          {
            type: 'paragraph',
            text: 'Digest day lets you choose which day of the week the digest arrives. Pick the day that matches your reporting routine.',
          },
          { type: 'subheading', text: 'CC email' },
          {
            type: 'paragraph',
            text: 'Optional. If you enter an email address here, a copy of every alert and digest is also sent to that address.',
          },
          {
            type: 'bullets',
            items: [
              'Forward alerts to someone who handles maintenance.',
              'Send digests to a marketing manager or client.',
              'Keep a record in a separate inbox.',
            ],
          },
          {
            type: 'paragraph',
            text: 'The CC email does not replace the original delivery. Your main account email still receives the email.',
          },
        ],
      },
      {
        id: 'email-history',
        title: 'Email history',
        icon: Mail,
        blocks: [
          {
            type: 'paragraph',
            text: 'Found under Settings -> Email history. It shows every email AffProf has sent on your behalf, with delivery status.',
          },
          { type: 'subheading', text: 'Filters' },
          {
            type: 'bullets',
            items: [
              'All types, Broken links, and Weekly digest filter by email type.',
              'All status, Sent, Processing, and Failed filter by delivery status.',
            ],
          },
          { type: 'subheading', text: 'Why it is useful' },
          {
            type: 'bullets',
            items: [
              'Confirm that a broken link alert went out when expected.',
              'Diagnose why digests stopped arriving.',
              'Check if the email system is processing normally.',
            ],
          },
          {
            type: 'paragraph',
            text: 'Email history is also used internally to prevent duplicate deliveries. If an alert was sent for a specific link in the last 24 hours, AffProf waits until that window passes before sending another one for the same link.',
          },
        ],
      },
      {
        id: 'default-fallback',
        title: 'Default fallback URL',
        icon: Settings,
        blocks: [
          {
            type: 'paragraph',
            text: 'Found under Settings -> Default fallback URL. This is the account-level backup destination used when:',
          },
          {
            type: 'bullets',
            items: [
              'A short link breaks and that link does not have its own fallback URL.',
              'A short link is disabled and that link does not have its own fallback URL.',
            ],
          },
          {
            type: 'paragraph',
            text: 'Without a default fallback, visitors of broken or disabled links see a link unavailable page. With a fallback, they are redirected to a backup URL you choose.',
          },
          {
            type: 'tip',
            text: 'Recommendation: set this to a high-converting page on your site, such as your homepage, featured products page, or deals page. Per-link fallbacks always take priority over the default.',
          },
        ],
      },
      {
        id: 'brands',
        title: 'Brands',
        icon: QrCode,
        blocks: [
          {
            type: 'paragraph',
            text: 'Found under Settings -> Brands. Save logo and color combinations once, then apply them to QR codes in your account. Branded QR codes with custom logo and colors are a Pro feature.',
          },
          { type: 'related', href: '/help/brands-qr', label: 'Full guide: Brands & QR codes' },
        ],
      },
      {
        id: 'custom-domain',
        title: 'Custom domain',
        icon: Globe2,
        blocks: [
          {
            type: 'paragraph',
            text: 'Found under Settings -> Custom domain. Replace affprof.com/go/... with your own subdomain, like links.yourbrand.com. One custom domain per account. Pro feature.',
          },
          { type: 'related', href: '/help/custom-domains', label: 'Full guide: Custom domains' },
        ],
      },
      {
        id: 'delete-account',
        title: 'Delete account',
        icon: Trash2,
        blocks: [
          {
            type: 'paragraph',
            text: 'Found under Profile -> Delete account. It permanently removes your account and all associated data. This action cannot be undone.',
          },
          { type: 'subheading', text: 'What gets deleted' },
          {
            type: 'bullets',
            items: [
              'All affiliate links and click analytics.',
              'All products, brands, tags, and QR codes.',
              'Custom domain configuration and settings.',
              'Your active subscription, if any, is canceled immediately with no further charges.',
              'Profile, password, and account credentials.',
            ],
          },
          { type: 'subheading', text: 'Before you delete' },
          {
            type: 'paragraph',
            text: 'Export your links first from Links -> Export CSV to download a backup of your link library. Once your account is deleted, this data cannot be recovered.',
          },
          { type: 'subheading', text: 'What happens after' },
          {
            type: 'bullets',
            items: [
              'Active short links stop redirecting immediately.',
              'Your data is permanently removed from our systems within 30 days.',
              'Anonymized aggregate metrics may be retained for service improvement.',
            ],
          },
          {
            type: 'warning',
            text: 'Considering canceling instead? If you only want to stop paying but keep your account, cancel your subscription from Billing. You keep your links and data on the Free plan.',
          },
        ],
      },
    ],
    helpTitle: 'Need help?',
    helpBody: 'Email hello@affprof.com. We respond within 24 hours, faster for Pro users.',
  },
  es: {
    metadataTitle: 'Cuenta y configuración - Ayuda de AffProf',
    title: 'Cuenta y configuración',
    description:
      'Maneja los detalles de tu perfil, seguridad, notificaciones, y configuraciones globales de cuenta desde un solo lugar. Esta guía cubre Profile, Settings, y notificaciones.',
    backLabel: 'Volver al Centro de ayuda',
    introCards: [
      {
        title: 'Perfil',
        body: 'Nombre, short link slug, timezone, idioma, contraseña, y eliminación de cuenta.',
      },
      {
        title: 'Notificaciones',
        body: 'Alertas de links rotos, weekly digest, CC email, e historial de emails.',
      },
      {
        title: 'Defaults de cuenta',
        body: 'Default fallback URL, marcas, códigos QR, y entrada a dominio personalizado.',
      },
    ],
    tocTitle: 'En esta guía',
    sections: [
      {
        id: 'profile',
        title: 'Profile',
        icon: User,
        blocks: [
          {
            type: 'paragraph',
            text: 'Lo encuentras en Profile en el sidebar. Controla tu información personal y cómo se ven tus links cortos.',
          },
          { type: 'subheading', text: 'Name' },
          {
            type: 'paragraph',
            text: 'Tu nombre para mostrar. Aparece en el mensaje de bienvenida en Home y se usa internamente para emails de soporte. No aparece públicamente en ninguno de tus links cortos.',
          },
          { type: 'subheading', text: 'Short link slug' },
          {
            type: 'paragraph',
            text: 'Esta es la configuración más importante en tu perfil porque aparece en cada link corto de AffProf que creas. Tus links cortos siguen este patrón:',
          },
          { type: 'url', text: 'affprof.com/go/{tu-slug}/{slug-del-link}' },
          {
            type: 'paragraph',
            text: 'Por ejemplo, si tu slug es jose, tus links se ven como affprof.com/go/jose/airpods-pro.',
          },
          {
            type: 'warning',
            text: 'Ten cuidado al cambiar esto después. Cualquier link corto que ya hayas compartido se romperá si cambias tu slug. Los links con el slug viejo retornarán un 404. Si necesitas migrar a un slug nuevo, contáctanos primero a hello@affprof.com para ayudarte a evitar que se rompan.',
          },
          {
            type: 'paragraph',
            text: 'Si conectas un dominio personalizado, este slug no aparece en tus URLs con marca. Tu dominio personalizado reemplaza affprof.com/go/ y el slug de tu cuenta.',
          },
          { type: 'subheading', text: 'Timezone' },
          {
            type: 'bullets',
            items: [
              'Las vistas de analytics usan tu timezone cuando muestran clicks por día y desgloses por fecha.',
              'La programación del weekly digest usa tu timezone para que el email llegue en la mañana local.',
              'UTC es el valor por defecto. Cámbialo a tu zona horaria real para reportes precisos.',
            ],
          },
          { type: 'subheading', text: 'Language' },
          {
            type: 'bullets',
            items: [
              'Elige inglés o español para la interfaz de la app.',
              'Los emails transaccionales usan tu idioma seleccionado donde esté soportado.',
              'Los artículos del Help Center usan el mismo idioma.',
            ],
          },
        ],
      },
      {
        id: 'password',
        title: 'Password',
        icon: KeyRound,
        blocks: [
          {
            type: 'paragraph',
            text: 'Cambia tu contraseña desde Profile -> Password.',
          },
          {
            type: 'paragraph',
            text: 'Necesitas ingresar tu contraseña actual para confirmar el cambio. Después de cambiarla, te quedas con sesión iniciada en este dispositivo. Otros dispositivos con sesión iniciada necesitarán re-autenticarse la próxima vez que los uses.',
          },
          {
            type: 'tip',
            text: '¿Olvidaste tu contraseña? Cierra sesión y usa el link de olvidé mi contraseña en la página de login. Te enviaremos un link de reseteo.',
          },
        ],
      },
      {
        id: 'notifications',
        title: 'Notifications',
        icon: Bell,
        blocks: [
          {
            type: 'paragraph',
            text: 'Lo encuentras en Settings -> Notifications. Controla cuándo AffProf te envía emails.',
          },
          { type: 'subheading', text: 'Broken link alerts' },
          {
            type: 'paragraph',
            text: 'Cuando está activado, recibes un email cada vez que AffProf detecta que un link en tu cuenta está roto. Las alertas se envían como máximo una vez por link cada 24 horas, así que no te llenan el inbox si el mismo link falla varios chequeos seguidos.',
          },
          {
            type: 'paragraph',
            text: 'Puedes desactivar las alertas globalmente aquí, o por link individual en el formulario de edición del link.',
          },
          { type: 'subheading', text: 'Weekly digest' },
          {
            type: 'bullets',
            items: [
              'Total de clicks a través de todos tus links de los últimos 7 días.',
              'Links y productos con mejor performance.',
              'Cualquier link roto de esa semana.',
              'Tendencia vs. la semana anterior.',
            ],
          },
          {
            type: 'paragraph',
            text: 'Digest day te deja elegir qué día de la semana llega el digest. Elige el día que se alinee con tu rutina de reportes.',
          },
          { type: 'subheading', text: 'CC email' },
          {
            type: 'paragraph',
            text: 'Opcional. Si ingresas una dirección de email aquí, una copia de cada alerta y digest también se envía a esa dirección.',
          },
          {
            type: 'bullets',
            items: [
              'Reenviar alertas a un miembro del equipo que maneja el mantenimiento.',
              'Enviar digests a un manager de marketing o cliente.',
              'Mantener un registro en un inbox separado.',
            ],
          },
          {
            type: 'paragraph',
            text: 'El CC email no reemplaza la entrega original. Tu email principal de cuenta siempre recibe el email también.',
          },
        ],
      },
      {
        id: 'email-history',
        title: 'Email history',
        icon: Mail,
        blocks: [
          {
            type: 'paragraph',
            text: 'Lo encuentras en Settings -> Email history. Muestra cada email que AffProf ha enviado en tu nombre, con status de entrega.',
          },
          { type: 'subheading', text: 'Filtros' },
          {
            type: 'bullets',
            items: [
              'All types, Broken links, y Weekly digest filtran por tipo de email.',
              'All status, Sent, Processing, y Failed filtran por status de entrega.',
            ],
          },
          { type: 'subheading', text: 'Por qué es útil' },
          {
            type: 'bullets',
            items: [
              'Confirmar que una alerta de link roto efectivamente salió cuando esperabas.',
              'Diagnosticar si dejaste de recibir digests.',
              'Ver si el sistema está procesando emails normalmente.',
            ],
          },
          {
            type: 'paragraph',
            text: 'El history también se usa internamente para prevenir entregas duplicadas. Si una alerta se envió para un link específico en las últimas 24 horas, AffProf no enviará otra para el mismo link hasta que pase la ventana.',
          },
        ],
      },
      {
        id: 'default-fallback',
        title: 'Default fallback URL',
        icon: Settings,
        blocks: [
          {
            type: 'paragraph',
            text: 'Lo encuentras en Settings -> Default fallback URL. Es el destino de respaldo a nivel cuenta usado cuando:',
          },
          {
            type: 'bullets',
            items: [
              'Un link corto se rompe y ese link no tiene su propio fallback URL configurado.',
              'Un link corto está deshabilitado y ese link no tiene su propio fallback URL configurado.',
            ],
          },
          {
            type: 'paragraph',
            text: 'Sin un fallback por defecto, los visitantes de links rotos o deshabilitados ven una página de link no disponible. Con uno, son redirigidos a una URL de respaldo de tu elección.',
          },
          {
            type: 'tip',
            text: 'Recomendación: configura esto a una página de alta conversión en tu sitio, como tu homepage, una página de productos destacados, o una página de ofertas. Los fallbacks por link siempre tienen precedencia sobre el default.',
          },
        ],
      },
      {
        id: 'brands',
        title: 'Brands',
        icon: QrCode,
        blocks: [
          {
            type: 'paragraph',
            text: 'Lo encuentras en Settings -> Brands. Guarda combinaciones de logo y colores una vez, después aplícalas a cualquier QR code en tu cuenta. Los QR codes con marca personalizada son una feature Pro.',
          },
          { type: 'related', href: '/help/brands-qr', label: 'Guía completa: Marcas y códigos QR' },
        ],
      },
      {
        id: 'custom-domain',
        title: 'Custom domain',
        icon: Globe2,
        blocks: [
          {
            type: 'paragraph',
            text: 'Lo encuentras en Settings -> Custom domain. Reemplaza affprof.com/go/... con tu propio subdominio como links.tumarca.com. Un dominio personalizado por cuenta. Feature Pro.',
          },
          { type: 'related', href: '/help/custom-domains', label: 'Guía completa: Dominios personalizados' },
        ],
      },
      {
        id: 'delete-account',
        title: 'Delete account',
        icon: Trash2,
        blocks: [
          {
            type: 'paragraph',
            text: 'Lo encuentras en Profile -> Delete account. Remueve permanentemente tu cuenta y toda la data asociada. Esta acción no se puede deshacer.',
          },
          { type: 'subheading', text: 'Qué se elimina' },
          {
            type: 'bullets',
            items: [
              'Todos tus links de afiliado y analytics de clicks.',
              'Todos tus productos, marcas, tags, y códigos QR.',
              'Tu configuración de dominio personalizado y settings.',
              'Tu suscripción activa, si tienes, se cancela inmediatamente sin más cobros.',
              'Tu perfil, contraseña, y credenciales de cuenta.',
            ],
          },
          { type: 'subheading', text: 'Antes de eliminar' },
          {
            type: 'paragraph',
            text: 'Exporta tus links primero desde Links -> Export CSV para descargar un backup de tu librería de links. Una vez que tu cuenta es eliminada, esta data no se puede recuperar.',
          },
          { type: 'subheading', text: 'Qué pasa después' },
          {
            type: 'bullets',
            items: [
              'Los links cortos activos dejan de redirigir inmediatamente.',
              'Tu data se remueve permanentemente de nuestros sistemas dentro de 30 días.',
              'Métricas agregadas anonimizadas pueden retenerse para mejora del servicio.',
            ],
          },
          {
            type: 'warning',
            text: '¿Considerando solo cancelar? Si solo quieres dejar de pagar pero mantener tu cuenta, cancela tu suscripción desde Billing. Mantienes todos tus links y data en el plan Free.',
          },
        ],
      },
    ],
    helpTitle: '¿Necesitas ayuda?',
    helpBody: 'Escribe a hello@affprof.com. Respondemos dentro de 24 horas, más rápido para usuarios Pro.',
  },
} satisfies Record<Locale, AccountContent>;

function renderTextWithEmail(text: string) {
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

function SectionHeading({ icon: Icon, title, id }: { icon: LucideIcon; title: string; id: string }) {
  return (
    <div id={id} className="flex scroll-mt-20 items-center gap-3">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border bg-background">
        <Icon className="size-4 text-muted-foreground" />
      </div>
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
    </div>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1.5">
      {items.map((item) => (
        <li key={item} className="flex gap-2 text-sm leading-6 text-muted-foreground">
          <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary/60" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function Notice({ children, tone }: { children: ReactNode; tone: 'warning' | 'tip' }) {
  const isWarning = tone === 'warning';
  const Icon = isWarning ? AlertTriangle : Info;

  return (
    <div
      className={
        isWarning
          ? 'flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800/50 dark:bg-amber-950/30'
          : 'flex gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-800/50 dark:bg-blue-950/30'
      }
    >
      <Icon
        className={
          isWarning
            ? 'mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400'
            : 'mt-0.5 size-4 shrink-0 text-blue-600 dark:text-blue-400'
        }
      />
      <p
        className={
          isWarning
            ? 'text-sm leading-6 text-amber-800 dark:text-amber-300'
            : 'text-sm leading-6 text-blue-800 dark:text-blue-300'
        }
      >
        {children}
      </p>
    </div>
  );
}

function RenderBlock({ block }: { block: TextBlock }) {
  switch (block.type) {
    case 'paragraph':
      return <p className="text-sm leading-6 text-muted-foreground">{renderTextWithEmail(block.text)}</p>;
    case 'subheading':
      return <h3 className="pt-1 text-base font-medium">{block.text}</h3>;
    case 'url':
      return (
        <div className="rounded-xl border bg-muted/40 px-4 py-3 font-mono text-sm text-foreground">
          {block.text}
        </div>
      );
    case 'bullets':
      return <BulletList items={block.items} />;
    case 'warning':
      return <Notice tone="warning">{renderTextWithEmail(block.text)}</Notice>;
    case 'tip':
      return <Notice tone="tip">{renderTextWithEmail(block.text)}</Notice>;
    case 'related':
      return (
        <Link
          href={block.href}
          className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-primary hover:underline"
        >
          {block.label}
          <ArrowRight className="size-3.5" />
        </Link>
      );
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await getLocale()) as Locale;
  return { title: accountContent[locale].metadataTitle };
}

export default async function AccountSettingsHelpPage() {
  const locale = (await getLocale()) as Locale;
  const content = accountContent[locale];
  const tCommon = await getTranslations('common');
  const tNav = await getTranslations('nav');

  return (
    <PageLayout
      breadcrumbs={[
        { label: tCommon('home'), href: '/' },
        { label: tNav('help'), href: '/help' },
        { label: content.title },
      ]}
    >
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 py-4">
        <Link
          href="/help"
          className="inline-flex w-fit items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          {content.backLabel}
        </Link>

        <section className="rounded-2xl border bg-card p-6">
          <div className="mb-5 flex size-12 items-center justify-center rounded-2xl bg-primary/10">
            <Settings className="size-6 text-primary" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{content.title}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">{content.description}</p>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {content.introCards.map((card) => (
              <div key={card.title} className="rounded-xl border bg-muted/20 p-4">
                <div className="text-sm font-medium">{card.title}</div>
                <p className="mt-1 text-sm text-muted-foreground">{card.body}</p>
              </div>
            ))}
          </div>
        </section>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>{content.tocTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {content.sections.map(({ id, title }) => (
                <a
                  key={id}
                  href={`#${id}`}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
                >
                  <span className="size-1.5 rounded-full bg-primary/60" />
                  {title}
                </a>
              ))}
            </div>
          </CardContent>
        </Card>

        <article className="flex flex-col gap-8 rounded-2xl border bg-card p-6 md:p-8">
          {content.sections.map((section, index) => (
            <div key={section.id} className="contents">
              {index > 0 ? <Separator className="my-0" /> : null}
              <section className="flex flex-col gap-4">
                <SectionHeading id={section.id} icon={section.icon} title={section.title} />
                {section.blocks.map((block, blockIndex) => (
                  <RenderBlock key={`${section.id}-${blockIndex}`} block={block} />
                ))}
              </section>
            </div>
          ))}
        </article>

        <section className="rounded-2xl border bg-card p-6">
          <p className="text-sm font-medium">{content.helpTitle}</p>
          <p className="mt-1 text-sm text-muted-foreground">{renderTextWithEmail(content.helpBody)}</p>
        </section>
      </div>
    </PageLayout>
  );
}

import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Globe2,
  HelpCircle,
  Mail,
  RefreshCcw,
  Route,
  ShieldCheck,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import { getLocale, getTranslations } from 'next-intl/server';

import { PageLayout } from '@/components/sidebar/page-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { Locale } from '@/i18n/config';

type Block =
  | { type: 'paragraph'; text: string }
  | { type: 'bullets'; items: string[] }
  | { type: 'steps'; items: string[] }
  | { type: 'note'; text: string }
  | { type: 'screenshot'; label: string }
  | { type: 'records'; records: Array<{ title: string; rows: Array<{ field: string; value: string }> }> };

type Section = {
  id: string;
  icon: LucideIcon;
  title: string;
  description?: string;
  blocks: Block[];
};

type CustomDomainContent = {
  title: string;
  description: string;
  note: string;
  changesTitle: string;
  changes: string[];
  sections: Section[];
  troubleshootingTitle: string;
  troubleshooting: Array<{ title: string; items: string[] }>;
  changeTitle: string;
  changeSections: Array<{ title: string; items: string[] }>;
  limitationsTitle: string;
  limitations: string[];
  questionsTitle: string;
  faqs: Array<{ question: string; answer: string }>;
  helpTitle: string;
  helpBody: string;
  helpItems: string[];
};

const content = {
  en: {
    title: 'Custom domains',
    description:
      'Replace AffProf’s default domain with your own subdomain, like `go.yourbrand.com` or `links.yourbrand.com`, on every short link in your account.',
    note:
      'Custom domains are a Pro feature. One custom domain per account. Setup takes about 5 minutes plus DNS propagation time.',
    changesTitle: 'What changes when you add a custom domain',
    changes: [
      'Every short link in your account automatically resolves through the new domain.',
      'Old `affprof.com/go/...` URLs continue to work. Anything already shared keeps redirecting.',
      'AffProf provisions an SSL certificate automatically, so HTTPS works out of the box.',
      'Analytics, monitoring, fallbacks, and QR codes keep working identically. Only the URL domain changes.',
    ],
    sections: [
      {
        id: 'before',
        icon: ShieldCheck,
        title: 'Before you start',
        description: 'Make sure you have the right domain access before adding anything in AffProf.',
        blocks: [
          {
            type: 'bullets',
            items: [
              'A domain you own at any registrar, such as Namecheap, GoDaddy, Cloudflare, or Squarespace Domains.',
              'Access to DNS settings, usually in your registrar dashboard or Cloudflare.',
              'A subdomain dedicated to AffProf, such as `go`, `links`, `l`, `to`, or `lnk`.',
            ],
          },
          {
            type: 'note',
            text: 'Subdomains only: AffProf does not support root domains yet. `yourbrand.com` will not work; use something like `go.yourbrand.com`.',
          },
        ],
      },
      {
        id: 'step-1',
        icon: Globe2,
        title: 'Step 1: Add your subdomain',
        description: 'Go to **Settings -> Custom domain**.',
        blocks: [
          { type: 'screenshot', label: 'custom-domain-step1.png' },
          {
            type: 'steps',
            items: [
              'Type your full subdomain in the **Subdomain** field, for example `go.yourbrand.com`.',
              'Click **Add domain**.',
              'AffProf saves it as Pending verification and shows the DNS records you need.',
            ],
          },
        ],
      },
      {
        id: 'step-2',
        icon: Route,
        title: 'Step 2: Configure your DNS records',
        description: 'Add both records shown in AffProf. Both are required.',
        blocks: [
          { type: 'screenshot', label: 'custom-domain-step2.png' },
          {
            type: 'records',
            records: [
              {
                title: 'TXT record for verification',
                rows: [
                  { field: 'Type', value: 'TXT' },
                  { field: 'Name', value: '`_affprof.go.yourbrand.com` or the exact name shown in your dashboard' },
                  { field: 'Value', value: '`affprof-verify=...` or the long string shown in your dashboard' },
                  { field: 'TTL', value: 'Default, usually 3600 seconds, or Auto in Cloudflare' },
                ],
              },
              {
                title: 'CNAME record for routing',
                rows: [
                  { field: 'Type', value: 'CNAME' },
                  { field: 'Name', value: '`go.yourbrand.com` or your full subdomain' },
                  { field: 'Value', value: '`cname.affprof.com`' },
                  { field: 'TTL', value: 'Default' },
                  { field: 'Cloudflare proxy', value: 'OFF / DNS only for initial verification' },
                ],
              },
            ],
          },
          {
            type: 'note',
            text: 'Use the copy buttons in AffProf to grab each value exactly. A typo, extra space, missing dot, or capitalization issue can make verification fail.',
          },
          {
            type: 'bullets',
            items: [
              'Cloudflare: Dashboard -> your domain -> DNS -> Records -> Add record.',
              'Namecheap: Dashboard -> Domain List -> Manage -> Advanced DNS -> Add New Record.',
              'GoDaddy: Dashboard -> Products -> DNS -> Add -> choose record type.',
              'Squarespace Domains: DNS section -> Manage custom records.',
            ],
          },
        ],
      },
      {
        id: 'step-3',
        icon: CheckCircle2,
        title: 'Step 3: Click Verify',
        description: 'Return to **Settings -> Custom domain** and click **Verify** next to your domain.',
        blocks: [
          {
            type: 'paragraph',
            text: 'DNS changes usually propagate in a few minutes, but can occasionally take up to 24 hours. If verification fails the first time, wait 5-10 minutes and click **Verify** again.',
          },
          { type: 'screenshot', label: 'custom-domain-step3.png' },
          {
            type: 'paragraph',
            text: 'When verification succeeds, the domain is marked **Verified** and **Primary**. AffProf automatically issues an SSL certificate. Within a few seconds, short links resolve through the new domain.',
          },
        ],
      },
    ],
    troubleshootingTitle: 'Troubleshooting',
    troubleshooting: [
      {
        title: 'Verification keeps failing',
        items: [
          'The TXT record name is wrong. AffProf needs the underscore prefix, such as `_affprof.go.yourbrand.com`.',
          'Your registrar may auto-append the root domain, creating `_affprof.go.yourbrand.com.yourbrand.com` by accident.',
          'The CNAME value must be exactly `cname.affprof.com`, with no `https://`, extra spaces, or trailing dot.',
          'Cloudflare proxy must be OFF / DNS only for initial verification.',
          'DNS may not have propagated yet. Use dnschecker.org to confirm both records are visible globally.',
          'TXT and CNAME are different record types. Make sure each one was added with the correct type.',
        ],
      },
      {
        title: 'Verification works but links do not load',
        items: [
          'SSL provisioning may need 2-5 extra minutes after verification.',
          'Test in an incognito window and confirm you are using `https://`.',
          'Try a different browser or device to rule out cache.',
          'If links still fail after 30 minutes, email hello@affprof.com with your domain.',
        ],
      },
      {
        title: 'Links work but show a security warning',
        items: [
          'The SSL certificate may still be provisioning.',
          'There may be a mismatch between the typed domain and issued certificate.',
          'Wait 10-15 minutes and refresh. If it persists, contact us.',
        ],
      },
      {
        title: 'The domain is verified but not Primary',
        items: [
          'AffProf automatically marks verified custom domains as Primary.',
          'Refresh the Settings page. If the badge is still missing, contact hello@affprof.com.',
        ],
      },
    ],
    changeTitle: 'Changing or removing your custom domain',
    changeSections: [
      {
        title: 'To remove it',
        items: [
          'Click **Remove** next to the domain in Settings -> Custom domain.',
          'All short links revert to the default `affprof.com/go/...` format immediately.',
          'Old links shared with the custom domain stop working only if you remove DNS records at your registrar.',
          'You can add a different custom domain anytime.',
        ],
      },
      {
        title: 'To change to a different subdomain',
        items: [
          'Remove the current domain.',
          'Add the new subdomain, for example `links.yourbrand.com` instead of `go.yourbrand.com`.',
          'Configure new DNS records. TXT and CNAME values will be different.',
          'Click Verify.',
          'If you want the old subdomain to keep working during transition, do not delete old DNS records until nothing important references them.',
        ],
      },
    ],
    limitationsTitle: 'Limitations',
    limitations: [
      'One custom domain per account.',
      'Subdomains only. Root domains like `yourbrand.com` are not supported.',
      'Per-link domain selection is not supported. The custom domain replaces the default for all links.',
    ],
    questionsTitle: 'Common questions',
    faqs: [
      {
        question: 'Does my custom domain affect analytics?',
        answer:
          'No. Analytics work identically on the default AffProf domain and on a custom domain.',
      },
      {
        question: 'Will my QR codes update to use the new domain?',
        answer:
          'QR codes generated after adding the custom domain use it. Already-downloaded PNGs do not change; regenerate them if needed.',
      },
      {
        question: 'Does the custom domain affect link health monitoring?',
        answer:
          'No. AffProf monitors destination URLs, not your custom domain. Monitoring works identically.',
      },
      {
        question: 'Can I use a wildcard subdomain?',
        answer: 'Not currently. Each subdomain must be added explicitly.',
      },
      {
        question: 'My DNS provider does not support CNAME at the root.',
        answer:
          'That is expected. CNAME at root domains is a DNS limitation, which is why AffProf supports subdomains.',
      },
    ],
    helpTitle: 'Need help with verification?',
    helpBody: 'Email hello@affprof.com with:',
    helpItems: [
      'Your AffProf account email.',
      'The domain you are trying to verify.',
      'A screenshot of your DNS panel showing both TXT and CNAME records.',
      'We respond within 24 hours, faster for Pro users.',
    ],
  },
  es: {
    title: 'Dominios personalizados',
    description:
      'Reemplaza el dominio por defecto de AffProf con tu propio subdominio, como `go.tumarca.com` o `links.tumarca.com`, en cada link corto de tu cuenta.',
    note:
      'Los dominios personalizados son una feature Pro. Un dominio personalizado por cuenta. La configuración toma unos 5 minutos más el tiempo de propagación DNS.',
    changesTitle: 'Qué cambia al agregar un dominio personalizado',
    changes: [
      'Cada link corto en tu cuenta automáticamente resuelve a través del nuevo dominio.',
      'Las URLs antiguas `affprof.com/go/...` siguen funcionando. Todo lo ya compartido sigue redirigiendo.',
      'AffProf provee un certificado SSL automáticamente, así que HTTPS funciona out of the box.',
      'Analytics, monitoreo, fallbacks y QR codes siguen funcionando igual. Solo cambia el dominio en el URL.',
    ],
    sections: [
      {
        id: 'before',
        icon: ShieldCheck,
        title: 'Antes de empezar',
        description: 'Asegúrate de tener acceso correcto al dominio antes de agregar algo en AffProf.',
        blocks: [
          {
            type: 'bullets',
            items: [
              'Un dominio que sea tuyo en cualquier registrador, como Namecheap, GoDaddy, Cloudflare o Squarespace Domains.',
              'Acceso a la configuración DNS, usualmente en tu registrador o Cloudflare.',
              'Un subdominio dedicado a AffProf, como `go`, `links`, `l`, `to`, o `lnk`.',
            ],
          },
          {
            type: 'note',
            text: 'Solo subdominios: AffProf no soporta dominios raíz todavía. `tumarca.com` no funciona; usa algo como `go.tumarca.com`.',
          },
        ],
      },
      {
        id: 'step-1',
        icon: Globe2,
        title: 'Paso 1: Agrega tu subdominio',
        description: 'Ve a **Settings -> Custom domain**.',
        blocks: [
          { type: 'screenshot', label: 'custom-domain-step1.png' },
          {
            type: 'steps',
            items: [
              'Escribe tu subdominio completo en **Subdomain**, por ejemplo `go.tumarca.com`.',
              'Haz clic en **Add domain**.',
              'AffProf lo guarda como Pending verification y muestra los registros DNS necesarios.',
            ],
          },
        ],
      },
      {
        id: 'step-2',
        icon: Route,
        title: 'Paso 2: Configura tus registros DNS',
        description: 'Agrega ambos registros mostrados en AffProf. Los dos son requeridos.',
        blocks: [
          { type: 'screenshot', label: 'custom-domain-step2.png' },
          {
            type: 'records',
            records: [
              {
                title: 'Registro TXT para verificación',
                rows: [
                  { field: 'Tipo', value: 'TXT' },
                  { field: 'Nombre', value: '`_affprof.go.tumarca.com` o el nombre exacto mostrado en tu dashboard' },
                  { field: 'Valor', value: '`affprof-verify=...` o el string largo mostrado en tu dashboard' },
                  { field: 'TTL', value: 'Default, usualmente 3600 segundos, o Auto en Cloudflare' },
                ],
              },
              {
                title: 'Registro CNAME para routing',
                rows: [
                  { field: 'Tipo', value: 'CNAME' },
                  { field: 'Nombre', value: '`go.tumarca.com` o tu subdominio completo' },
                  { field: 'Valor', value: '`cname.affprof.com`' },
                  { field: 'TTL', value: 'Default' },
                  { field: 'Proxy Cloudflare', value: 'OFF / DNS only para la verificación inicial' },
                ],
              },
            ],
          },
          {
            type: 'note',
            text: 'Usa los botones de copiar en AffProf para tomar cada valor exactamente. Un typo, espacio extra, punto faltante o problema de mayúsculas puede causar que falle la verificación.',
          },
          {
            type: 'bullets',
            items: [
              'Cloudflare: Dashboard -> tu dominio -> DNS -> Records -> Add record.',
              'Namecheap: Dashboard -> Domain List -> Manage -> Advanced DNS -> Add New Record.',
              'GoDaddy: Dashboard -> Products -> DNS -> Add -> elegir tipo de registro.',
              'Squarespace Domains: sección DNS -> Manage custom records.',
            ],
          },
        ],
      },
      {
        id: 'step-3',
        icon: CheckCircle2,
        title: 'Paso 3: Haz clic en Verify',
        description: 'Vuelve a **Settings -> Custom domain** y haz clic en **Verify** al lado del dominio.',
        blocks: [
          {
            type: 'paragraph',
            text: 'Los cambios DNS usualmente se propagan en pocos minutos, pero ocasionalmente pueden tomar hasta 24 horas. Si la verificación falla la primera vez, espera 5-10 minutos y haz clic en **Verify** de nuevo.',
          },
          { type: 'screenshot', label: 'custom-domain-step3.png' },
          {
            type: 'paragraph',
            text: 'Cuando la verificación tiene éxito, el dominio queda marcado como **Verified** y **Primary**. AffProf emite un certificado SSL automáticamente. Dentro de pocos segundos, los links cortos resuelven a través del nuevo dominio.',
          },
        ],
      },
    ],
    troubleshootingTitle: 'Solución de problemas',
    troubleshooting: [
      {
        title: 'La verificación sigue fallando',
        items: [
          'El nombre del registro TXT está mal. AffProf necesita el prefijo underscore, como `_affprof.go.tumarca.com`.',
          'Tu registrador puede agregar automáticamente el dominio raíz, creando `_affprof.go.tumarca.com.tumarca.com` por accidente.',
          'El valor CNAME debe ser exactamente `cname.affprof.com`, sin `https://`, espacios extra, ni punto final.',
          'El proxy de Cloudflare debe estar OFF / DNS only para la verificación inicial.',
          'El DNS quizás no se ha propagado. Usa dnschecker.org para confirmar que ambos registros son visibles globalmente.',
          'TXT y CNAME son tipos de registro diferentes. Asegúrate de que cada uno fue agregado con el tipo correcto.',
        ],
      },
      {
        title: 'La verificación funciona pero los links no cargan',
        items: [
          'El aprovisionamiento SSL puede necesitar 2-5 minutos extra después de la verificación.',
          'Prueba en incógnito y confirma que usas `https://`.',
          'Prueba otro browser o dispositivo para descartar caché.',
          'Si los links siguen fallando después de 30 minutos, escribe a hello@affprof.com con tu dominio.',
        ],
      },
      {
        title: 'Los links funcionan pero muestran warning de seguridad',
        items: [
          'El certificado SSL puede seguir aprovisionándose.',
          'Puede haber mismatch entre el dominio escrito y el certificado emitido.',
          'Espera 10-15 minutos y refresca. Si persiste, contáctanos.',
        ],
      },
      {
        title: 'El dominio está verificado pero no es Primary',
        items: [
          'AffProf marca automáticamente los dominios personalizados verificados como Primary.',
          'Refresca Settings. Si el badge sigue faltando, contacta a hello@affprof.com.',
        ],
      },
    ],
    changeTitle: 'Cambiando o removiendo tu dominio personalizado',
    changeSections: [
      {
        title: 'Para removerlo',
        items: [
          'Haz clic en **Remove** al lado del dominio en Settings -> Custom domain.',
          'Todos tus links cortos revierten al formato default `affprof.com/go/...` inmediatamente.',
          'Los links viejos compartidos con el dominio personalizado dejan de funcionar solo si remueves los registros DNS en tu registrador.',
          'Puedes agregar un dominio personalizado diferente cuando quieras.',
        ],
      },
      {
        title: 'Para cambiar a un subdominio diferente',
        items: [
          'Remueve el dominio actual.',
          'Agrega el nuevo subdominio, por ejemplo `links.tumarca.com` en vez de `go.tumarca.com`.',
          'Configura nuevos registros DNS. Los valores TXT y CNAME serán diferentes.',
          'Haz clic en Verify.',
          'Si quieres que el subdominio viejo siga funcionando durante la transición, no borres los DNS viejos hasta que nada importante los referencie.',
        ],
      },
    ],
    limitationsTitle: 'Limitaciones',
    limitations: [
      'Un dominio personalizado por cuenta.',
      'Solo subdominios. Dominios raíz como `tumarca.com` no son soportados.',
      'La selección de dominio por link no es soportada. El dominio personalizado reemplaza el default para todos los links.',
    ],
    questionsTitle: 'Preguntas comunes',
    faqs: [
      {
        question: '¿Mi dominio personalizado afecta mis analytics?',
        answer:
          'No. Analytics funciona igual en el dominio default de AffProf y en un dominio personalizado.',
      },
      {
        question: '¿Mis QR codes se actualizarán para usar el nuevo dominio?',
        answer:
          'Los QR generados después de agregar el dominio personalizado lo usan. Los PNGs ya descargados no cambian; regenéralos si hace falta.',
      },
      {
        question: '¿El dominio personalizado afecta el monitoreo de salud?',
        answer:
          'No. AffProf monitorea URLs de destino, no tu dominio personalizado. El monitoreo funciona igual.',
      },
      {
        question: '¿Puedo usar un subdominio wildcard?',
        answer: 'Actualmente no. Cada subdominio debe agregarse explícitamente.',
      },
      {
        question: 'Mi proveedor DNS no soporta CNAME en la raíz.',
        answer:
          'Eso es esperado. CNAME en dominios raíz es una limitación de DNS, por eso AffProf soporta subdominios.',
      },
    ],
    helpTitle: '¿Necesitas ayuda con la verificación?',
    helpBody: 'Escribe a hello@affprof.com con:',
    helpItems: [
      'El email de tu cuenta de AffProf.',
      'El dominio que estás tratando de verificar.',
      'Un screenshot de tu panel DNS mostrando los registros TXT y CNAME.',
      'Respondemos dentro de 24 horas, más rápido para usuarios Pro.',
    ],
  },
} satisfies Record<Locale, CustomDomainContent>;

function InlineMarkdown({ text }: { text: string }) {
  const nodes: ReactNode[] = [];
  const pattern = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > cursor) nodes.push(text.slice(cursor, match.index));
    const token = match[0];

    if (token.startsWith('**')) {
      nodes.push(
        <strong key={match.index} className="font-medium text-foreground">
          {token.slice(2, -2)}
        </strong>,
      );
    } else {
      nodes.push(
        <code key={match.index} className="rounded bg-muted px-1 py-0.5 font-mono text-[0.8em] text-foreground">
          {token.slice(1, -1)}
        </code>,
      );
    }

    cursor = match.index + token.length;
  }

  if (cursor < text.length) nodes.push(text.slice(cursor));
  return nodes;
}

function EmailText({ text }: { text: string }) {
  const [before, after] = text.split('hello@affprof.com');
  if (after === undefined) return <InlineMarkdown text={text} />;

  return (
    <>
      <InlineMarkdown text={before} />
      <a className="font-medium text-primary hover:underline" href="mailto:hello@affprof.com">
        hello@affprof.com
      </a>
      <InlineMarkdown text={after} />
    </>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item} className="flex gap-2 text-sm leading-6 text-muted-foreground">
          <CheckCircle2 className="mt-1 size-4 shrink-0 text-primary" />
          <span>
            <EmailText text={item} />
          </span>
        </li>
      ))}
    </ul>
  );
}

function StepList({ items }: { items: string[] }) {
  return (
    <ol className="space-y-2">
      {items.map((item, index) => (
        <li key={item} className="flex gap-3 text-sm leading-6 text-muted-foreground">
          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
            {index + 1}
          </span>
          <span>
            <EmailText text={item} />
          </span>
        </li>
      ))}
    </ol>
  );
}

function RenderBlock({ block }: { block: Block }) {
  switch (block.type) {
    case 'paragraph':
      return <p className="text-sm leading-6 text-muted-foreground"><EmailText text={block.text} /></p>;
    case 'bullets':
      return <BulletList items={block.items} />;
    case 'steps':
      return <StepList items={block.items} />;
    case 'note':
      return (
        <div className="rounded-xl border bg-muted/30 p-4 text-sm leading-6 text-muted-foreground">
          <EmailText text={block.text} />
        </div>
      );
    case 'screenshot':
      return (
        <figure className="overflow-hidden rounded-xl border bg-muted/20">
          <Image
            src={`/help/${block.label}`}
            alt={block.label}
            width={1440}
            height={900}
            className="h-auto w-full"
            sizes="(min-width: 1024px) 50vw, 100vw"
          />
        </figure>
      );
    case 'records':
      return (
        <div className="grid gap-4">
          {block.records.map((record) => (
            <div key={record.title} className="overflow-hidden rounded-xl border">
              <div className="border-b bg-muted/30 px-4 py-3 text-sm font-medium">{record.title}</div>
              <div className="divide-y">
                {record.rows.map((row) => (
                  <div key={row.field} className="grid gap-2 px-4 py-3 text-sm md:grid-cols-[160px_1fr]">
                    <div className="font-medium text-foreground">{row.field}</div>
                    <div className="text-muted-foreground">
                      <EmailText text={row.value} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      );
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await getLocale()) as Locale;
  return { title: content[locale].title };
}

export default async function CustomDomainsHelpPage() {
  const locale = (await getLocale()) as Locale;
  const page = content[locale];
  const tCommon = await getTranslations('common');
  const tNav = await getTranslations('nav');
  const tHelp = await getTranslations('help');

  return (
    <PageLayout
      breadcrumbs={[
        { label: tCommon('home'), href: '/' },
        { label: tNav('help'), href: '/help' },
        { label: page.title },
      ]}
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 py-4">
        <Link
          href="/help"
          className="inline-flex w-fit items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          {tHelp('backToHelp')}
        </Link>

        <section className="rounded-2xl border bg-card p-6">
          <div className="mb-5 flex size-12 items-center justify-center rounded-2xl bg-primary/10">
            <Globe2 className="size-6 text-primary" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{page.title}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
            <EmailText text={page.description} />
          </p>
          <div className="mt-4 rounded-xl border bg-muted/30 p-4 text-sm leading-6 text-muted-foreground">
            {page.note}
          </div>
        </section>

        <section className="rounded-2xl border bg-card p-6">
          <h2 className="text-xl font-semibold">{page.changesTitle}</h2>
          <div className="mt-4">
            <BulletList items={page.changes} />
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          {page.sections.map(({ id, icon: Icon, title, description, blocks }) => (
            <Card key={id} id={id} className="scroll-mt-20 rounded-2xl">
              <CardHeader>
                <div className="flex items-start gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border bg-background">
                    <Icon className="size-5 text-muted-foreground" />
                  </div>
                  <div>
                    <CardTitle>{title}</CardTitle>
                    {description ? (
                      <CardDescription className="mt-1">
                        <EmailText text={description} />
                      </CardDescription>
                    ) : null}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {blocks.map((block, index) => (
                  <RenderBlock key={`${id}-${index}`} block={block} />
                ))}
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="rounded-2xl border bg-muted/20 p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 size-5 text-muted-foreground" />
            <h2 className="text-xl font-semibold">{page.troubleshootingTitle}</h2>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {page.troubleshooting.map((item) => (
              <Card key={item.title} className="rounded-2xl">
                <CardHeader>
                  <CardTitle>{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <BulletList items={item.items} />
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border bg-card p-6">
          <div className="flex items-start gap-3">
            <RefreshCcw className="mt-0.5 size-5 text-muted-foreground" />
            <h2 className="text-xl font-semibold">{page.changeTitle}</h2>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {page.changeSections.map((item) => (
              <Card key={item.title} className="rounded-2xl">
                <CardHeader>
                  <CardTitle>{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <BulletList items={item.items} />
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>{page.limitationsTitle}</CardTitle>
              <CardDescription>
                <Wrench className="mr-2 inline size-4" />
                {page.title}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BulletList items={page.limitations} />
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>{page.questionsTitle}</CardTitle>
              <CardDescription>
                <HelpCircle className="mr-2 inline size-4" />
                FAQ
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {page.faqs.map((faq) => (
                <div key={faq.question}>
                  <div className="text-sm font-medium">{faq.question}</div>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    <EmailText text={faq.answer} />
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <Separator />

        <section className="rounded-2xl border bg-card p-5">
          <div className="flex items-start gap-3">
            <Mail className="mt-0.5 size-5 text-muted-foreground" />
            <div>
              <h2 className="text-xl font-semibold">{page.helpTitle}</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                <EmailText text={page.helpBody} />
              </p>
              <div className="mt-4">
                <BulletList items={page.helpItems} />
              </div>
            </div>
          </div>
        </section>
      </div>
    </PageLayout>
  );
}

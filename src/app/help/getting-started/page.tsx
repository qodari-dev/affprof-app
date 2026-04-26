import type { Metadata } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';
import {
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  HelpCircle,
  Link2,
  Mail,
  QrCode,
  Rocket,
  ShieldCheck,
  ShoppingBag,
  User,
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
  | { type: 'note'; text: string };

type Section = {
  id: string;
  icon: LucideIcon;
  title: string;
  description?: string;
  blocks: Block[];
};

type GettingStartedContent = {
  title: string;
  description: string;
  outcomesTitle: string;
  outcomes: string[];
  skipNote: string;
  sections: Section[];
  nextTitle: string;
  nextItems: Array<{ title: string; body: string; href: string; linkLabel: string }>;
  questionsTitle: string;
  faqs: Array<{ question: string; answer: string }>;
  helpTitle: string;
  helpBody: string;
};

const content = {
  en: {
    title: 'Getting started with AffProf',
    description:
      'A 15-minute walkthrough to your first tracked link. Follow these steps in order; each one builds on the last.',
    outcomesTitle: 'By the end you will have',
    outcomes: [
      'A product set up.',
      'Your first short link with UTMs and a fallback.',
      'A QR code, if you need one.',
      'Health monitoring active.',
      'Confidence to scale to your full link library.',
    ],
    skipNote:
      'If you have already done some of these steps, skip ahead. The structure is linear, but the app is flexible once you are set up.',
    sections: [
      {
        id: 'before',
        icon: User,
        title: 'Before you start',
        description: 'Make sure your profile is complete before creating links.',
        blocks: [
          {
            type: 'bullets',
            items: [
              'Name, shown in welcome messages.',
              '**Short link slug**: appears in every short URL you create. Pick something clean and short. Changing it later breaks links already shared.',
              'Timezone, used for analytics displays.',
              'Language.',
            ],
          },
        ],
      },
      {
        id: 'product',
        icon: ShoppingBag,
        title: 'Step 1: Create your first product',
        description: 'Every link belongs to a product, so create one first.',
        blocks: [
          {
            type: 'steps',
            items: [
              'Go to **Products -> New product**.',
              'Enter a specific name, such as `Blue Yeti Microphone`, `Notion`, or `My Tech Blog`.',
              'Avoid vague names like `Stuff`, `Links`, or `Test`.',
              'Optionally add a description and image.',
              'Save.',
            ],
          },
          {
            type: 'note',
            text: 'If you are not sure what your first product should be, pick the affiliate link you promoted most recently. For deeper organization concepts, see [Products, links & tags](/help/products-links-tags).',
          },
        ],
      },
      {
        id: 'link',
        icon: Link2,
        title: 'Step 2: Create your first link',
        description: 'This is the core action in AffProf. Everything else flows from here.',
        blocks: [
          {
            type: 'steps',
            items: [
              'Go to **Links -> New link**.',
              'In **Basic info**, choose the product you just created.',
              'Paste your full affiliate URL as **Base URL**.',
              'Set **Platform**, such as `amazon`, `shareasale`, or `notion`.',
              'Choose a memorable **Slug**, such as `blue-yeti-amazon`, or click **Suggest**.',
              'Leave **Link availability** on.',
            ],
          },
          {
            type: 'bullets',
            items: [
              'Optional UTMs: use `utm_source`, `utm_medium`, and `utm_campaign` for most tracking needs.',
              'Recommended fallback: set a **Fallback URL** in Options so broken destinations can still redirect somewhere useful. See [Fallback URLs & link health](/help/fallbacks).',
              'Optional tags: add existing tags or create new ones in **Tags**.',
            ],
          },
          {
            type: 'paragraph',
            text: 'Click **Create link**. Then copy the short URL from the Links table and test it in a private browser window.',
          },
          {
            type: 'note',
            text: 'Checkpoint: if your link redirects correctly, you are most of the way there. If it does not, double-check the Base URL and try again.',
          },
        ],
      },
      {
        id: 'qr',
        icon: QrCode,
        title: 'Step 3: Generate a QR code',
        description: 'Optional, useful for videos, presentations, packaging, or physical placements.',
        blocks: [
          {
            type: 'steps',
            items: [
              'In the Links table, find your link.',
              'Open the actions menu and click **QR Code**.',
              'On Free, download the standard black-and-white QR.',
              'On Pro, create a brand in **Settings -> Brands -> Add brand**, then choose it in the QR dialog.',
              'Click **Download PNG**.',
            ],
          },
          {
            type: 'note',
            text: 'For more on branded QRs, see [Brands & QR codes](/help/brands-qr).',
          },
        ],
      },
      {
        id: 'monitoring',
        icon: ShieldCheck,
        title: 'Step 4: Confirm health monitoring is working',
        description: 'Monitoring is on by default, but verify alerts are enabled.',
        blocks: [
          {
            type: 'bullets',
            items: [
              'Free: every link is checked once per day.',
              'Pro: every link is checked every 6 hours.',
            ],
          },
          {
            type: 'steps',
            items: [
              'Go to **Settings -> Notifications**.',
              'Confirm **Broken link alerts** is on.',
              'Optionally add a **CC email** for a teammate.',
              'Manually test from Links by opening the link actions menu and clicking **Check link**.',
            ],
          },
          {
            type: 'note',
            text: 'The result appears in the link analytics under **Recent checks**. For details, see [Fallback URLs & link health](/help/fallbacks).',
          },
        ],
      },
      {
        id: 'analytics',
        icon: BarChart3,
        title: 'Step 5: Share your link and watch analytics',
        description: 'Once your link receives clicks, explore the results.',
        blocks: [
          {
            type: 'steps',
            items: [
              'Go to **Dashboard** to see overall traffic.',
              'Click your link in **Top performing links**.',
              'Open the **Analytics** tab to see clicks by source, device, country, and more.',
            ],
          },
          {
            type: 'note',
            text: 'Checkpoint: once you see clicks in analytics, you are fully set up. Everything else is scaling and refinement. See [Dashboard & analytics](/help/dashboard-analytics).',
          },
        ],
      },
    ],
    nextTitle: 'What to do next',
    nextItems: [
      {
        title: 'Bring over many links',
        body: 'Use **Links -> Import CSV** to upload or start from the template. This is fastest for 10+ links.',
        href: '/help/import-export',
        linkLabel: 'Import & export links',
      },
      {
        title: 'Use your own domain',
        body: 'Replace `affprof.com/go/yourslug/linkname` with `links.yourbrand.com/linkname` on Pro.',
        href: '/help/custom-domains',
        linkLabel: 'Custom domains',
      },
      {
        title: 'Organize your library',
        body: 'Understand product, link, and tag relationships that scale well.',
        href: '/help/products-links-tags',
        linkLabel: 'Products, links & tags',
      },
      {
        title: 'Lock down account settings',
        body: 'Set a strong password, default fallback URL, and email notification preferences.',
        href: '/help/account-settings',
        linkLabel: 'Account & settings',
      },
    ],
    questionsTitle: 'Common questions while getting started',
    faqs: [
      {
        question: "My short link does not redirect. What's wrong?",
        answer:
          'Test the Base URL directly first. If it fails, the destination is the issue. If the Base URL works but the short link does not, contact hello@affprof.com.',
      },
      {
        question: 'The slug I want is already taken. What now?',
        answer:
          'Slugs are unique within your account. Add a number, platform, or channel, such as `blue-yeti-2`, `blue-yeti-amazon`, or `blue-yeti-yt`.',
      },
      {
        question: 'Can I edit a link after creating it?',
        answer:
          'Yes. Anything except the slug can be changed. The slug stays fixed because changing it would break short URLs already shared.',
      },
      {
        question: 'Why does my link show broken already?',
        answer:
          'Health checks detect 404s, timeouts, certificate errors, and other destination issues. Check Recent checks, fix the destination, then run a manual check.',
      },
      {
        question: 'Where do I see my plan and billing?',
        answer:
          'Go to Billing. See Billing & subscription for plans, trials, refunds, and cancellation.',
      },
    ],
    helpTitle: 'Need help?',
    helpBody:
      'If you are stuck on any step, email hello@affprof.com with what you tried and what happened. We respond within 24 hours, faster for Pro users.',
  },
  es: {
    title: 'Empezando con AffProf',
    description:
      'Un walkthrough de 15 minutos hasta tu primer link trackeado. Sigue estos pasos en orden; cada uno construye sobre el anterior.',
    outcomesTitle: 'Al final tendrás',
    outcomes: [
      'Un producto configurado.',
      'Tu primer link corto con UTMs y fallback.',
      'Un código QR, si lo necesitas.',
      'Monitoreo de salud activo.',
      'Confianza para escalar a tu librería completa.',
    ],
    skipNote:
      'Si ya hiciste algunos pasos, salta adelante. La estructura es lineal, pero la app es flexible una vez configurado.',
    sections: [
      {
        id: 'before',
        icon: User,
        title: 'Antes de empezar',
        description: 'Asegúrate de completar tu perfil antes de crear links.',
        blocks: [
          {
            type: 'bullets',
            items: [
              'Name, mostrado en mensajes de bienvenida.',
              '**Short link slug**: aparece en cada URL corto que creas. Elige algo limpio y corto. Cambiarlo después rompe links ya compartidos.',
              'Timezone, usado para vistas de analytics.',
              'Language.',
            ],
          },
        ],
      },
      {
        id: 'product',
        icon: ShoppingBag,
        title: 'Paso 1: Crea tu primer producto',
        description: 'Cada link pertenece a un producto, así que crea uno primero.',
        blocks: [
          {
            type: 'steps',
            items: [
              'Ve a **Products -> New product**.',
              'Ingresa un nombre específico, como `Blue Yeti Microphone`, `Notion`, o `Mi Blog de Tech`.',
              'Evita nombres vagos como `Cosas`, `Links`, o `Test`.',
              'Opcionalmente agrega descripción e imagen.',
              'Guarda.',
            ],
          },
          {
            type: 'note',
            text: 'Si no estás seguro de tu primer producto, elige el link de afiliado que promocionaste más recientemente. Para conceptos más profundos, ve [Productos, links y tags](/help/products-links-tags).',
          },
        ],
      },
      {
        id: 'link',
        icon: Link2,
        title: 'Paso 2: Crea tu primer link',
        description: 'Esta es la acción central de AffProf. Todo lo demás fluye desde aquí.',
        blocks: [
          {
            type: 'steps',
            items: [
              'Ve a **Links -> New link**.',
              'En **Basic info**, elige el producto que acabas de crear.',
              'Pega tu URL afiliado completo como **Base URL**.',
              'Configura **Platform**, como `amazon`, `shareasale`, o `notion`.',
              'Elige un **Slug** memorable, como `blue-yeti-amazon`, o haz clic en **Suggest**.',
              'Deja **Link availability** activado.',
            ],
          },
          {
            type: 'bullets',
            items: [
              'UTMs opcionales: usa `utm_source`, `utm_medium`, y `utm_campaign` para la mayoría de tracking.',
              'Fallback recomendado: configura un **Fallback URL** en Options para que destinos rotos todavía redirijan a algo útil. Ve [Fallback URLs y salud de links](/help/fallbacks).',
              'Tags opcionales: agrega tags existentes o crea nuevos en **Tags**.',
            ],
          },
          {
            type: 'paragraph',
            text: 'Haz clic en **Create link**. Luego copia el URL corto desde la tabla de Links y pruébalo en una ventana privada.',
          },
          {
            type: 'note',
            text: 'Checkpoint: si tu link redirige correctamente, ya estás casi listo. Si no, revisa el Base URL e intenta de nuevo.',
          },
        ],
      },
      {
        id: 'qr',
        icon: QrCode,
        title: 'Paso 3: Genera un código QR',
        description: 'Opcional, útil para videos, presentaciones, empaques o ubicaciones físicas.',
        blocks: [
          {
            type: 'steps',
            items: [
              'En la tabla de Links, encuentra tu link.',
              'Abre el menú de acciones y haz clic en **QR Code**.',
              'En Free, descarga el QR estándar blanco y negro.',
              'En Pro, crea una marca en **Settings -> Brands -> Add brand**, luego elígela en el diálogo QR.',
              'Haz clic en **Download PNG**.',
            ],
          },
          {
            type: 'note',
            text: 'Para más sobre QRs con marca, ve [Marcas y códigos QR](/help/brands-qr).',
          },
        ],
      },
      {
        id: 'monitoring',
        icon: ShieldCheck,
        title: 'Paso 4: Confirma que el monitoreo funciona',
        description: 'El monitoreo está activado por defecto, pero verifica las alertas.',
        blocks: [
          {
            type: 'bullets',
            items: [
              'Free: cada link se chequea una vez al día.',
              'Pro: cada link se chequea cada 6 horas.',
            ],
          },
          {
            type: 'steps',
            items: [
              'Ve a **Settings -> Notifications**.',
              'Confirma que **Broken link alerts** está activado.',
              'Opcionalmente agrega un **CC email** para un colega.',
              'Prueba manualmente desde Links abriendo el menú del link y haciendo clic en **Check link**.',
            ],
          },
          {
            type: 'note',
            text: 'El resultado aparece en analytics del link bajo **Recent checks**. Para detalles, ve [Fallback URLs y salud de links](/help/fallbacks).',
          },
        ],
      },
      {
        id: 'analytics',
        icon: BarChart3,
        title: 'Paso 5: Comparte tu link y mira analytics',
        description: 'Cuando el link reciba clicks, explora los resultados.',
        blocks: [
          {
            type: 'steps',
            items: [
              'Ve a **Dashboard** para ver tráfico general.',
              'Haz clic en tu link en **Top performing links**.',
              'Abre la pestaña **Analytics** para ver clicks por source, device, país y más.',
            ],
          },
          {
            type: 'note',
            text: 'Checkpoint: cuando veas clicks en analytics, estás completamente configurado. Lo demás es escalar y refinar. Ve [Dashboard y analytics](/help/dashboard-analytics).',
          },
        ],
      },
    ],
    nextTitle: 'Qué hacer después',
    nextItems: [
      {
        title: 'Traer muchos links',
        body: 'Usa **Links -> Import CSV** para subir tu archivo o empezar desde el template. Es lo más rápido para 10+ links.',
        href: '/help/import-export',
        linkLabel: 'Importar y exportar links',
      },
      {
        title: 'Usar tu propio dominio',
        body: 'Reemplaza `affprof.com/go/tuslug/linkname` con `links.tumarca.com/linkname` en Pro.',
        href: '/help/custom-domains',
        linkLabel: 'Dominios personalizados',
      },
      {
        title: 'Organizar tu librería',
        body: 'Entiende relaciones de productos, links y tags que escalan bien.',
        href: '/help/products-links-tags',
        linkLabel: 'Productos, links y tags',
      },
      {
        title: 'Asegurar settings de cuenta',
        body: 'Configura contraseña fuerte, default fallback URL y preferencias de notificación.',
        href: '/help/account-settings',
        linkLabel: 'Cuenta y configuración',
      },
    ],
    questionsTitle: 'Preguntas comunes mientras empiezas',
    faqs: [
      {
        question: 'Mi link corto no redirige. ¿Qué está mal?',
        answer:
          'Prueba el Base URL directamente primero. Si falla, el problema es el destino. Si funciona pero el link corto no, contacta a hello@affprof.com.',
      },
      {
        question: 'El slug que quiero ya está tomado. ¿Qué hago?',
        answer:
          'Los slugs son únicos dentro de tu cuenta. Agrega número, plataforma o canal, como `blue-yeti-2`, `blue-yeti-amazon`, o `blue-yeti-yt`.',
      },
      {
        question: '¿Puedo editar un link después de crearlo?',
        answer:
          'Sí. Todo excepto el slug se puede cambiar. El slug queda fijo porque cambiarlo rompería URLs cortos ya compartidos.',
      },
      {
        question: '¿Por qué mi link ya muestra broken?',
        answer:
          'Los chequeos detectan 404s, timeouts, errores de certificado y otros problemas. Revisa Recent checks, arregla el destino y corre un chequeo manual.',
      },
      {
        question: '¿Dónde veo mi plan y facturación?',
        answer:
          'Ve a Billing. Consulta Facturación y suscripción para planes, trials, reembolsos y cancelación.',
      },
    ],
    helpTitle: '¿Necesitas ayuda?',
    helpBody:
      'Si estás atascado en cualquier paso, escribe a hello@affprof.com con qué intentaste y qué pasó. Respondemos dentro de 24 horas, más rápido para usuarios Pro.',
  },
} satisfies Record<Locale, GettingStartedContent>;

function InlineMarkdown({ text }: { text: string }) {
  const nodes: ReactNode[] = [];
  const pattern = /(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*|`[^`]+`)/g;
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > cursor) nodes.push(text.slice(cursor, match.index));
    const token = match[0];

    if (token.startsWith('**')) {
      nodes.push(<strong key={match.index} className="font-medium text-foreground">{token.slice(2, -2)}</strong>);
    } else if (token.startsWith('`')) {
      nodes.push(<code key={match.index} className="rounded bg-muted px-1 py-0.5 font-mono text-[0.8em] text-foreground">{token.slice(1, -1)}</code>);
    } else {
      const linkMatch = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(token);
      if (linkMatch) {
        nodes.push(<Link key={match.index} href={linkMatch[2]} className="font-medium text-primary hover:underline">{linkMatch[1]}</Link>);
      }
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
      <a className="font-medium text-primary hover:underline" href="mailto:hello@affprof.com">hello@affprof.com</a>
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
          <span><EmailText text={item} /></span>
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
          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">{index + 1}</span>
          <span><EmailText text={item} /></span>
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
      return <div className="rounded-xl border bg-muted/30 p-4 text-sm leading-6 text-muted-foreground"><EmailText text={block.text} /></div>;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await getLocale()) as Locale;
  return { title: content[locale].title };
}

export default async function GettingStartedHelpPage() {
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
        <Link href="/help" className="inline-flex w-fit items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" />
          {tHelp('backToHelp')}
        </Link>

        <section className="rounded-2xl border bg-card p-6">
          <div className="mb-5 flex size-12 items-center justify-center rounded-2xl bg-primary/10">
            <Rocket className="size-6 text-primary" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{page.title}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">{page.description}</p>
          <div className="mt-5 grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
            <Card className="rounded-2xl">
              <CardHeader><CardTitle>{page.outcomesTitle}</CardTitle></CardHeader>
              <CardContent><BulletList items={page.outcomes} /></CardContent>
            </Card>
            <div className="rounded-2xl border bg-muted/30 p-5 text-sm leading-6 text-muted-foreground">
              {page.skipNote}
            </div>
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
                    {description ? <CardDescription className="mt-1">{description}</CardDescription> : null}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {blocks.map((block, index) => <RenderBlock key={`${id}-${index}`} block={block} />)}
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="rounded-2xl border bg-card p-6">
          <h2 className="text-xl font-semibold">{page.nextTitle}</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {page.nextItems.map((item) => (
              <Card key={item.title} className="rounded-2xl">
                <CardHeader>
                  <CardTitle>{item.title}</CardTitle>
                  <CardDescription><EmailText text={item.body} /></CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href={item.href} className="text-sm font-medium text-primary hover:underline">{item.linkLabel}</Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border bg-card p-6">
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-xl font-semibold">{page.questionsTitle}</h2>
            <HelpCircle className="size-5 text-muted-foreground" />
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {page.faqs.map((faq) => (
              <div key={faq.question} className="rounded-xl border bg-muted/20 p-4">
                <div className="text-sm font-medium">{faq.question}</div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground"><EmailText text={faq.answer} /></p>
              </div>
            ))}
          </div>
        </section>

        <Separator />

        <section className="rounded-2xl border bg-card p-5">
          <div className="flex items-start gap-3">
            <Mail className="mt-0.5 size-5 text-muted-foreground" />
            <div>
              <h2 className="text-xl font-semibold">{page.helpTitle}</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground"><EmailText text={page.helpBody} /></p>
            </div>
          </div>
        </section>
      </div>
    </PageLayout>
  );
}

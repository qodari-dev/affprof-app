import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import {
  ArrowLeft,
  Box,
  CheckCircle2,
  Database,
  HelpCircle,
  Link2,
  Mail,
  Network,
  Tags,
  Workflow,
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
  | { type: 'screenshot'; label: string };

type Section = {
  id: string;
  icon: LucideIcon;
  title: string;
  description?: string;
  blocks: Block[];
};

type ProductsContent = {
  title: string;
  description: string;
  mentalTitle: string;
  mentalItems: string[];
  hierarchy: string;
  whyTitle: string;
  whyItems: string[];
  sections: Section[];
  patternsTitle: string;
  patterns: Array<{ title: string; items: string[] }>;
  questionsTitle: string;
  faqs: Array<{ question: string; answer: string }>;
  setupTitle: string;
  setupItems: string[];
  setupNote: string;
  helpTitle: string;
  helpBody: string;
};

const content = {
  en: {
    title: 'Products, links & tags',
    description:
      'Products, links, and tags work together to keep your affiliate library organized and your analytics meaningful. Understanding how they relate saves time as your library grows.',
    mentalTitle: 'The mental model in 30 seconds',
    mentalItems: [
      'A **link** is an individual short URL that redirects to an affiliate destination.',
      'A **product** is a container that groups related links. Every link belongs to exactly one product.',
      'A **tag** is a flexible label attached to a link for filtering and organization. A link can have up to 10 tags.',
    ],
    hierarchy: 'Account -> Products -> Links -> Tags',
    whyTitle: 'Why this matters',
    whyItems: [
      'Products answer: what am I promoting?',
      'Tags answer: what context applies to this link?',
      'A microphone link might belong to the product "Blue Yeti Microphone" and have tags like `amazon`, `tech`, `creator-gear`, and `holiday-2026`.',
    ],
    sections: [
      {
        id: 'products',
        icon: Box,
        title: 'Products',
        description:
          'A product represents anything you promote through affiliate links and rolls analytics up across related links.',
        blocks: [
          {
            type: 'paragraph',
            text: 'Products help answer questions like: which campaign generates the most clicks, how many Notion-related links are broken, or what is the total click count for microphone reviews?',
          },
          { type: 'screenshot', label: 'products-form.png' },
          {
            type: 'bullets',
            items: [
              '**Name**: required. Use something easy to recognize when you have many products.',
              '**Description**: optional internal context about affiliate program, pricing tier, or notes.',
              '**Product image**: optional JPG, PNG, or WEBP up to 4 MB. Used visually in lists and analytics.',
            ],
          },
          { type: 'screenshot', label: 'products.png' },
          {
            type: 'bullets',
            items: [
              'The Products list shows image, name, link count, health badges, created date, updated date, and actions.',
              'Link badges include total links, active links, broken links, or 0 links.',
              'You can sort by Name, Created, or Updated and search when the list grows.',
            ],
          },
          { type: 'screenshot', label: 'products-actions.png' },
          {
            type: 'bullets',
            items: [
              '**View details**: opens the product page with links and aggregated analytics.',
              '**Check all links**: runs an immediate health check for every link in the product.',
              '**Go to links**: jumps to Links filtered to this product.',
              '**Edit**: changes name, description, or image.',
              '**Delete**: removes the product, but only when it has no links assigned.',
            ],
          },
          {
            type: 'note',
            text: 'A product can only be deleted if it has no links. Move links to another product or delete the links first.',
          },
        ],
      },
      {
        id: 'links',
        icon: Link2,
        title: 'Links',
        description:
          'A link is the short URL that redirects to your affiliate destination. Every shared short URL is a link in AffProf.',
        blocks: [
          {
            type: 'paragraph',
            text: 'Every link must belong to exactly one product. You can move a link later by editing it, and the slug, analytics history, and other data stay intact.',
          },
          {
            type: 'bullets',
            items: [
              'Different affiliate networks for the same product, such as Amazon and B&H.',
              'Different placements with different UTMs, such as `utm_source=youtube` vs `utm_source=blog`.',
              'A/B tests for slugs or fallback URLs.',
            ],
          },
          {
            type: 'steps',
            items: [
              'Go to **Links -> New link**.',
              'Pick or create a product.',
              'Paste the affiliate destination as **Base URL**.',
              'Choose a **slug**.',
              'Optionally add UTMs, fallback URL, tags, and notes.',
              'Click **Create link**.',
            ],
          },
          {
            type: 'steps',
            items: [
              'To move a link, go to **Links** and open the link actions menu.',
              'Click **Edit**.',
              'Change the **Product** dropdown.',
              'Save.',
            ],
          },
        ],
      },
      {
        id: 'tags',
        icon: Tags,
        title: 'Tags',
        description:
          'Tags are flexible labels attached to links. One link can have many tags, and one tag can apply to many links.',
        blocks: [
          {
            type: 'note',
            text: 'Rule of thumb: a product is the noun, what you are promoting. A tag is the adjective, context about the link.',
          },
          {
            type: 'paragraph',
            text: 'For a Sony microphone link, the product might be "Sony WH-1000XM5" and tags might be `amazon`, `tech`, `audio`, `creator-gear`, and `black-friday`.',
          },
          { type: 'screenshot', label: 'tags.png' },
          {
            type: 'bullets',
            items: [
              'The Tags list shows name, color, linked count, created date, and actions.',
              'The "Linked products" label currently counts links using the tag, not products.',
              'You can sort by Name or Created and search when you have many tags.',
            ],
          },
          { type: 'screenshot', label: 'tags-form.png' },
          {
            type: 'bullets',
            items: [
              '**Name**: short descriptive label such as `amazon`, `tech`, `black-friday`, `youtube`, or `bio-link`.',
              '**Color**: choose from preset colors to scan tags visually.',
              'CSV import automatically creates missing tags with default colors.',
              'Tags are applied per link in the link form. A link can have up to 10 tags.',
            ],
          },
          {
            type: 'paragraph',
            text: 'Tags are useful for cross-cutting contexts: campaigns, channels, seasons, networks, and internal QA states like `tested` or `needs-review`.',
          },
          {
            type: 'paragraph',
            text: 'If you delete a tag that is applied to links, those links lose the tag association but the links themselves are not affected.',
          },
        ],
      },
    ],
    patternsTitle: 'Common patterns',
    patterns: [
      {
        title: 'One product per affiliate item, tags for context',
        items: [
          'Product: `Blue Yeti Microphone`.',
          'Links: Amazon link, ShareASale link, YouTube-specific link.',
          'Tags: `amazon`, `audio`, `creator-gear`, `holiday-2026`.',
        ],
      },
      {
        title: 'Campaign-themed tags',
        items: [
          'Create a tag for each major campaign.',
          'Apply it to every link involved across all products.',
          'Filter, disable, or keep the tag later as a historical marker.',
        ],
      },
      {
        title: 'Channel-based tags',
        items: [
          'Create tags for YouTube, blog, newsletter, Instagram, and other channels.',
          'Use them to compare channel-specific link performance.',
        ],
      },
      {
        title: 'Status tags for QA',
        items: [
          'Use tags like `tested`, `needs-review`, and `pending-approval`.',
          'New links start as `needs-review`; verified links become `tested`.',
        ],
      },
    ],
    questionsTitle: 'Common questions',
    faqs: [
      {
        question: 'Can a link belong to multiple products?',
        answer:
          'No. Each link belongs to exactly one product. Use separate links or a broader product plus tags.',
      },
      {
        question: 'Can I have a link without a product?',
        answer:
          'No. Every link requires a product. Use a catch-all like Misc or Uncategorized if needed.',
      },
      {
        question: 'How many products and tags can I have?',
        answer:
          'Free allows up to 2 products and unlimited tags. Pro allows unlimited products and unlimited tags. Links can have up to 10 tags.',
      },
      {
        question: 'What happens if I delete a product with links?',
        answer:
          'You cannot delete a product that still has links. Move or delete the links first.',
      },
      {
        question: 'Can I rename a product or tag without breaking anything?',
        answer:
          'Yes. Renaming changes display names only. Links, analytics, and slugs are not affected.',
      },
      {
        question: 'Can I have duplicate product or tag names?',
        answer:
          'Technically yes, but it is confusing. Unique names are recommended.',
      },
    ],
    setupTitle: 'Setup recommendation',
    setupItems: [
      'Create 1-3 products first for the things you promote most.',
      'Add 5-10 tags for contexts that matter: channels, campaigns, networks, and types.',
      'Create your first links, assigning each one to a product and 2-4 relevant tags.',
      'Refine as you grow. Add new products and tags when useful, and rename or delete ones that are not.',
    ],
    setupNote: 'Resist making a tag for everything. 5-10 well-chosen tags are more useful than 50 confused ones.',
    helpTitle: 'Need help?',
    helpBody:
      'Email hello@affprof.com with your account email and a description of how you are trying to organize your library. We respond within 24 hours, faster for Pro users.',
  },
  es: {
    title: 'Productos, links y tags',
    description:
      'Productos, links y tags trabajan juntos para mantener tu librería de afiliados organizada y tus analytics significativos. Entender cómo se relacionan ahorra tiempo mientras creces.',
    mentalTitle: 'El modelo mental en 30 segundos',
    mentalItems: [
      'Un **link** es un URL corto individual que redirige a un destino de afiliado.',
      'Un **producto** es un contenedor que agrupa links relacionados. Cada link pertenece a exactamente un producto.',
      'Un **tag** es una etiqueta flexible adjunta a un link para filtrado y organización. Un link puede tener hasta 10 tags.',
    ],
    hierarchy: 'Cuenta -> Productos -> Links -> Tags',
    whyTitle: 'Por qué importa',
    whyItems: [
      'Productos responden: ¿qué estoy promocionando?',
      'Tags responden: ¿qué contexto aplica a este link?',
      'Un link de micrófono puede pertenecer al producto "Blue Yeti Microphone" y tener tags como `amazon`, `tech`, `creator-gear`, y `holiday-2026`.',
    ],
    sections: [
      {
        id: 'products',
        icon: Box,
        title: 'Productos',
        description:
          'Un producto representa cualquier cosa que promocionas con links de afiliado y agrega analytics de links relacionados.',
        blocks: [
          {
            type: 'paragraph',
            text: 'Los productos ayudan a responder preguntas como: qué campaña genera más clicks, cuántos links de Notion están rotos, o cuál es el total de clicks de reviews de micrófonos.',
          },
          { type: 'screenshot', label: 'products-form.png' },
          {
            type: 'bullets',
            items: [
              '**Name**: requerido. Usa algo fácil de reconocer cuando tengas muchos productos.',
              '**Description**: contexto interno opcional sobre programa, pricing o notas.',
              '**Product image**: JPG, PNG o WEBP opcional hasta 4 MB. Se usa visualmente en listas y analytics.',
            ],
          },
          { type: 'screenshot', label: 'products.png' },
          {
            type: 'bullets',
            items: [
              'La lista de Products muestra imagen, nombre, conteo de links, badges de salud, creado, actualizado y acciones.',
              'Los badges incluyen links totales, activos, rotos o 0 links.',
              'Puedes ordenar por Name, Created o Updated y buscar cuando la lista crece.',
            ],
          },
          { type: 'screenshot', label: 'products-actions.png' },
          {
            type: 'bullets',
            items: [
              '**View details**: abre la página del producto con links y analytics agregados.',
              '**Check all links**: corre chequeo de salud inmediato para cada link del producto.',
              '**Go to links**: salta a Links filtrado a este producto.',
              '**Edit**: cambia nombre, descripción o imagen.',
              '**Delete**: remueve el producto, pero solo si no tiene links asignados.',
            ],
          },
          {
            type: 'note',
            text: 'Un producto solo se puede borrar si no tiene links. Mueve los links a otro producto o borra los links primero.',
          },
        ],
      },
      {
        id: 'links',
        icon: Link2,
        title: 'Links',
        description:
          'Un link es el URL corto que redirige a tu destino de afiliado. Cada URL corto compartido es un link en AffProf.',
        blocks: [
          {
            type: 'paragraph',
            text: 'Cada link debe pertenecer a exactamente un producto. Puedes moverlo después editándolo, y el slug, analytics y demás data se mantienen intactos.',
          },
          {
            type: 'bullets',
            items: [
              'Diferentes redes para el mismo producto, como Amazon y B&H.',
              'Diferentes ubicaciones con UTMs distintos, como `utm_source=youtube` vs `utm_source=blog`.',
              'A/B tests de slugs o fallback URLs.',
            ],
          },
          {
            type: 'steps',
            items: [
              'Ve a **Links -> New link**.',
              'Elige o crea un producto.',
              'Pega el destino afiliado como **Base URL**.',
              'Elige un **slug**.',
              'Opcionalmente agrega UTMs, fallback URL, tags y notas.',
              'Haz clic en **Create link**.',
            ],
          },
          {
            type: 'steps',
            items: [
              'Para mover un link, ve a **Links** y abre su menú de acciones.',
              'Haz clic en **Edit**.',
              'Cambia el dropdown de **Product**.',
              'Guarda.',
            ],
          },
        ],
      },
      {
        id: 'tags',
        icon: Tags,
        title: 'Tags',
        description:
          'Los tags son etiquetas flexibles adjuntas a links. Un link puede tener muchos tags y un tag puede aplicarse a muchos links.',
        blocks: [
          {
            type: 'note',
            text: 'Regla práctica: un producto es el sustantivo, lo que promocionas. Un tag es el adjetivo, contexto sobre el link.',
          },
          {
            type: 'paragraph',
            text: 'Para un link de micrófono Sony, el producto podría ser "Sony WH-1000XM5" y los tags podrían ser `amazon`, `tech`, `audio`, `creator-gear`, y `black-friday`.',
          },
          { type: 'screenshot', label: 'tags.png' },
          {
            type: 'bullets',
            items: [
              'La lista de Tags muestra nombre, color, conteo vinculado, creado y acciones.',
              'El label "Linked products" actualmente cuenta links que usan el tag, no productos.',
              'Puedes ordenar por Name o Created y buscar cuando tienes muchos tags.',
            ],
          },
          { type: 'screenshot', label: 'tags-form.png' },
          {
            type: 'bullets',
            items: [
              '**Name**: etiqueta corta como `amazon`, `tech`, `black-friday`, `youtube` o `bio-link`.',
              '**Color**: elige presets para escanear tags visualmente.',
              'CSV import crea automáticamente tags faltantes con colores default.',
              'Los tags se aplican por link en el formulario. Un link puede tener hasta 10 tags.',
            ],
          },
          {
            type: 'paragraph',
            text: 'Los tags sirven para contextos transversales: campañas, canales, temporadas, redes y estados internos de QA como `tested` o `needs-review`.',
          },
          {
            type: 'paragraph',
            text: 'Si borras un tag aplicado a links, esos links pierden la asociación del tag pero los links no se afectan.',
          },
        ],
      },
    ],
    patternsTitle: 'Patrones comunes',
    patterns: [
      {
        title: 'Un producto por ítem afiliado, tags para contexto',
        items: [
          'Producto: `Blue Yeti Microphone`.',
          'Links: Amazon, ShareASale, link específico de YouTube.',
          'Tags: `amazon`, `audio`, `creator-gear`, `holiday-2026`.',
        ],
      },
      {
        title: 'Tags temáticos por campaña',
        items: [
          'Crea un tag por campaña mayor.',
          'Aplícalo a cada link involucrado en todos los productos.',
          'Filtra, deshabilita o deja el tag como marcador histórico.',
        ],
      },
      {
        title: 'Tags basados en canal',
        items: [
          'Crea tags para YouTube, blog, newsletter, Instagram y otros canales.',
          'Úsalos para comparar performance por canal.',
        ],
      },
      {
        title: 'Tags de status para QA',
        items: [
          'Usa tags como `tested`, `needs-review`, y `pending-approval`.',
          'Links nuevos empiezan como `needs-review`; links verificados pasan a `tested`.',
        ],
      },
    ],
    questionsTitle: 'Preguntas comunes',
    faqs: [
      {
        question: '¿Puede un link pertenecer a múltiples productos?',
        answer:
          'No. Cada link pertenece a exactamente un producto. Usa links separados o un producto más amplio con tags.',
      },
      {
        question: '¿Puedo tener un link sin producto?',
        answer:
          'No. Cada link requiere un producto. Usa un catch-all como Misc o Sin categoría si hace falta.',
      },
      {
        question: '¿Cuántos productos y tags puedo tener?',
        answer:
          'Free permite hasta 2 productos y tags ilimitados. Pro permite productos y tags ilimitados. Cada link puede tener hasta 10 tags.',
      },
      {
        question: '¿Qué pasa si borro un producto con links?',
        answer:
          'No puedes borrar un producto que todavía tiene links. Mueve o borra los links primero.',
      },
      {
        question: '¿Puedo renombrar un producto o tag sin romper nada?',
        answer:
          'Sí. Renombrar cambia nombres visibles solamente. Links, analytics y slugs no se afectan.',
      },
      {
        question: '¿Puedo tener productos o tags con nombres duplicados?',
        answer:
          'Técnicamente sí, pero es confuso. Recomendamos nombres únicos.',
      },
    ],
    setupTitle: 'Recomendación de configuración',
    setupItems: [
      'Crea 1-3 productos primero para las cosas que promocionas más.',
      'Agrega 5-10 tags para contextos importantes: canales, campañas, redes y tipos.',
      'Crea tus primeros links, asignando cada uno a un producto y 2-4 tags relevantes.',
      'Refina mientras creces. Agrega productos y tags cuando sean útiles, y renombra o borra los que no.',
    ],
    setupNote: 'Resiste hacer un tag para todo. 5-10 tags bien elegidos son más útiles que 50 confusos.',
    helpTitle: '¿Necesitas ayuda?',
    helpBody:
      'Escribe a hello@affprof.com con el email de tu cuenta y una descripción de cómo estás tratando de organizar tu librería. Respondemos dentro de 24 horas, más rápido para usuarios Pro.',
  },
} satisfies Record<Locale, ProductsContent>;

function InlineMarkdown({ text }: { text: string }) {
  const nodes: ReactNode[] = [];
  const pattern = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > cursor) nodes.push(text.slice(cursor, match.index));
    const token = match[0];
    nodes.push(
      token.startsWith('**') ? (
        <strong key={match.index} className="font-medium text-foreground">
          {token.slice(2, -2)}
        </strong>
      ) : (
        <code key={match.index} className="rounded bg-muted px-1 py-0.5 font-mono text-[0.8em] text-foreground">
          {token.slice(1, -1)}
        </code>
      ),
    );
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
          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
            {index + 1}
          </span>
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
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await getLocale()) as Locale;
  return { title: content[locale].title };
}

export default async function ProductsLinksTagsHelpPage() {
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
            <Database className="size-6 text-primary" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{page.title}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">{page.description}</p>
        </section>

        <section className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>{page.mentalTitle}</CardTitle>
              <CardDescription>{page.hierarchy}</CardDescription>
            </CardHeader>
            <CardContent><BulletList items={page.mentalItems} /></CardContent>
          </Card>
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>{page.whyTitle}</CardTitle>
              <CardDescription><Network className="mr-2 inline size-4" />{page.title}</CardDescription>
            </CardHeader>
            <CardContent><BulletList items={page.whyItems} /></CardContent>
          </Card>
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
                {blocks.map((block, index) => (
                  <RenderBlock key={`${id}-${index}`} block={block} />
                ))}
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="rounded-2xl border bg-muted/20 p-6">
          <div className="flex items-start gap-3">
            <Workflow className="mt-0.5 size-5 text-muted-foreground" />
            <h2 className="text-xl font-semibold">{page.patternsTitle}</h2>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {page.patterns.map((pattern) => (
              <Card key={pattern.title} className="rounded-2xl">
                <CardHeader><CardTitle>{pattern.title}</CardTitle></CardHeader>
                <CardContent><BulletList items={pattern.items} /></CardContent>
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

        <section className="rounded-2xl border bg-card p-6">
          <h2 className="text-xl font-semibold">{page.setupTitle}</h2>
          <div className="mt-4"><StepList items={page.setupItems} /></div>
          <div className="mt-5 rounded-xl border bg-muted/30 p-4 text-sm leading-6 text-muted-foreground">
            {page.setupNote}
          </div>
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
            </div>
          </div>
        </section>
      </div>
    </PageLayout>
  );
}

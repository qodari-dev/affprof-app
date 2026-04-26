import type { Metadata } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  Clock3,
  Filter,
  Globe2,
  LineChart,
  Mail,
  MousePointerClick,
  Smartphone,
  Table2,
  TrendingDown,
  type LucideIcon,
} from 'lucide-react';
import { getLocale, getTranslations } from 'next-intl/server';

import { PageLayout } from '@/components/sidebar/page-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { Locale } from '@/i18n/config';

type DashboardSection = {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
  items: string[];
  note?: string;
};

type DashboardContent = {
  title: string;
  description: string;
  linkAnalyticsNote: string;
  tocTitle: string;
  tocLinks: Array<{ href: string; label: string }>;
  answersTitle: string;
  answers: string[];
  readingTitle: string;
  readingDescription: string;
  sections: DashboardSection[];
  kpiTitle: string;
  kpis: Array<{ card: string; shows: string; redFlag: string }>;
  perLinkTitle: string;
  perLinkDescription: string;
  perLinkItemsTitle: string;
  perLinkUseCasesTitle: string;
  perLinkItems: string[];
  perLinkUseCases: string[];
  interpretationsTitle: string;
  interpretations: Array<{ title: string; intro?: string; steps: string[]; outro?: string }>;
  filteringTitle: string;
  filteringTips: string[];
  notShownTitle: string;
  notShownIntro: string;
  notShown: string[];
  attributionTip: string;
  fallbackGuideLabel: string;
  helpTitle: string;
  helpBody: string;
};

const content = {
  en: {
    title: 'Dashboard & analytics',
    description:
      "The Dashboard is your command center for understanding what's actually earning, where your audience is, and which links need attention. This guide walks through every section so you can read your data confidently.",
    linkAnalyticsNote: 'For analytics on a single link, see the per-link analytics section below.',
    tocTitle: 'In this guide',
    tocLinks: [
      { href: '#broken-links', label: 'Broken links banner' },
      { href: '#filters', label: 'Filters and date range' },
      { href: '#kpis', label: 'KPI cards' },
      { href: '#clicks-over-time', label: 'Clicks over time' },
      { href: '#top-performance', label: 'Top performance' },
      { href: '#link-health', label: 'Link Health metrics' },
      { href: '#per-link', label: 'Per-link analytics' },
      { href: '#interpretations', label: 'Common interpretations' },
      { href: '#filtering', label: 'Filtering tips' },
      { href: '#not-shown', label: 'What is not shown' },
    ],
    answersTitle: 'What the Dashboard answers',
    answers: [
      'Are any of my links broken right now?',
      'How is my traffic trending over time?',
      'Which campaigns and links are performing best?',
      'Where is my audience clicking from across channels, devices, and countries?',
      'Is my link infrastructure healthy?',
    ],
    readingTitle: 'How to read the Dashboard',
    readingDescription:
      'The Dashboard is organized top-to-bottom by urgency. Read it in this order.',
    sections: [
      {
        id: 'broken-links',
        icon: AlertTriangle,
        title: '1. Broken links banner',
        description:
          'If any links are detected as broken, a red banner appears at the top with a count and a Fix now button.',
        items: [
          'Click Fix now to jump directly to broken links.',
          'Update the destination, mark the link disabled, or delete it.',
          'If the banner is not visible, all links are currently healthy.',
        ],
        note: 'Broken links lose money silently, so this banner is intentionally hard to miss.',
      },
      {
        id: 'filters',
        icon: Filter,
        title: '2. Filters and date range',
        description:
          'Use click type, time range, and product filters to slice the entire dashboard.',
        items: [
          'All clicks: every recorded click, regardless of outcome.',
          'Successful: clicks where the visitor was redirected to the destination.',
          '**No destination** — the worst case: the link is broken AND no fallback URL is configured (neither on the link itself nor as your account-wide default), so visitors saw the AffProf "link unavailable" page. **Every count here is a click you completely lost.** Configure fallback URLs to convert these into "Successful" clicks instead.',
          '7d, 30d, 90d, 180d, and 360d switch the dashboard data window.',
          'Product filter isolates one product or campaign.',
        ],
        note: 'A high No destination count means you are receiving traffic but losing it before it can convert.',
      },
      {
        id: 'clicks-over-time',
        icon: LineChart,
        title: '4. Clicks over time',
        description: 'A daily timeline of clicks for the selected period.',
        items: [
          'Spikes usually connect to content you published. Repeat what caused them.',
          'Plateaus mean your audience is not growing and it may be time to test new channels.',
          'Drops to zero often point to a broken link issue or removed content on a platform.',
          'Best day highlights the highest-performing day in the selected period.',
        ],
      },
      {
        id: 'top-performance',
        icon: Table2,
        title: '5. Top products and Top performing links',
        description: 'Two tables show what is working at the product and link level.',
        items: [
          'Top products shows which campaigns or products generate the most clicks.',
          'Top performing links shows the actual short URLs generating the most traffic.',
          'new means the item had no clicks in the previous period.',
          '+X% or -X% compares against the previous period of the same length.',
        ],
        note: 'Spend more time on what is working and less time on what is not.',
      },
      {
        id: 'sources-platforms',
        icon: MousePointerClick,
        title: '6. Traffic sources and Top platforms',
        description: 'Understand where visitors come from and which affiliate networks drive clicks.',
        items: [
          'Traffic sources include Direct, Social, Search, Email, and Other.',
          'Top platforms shows affiliate networks such as Amazon, ShareASale, Notion, and others.',
          'Direct means no referrer was passed, which is normal for many affiliate links.',
        ],
      },
      {
        id: 'devices-countries',
        icon: Smartphone,
        title: '7. Devices and Top countries',
        description: 'See device mix and geographic distribution.',
        items: [
          'Devices breaks traffic into desktop, mobile, and tablet.',
          'Top countries shows clicks and share by country.',
          'If most clicks are mobile, make sure destination pages load fast on mobile.',
          'If the audience is concentrated in a region, match your content language and offers to that audience.',
        ],
      },
      {
        id: 'link-health',
        icon: Clock3,
        title: '8. Link Health metrics',
        description: 'The infrastructure layer at the bottom of the Dashboard.',
        items: [
          'Uptime shows what percentage of health checks passed.',
          'Avg response shows average destination response time in milliseconds.',
          'Checks passed shows successful checks against total checks.',
          'Fallback used counts traffic saved by fallback URLs.',
        ],
        note: 'Fallback used is your insurance receipt. Every count is traffic that would have been lost without fallbacks configured.',
      },
    ],
    kpiTitle: '3. KPI cards',
    kpis: [
      {
        card: 'Clicks',
        shows: 'Total clicks in the selected period, with comparison to the previous period.',
        redFlag: 'A sudden drop without explanation.',
      },
      {
        card: 'Links',
        shows: 'Active vs total links, plus broken count.',
        redFlag: 'Anything in broken state.',
      },
      {
        card: 'Top country',
        shows: 'Where most clicks come from.',
        redFlag: 'A big shift can mean your audience is changing.',
      },
      {
        card: 'Mobile share',
        shows: 'What percentage of clicks are from mobile devices.',
        redFlag: 'Distribution that does not match how you optimize content.',
      },
    ],
    perLinkTitle: 'Per-link analytics',
    perLinkDescription:
      'When you click a specific link from Links, the detail panel shows Overview and Analytics. Analytics is the Dashboard zoomed into one link.',
    perLinkItemsTitle: 'Analytics view',
    perLinkUseCasesTitle: 'Best used for',
    perLinkItems: [
      '4 small KPIs: Total clicks, Mobile %, QR scans, Countries reached.',
      'Clicks over time with the peak day called out.',
      'Sources, Devices, Countries, Operating System, and Browsers.',
      'Link Health card with uptime, checks, average response, and fallback redirects.',
      'Response time per check, with broken checks shown in red.',
      'Recent clicks with timestamp, location, device, source, and status.',
      'Recent checks with status code and response time.',
    ],
    perLinkUseCases: [
      'Understand why one link underperforms another.',
      'Verify that a fix worked by checking Recent checks.',
      'Prepare a campaign report for a brand partner.',
    ],
    interpretationsTitle: 'Common interpretations',
    interpretations: [
      {
        title: 'My traffic dropped suddenly this week',
        steps: [
          'Check the broken links banner first.',
          'Click types filter — switch to "No destination" and see if those clicks are happening. If yes, you have broken links without fallbacks losing traffic right now',
          'Check Top platforms to see whether one platform dropped entirely.',
        ],
      },
      {
        title: 'My links work but conversions are bad',
        steps: [
          'AffProf tracks clicks, not conversions.',
          'Review Top performing links and verify destination URLs.',
          'Check Devices. If most traffic is mobile but the destination is desktop-optimized, that is likely the problem.',
        ],
      },
      {
        title: 'One link has way more clicks than expected',
        steps: [
          'A piece of content may have gone viral.',
          'A bot may be repeatedly hitting the link.',
          'The link may have been scraped and embedded elsewhere. Check Sources for unexpected referrers.',
        ],
      },
      {
        title: 'My uptime is low under 90%',
        steps: [
          'Open each broken link analytics view.',
          'Review Recent checks and identify whether failures are constant, intermittent, or time-based.',
          'Fix the destination or update the link to a working URL.',
        ],
      },
      {
        title: "I have 'No destination' clicks — what now?",
        intro: 'This is fixable in two steps.',
        steps: [
          '**Configure a default fallback URL** in Settings — this catches every broken link without its own fallback. Set it to your homepage or a deals page',
          '**Find the broken links** — go to Links and filter by `Status = Broken`. Either fix the destination, set a per-link fallback, or disable/delete the link',
        ],
        outro:
          'After fixing, your future "No destination" count should drop to zero. Past clicks already lost can\'t be recovered, but new clicks will be saved.',
      },
    ],
    filteringTitle: 'Filtering tips',
    filteringTips: [
      'Combine product filter and time range to evaluate a specific campaign window.',
      'Use No destination plus 7d for a fast health check.',
      'Use 360d for quarterly or yearly patterns such as seasonality and growth.',
    ],
    notShownTitle: 'What the Dashboard does not show',
    notShownIntro: 'Set expectations before reading the numbers.',
    notShown: [
      'Conversions or revenue. Use the affiliate program dashboard for that.',
      'Visitor identity. Country and device are aggregated only.',
      'A live click counter. Analytics update within seconds, but refresh for the latest numbers.',
      'Attribution to a specific content URL. AffProf shows source category, not the exact referring URL.',
    ],
    attributionTip:
      'For attribution to specific content, use UTM parameters. The destination URL passes those UTMs through so your affiliate program or analytics tool can read them.',
    fallbackGuideLabel: 'Fallback URLs & Link Health',
    helpTitle: 'Need help interpreting your data?',
    helpBody:
      'Email hello@affprof.com with a screenshot of what you are trying to understand. We respond within 24 hours, faster for Pro users.',
  },
  es: {
    title: 'Dashboard y analytics',
    description:
      'El Dashboard es tu centro de comando para entender qué está generando ingresos, dónde está tu audiencia, y qué links necesitan atención. Esta guía te lleva por cada sección para que leas tu data con confianza.',
    linkAnalyticsNote: 'Para analytics de un solo link, ve la sección de per-link analytics al final.',
    tocTitle: 'En esta guía',
    tocLinks: [
      { href: '#broken-links', label: 'Banner de links rotos' },
      { href: '#filters', label: 'Filtros y rango de fechas' },
      { href: '#kpis', label: 'KPI cards' },
      { href: '#clicks-over-time', label: 'Clicks over time' },
      { href: '#top-performance', label: 'Top performance' },
      { href: '#link-health', label: 'Métricas de Link Health' },
      { href: '#per-link', label: 'Per-link analytics' },
      { href: '#interpretations', label: 'Interpretaciones comunes' },
      { href: '#filtering', label: 'Tips de filtrado' },
      { href: '#not-shown', label: 'Lo que no muestra' },
    ],
    answersTitle: 'Qué responde el Dashboard',
    answers: [
      '¿Hay algún link mío roto ahora?',
      '¿Cómo va la tendencia de mi tráfico en el tiempo?',
      '¿Qué campañas y links están performando mejor?',
      '¿Desde dónde está haciendo clic mi audiencia en canales, devices y países?',
      '¿Está sana mi infraestructura de links?',
    ],
    readingTitle: 'Cómo leer el Dashboard',
    readingDescription:
      'El Dashboard está organizado de arriba a abajo por urgencia. Léelo en este orden.',
    sections: [
      {
        id: 'broken-links',
        icon: AlertTriangle,
        title: '1. Banner de links rotos',
        description:
          'Si alguno de tus links es detectado como roto, aparece un banner rojo arriba con un conteo y un botón Fix now.',
        items: [
          'Haz clic en Fix now para saltar directo a tus links rotos.',
          'Actualiza el destino, marca el link como deshabilitado, o bórralo.',
          'Si no ves el banner, todos tus links están sanos ahora.',
        ],
        note: 'Los links rotos pierden dinero silenciosamente, por eso este banner es difícil de ignorar.',
      },
      {
        id: 'filters',
        icon: Filter,
        title: '2. Filtros y rango de fechas',
        description:
          'Usa filtros de tipo de clic, rango de tiempo y producto para cortar todo el dashboard.',
        items: [
          'All clicks: cada clic registrado, sin importar el resultado.',
          'Successful: clicks donde el visitante fue redirigido al destino.',
          '**No destination** — el peor caso: el link está roto Y no hay fallback URL configurado (ni en el link mismo ni como default a nivel cuenta), así que los visitantes vieron la página de "link no disponible" de AffProf. **Cada conteo aquí es un clic que perdiste completamente.** Configura fallback URLs para convertir esos en clicks "Successful".',
          '7d, 30d, 90d, 180d, y 360d cambian la ventana de data del dashboard.',
          'El filtro de producto aísla un producto o campaña.',
        ],
        note: 'Un conteo alto de No destination significa que estás recibiendo tráfico pero perdiéndolo antes de que convierta.',
      },
      {
        id: 'clicks-over-time',
        icon: LineChart,
        title: '4. Clicks over time',
        description: 'Una línea de tiempo diaria de clicks para el período seleccionado.',
        items: [
          'Picos normalmente se conectan con contenido que publicaste. Repite lo que los causó.',
          'Mesetas significan que tu audiencia no está creciendo y puede ser hora de probar canales nuevos.',
          'Caídas a cero suelen indicar un link roto o contenido removido en una plataforma.',
          'Best day destaca el día con más performance del período seleccionado.',
        ],
      },
      {
        id: 'top-performance',
        icon: Table2,
        title: '5. Top products y Top performing links',
        description: 'Dos tablas muestran qué funciona a nivel de producto y link.',
        items: [
          'Top products muestra qué campañas o productos generan más clicks.',
          'Top performing links muestra las URLs cortas que generan más tráfico.',
          'new significa que el item no tenía clicks en el período anterior.',
          '+X% o -X% compara contra el período anterior de la misma duración.',
        ],
        note: 'Dedica más tiempo a lo que funciona y menos a lo que no.',
      },
      {
        id: 'sources-platforms',
        icon: MousePointerClick,
        title: '6. Traffic sources y Top platforms',
        description: 'Entiende desde dónde vienen los visitantes y qué redes de afiliados generan clicks.',
        items: [
          'Traffic sources incluye Direct, Social, Search, Email, y Other.',
          'Top platforms muestra redes como Amazon, ShareASale, Notion, y otras.',
          'Direct significa que no se recibió referrer, algo normal en muchos links de afiliado.',
        ],
      },
      {
        id: 'devices-countries',
        icon: Smartphone,
        title: '7. Devices y Top countries',
        description: 'Mira mezcla de devices y distribución geográfica.',
        items: [
          'Devices divide tráfico en desktop, mobile, y tablet.',
          'Top countries muestra clicks y share por país.',
          'Si la mayoría de clicks son móviles, asegúrate de que tus destinos carguen rápido en mobile.',
          'Si la audiencia está concentrada en una región, ajusta idioma y ofertas a esa audiencia.',
        ],
      },
      {
        id: 'link-health',
        icon: Clock3,
        title: '8. Métricas de Link Health',
        description: 'La capa de infraestructura al final del Dashboard.',
        items: [
          'Uptime muestra qué porcentaje de chequeos de salud pasó.',
          'Avg response muestra el tiempo promedio de respuesta del destino en milisegundos.',
          'Checks passed muestra chequeos exitosos contra chequeos totales.',
          'Fallback used cuenta tráfico salvado por fallback URLs.',
        ],
        note: 'Fallback used es tu recibo de seguro. Cada conteo es tráfico que se habría perdido sin fallbacks configurados.',
      },
    ],
    kpiTitle: '3. KPI cards',
    kpis: [
      {
        card: 'Clicks',
        shows: 'Clicks totales en el período seleccionado, con comparación al período anterior.',
        redFlag: 'Una caída repentina sin explicación.',
      },
      {
        card: 'Links',
        shows: 'Activos vs total de links, más conteo de rotos.',
        redFlag: 'Cualquier cosa en estado broken.',
      },
      {
        card: 'Top country',
        shows: 'Desde dónde vienen la mayoría de tus clicks.',
        redFlag: 'Un cambio grande puede significar que tu audiencia está cambiando.',
      },
      {
        card: 'Mobile share',
        shows: 'Qué porcentaje de clicks vienen de devices móviles.',
        redFlag: 'Distribución que no coincide con cómo estás optimizando contenido.',
      },
    ],
    perLinkTitle: 'Per-link analytics',
    perLinkDescription:
      'Cuando haces clic en un link específico desde Links, el panel de detalle muestra Overview y Analytics. Analytics es el Dashboard con zoom a un solo link.',
    perLinkItemsTitle: 'Vista de analytics',
    perLinkUseCasesTitle: 'Mejor para',
    perLinkItems: [
      '4 KPIs pequeños: Total clicks, Mobile %, QR scans, Países alcanzados.',
      'Clicks over time con el día pico destacado.',
      'Sources, Devices, Countries, Operating System, y Browsers.',
      'Card de Link Health con uptime, chequeos, response promedio, y fallback redirects.',
      'Response time per check, con chequeos rotos en rojo.',
      'Recent clicks con timestamp, ubicación, device, source, y status.',
      'Recent checks con status code y response time.',
    ],
    perLinkUseCases: [
      'Entender por qué un link performa peor que otro.',
      'Verificar que un fix funcionó revisando Recent checks.',
      'Preparar un reporte de campaña para un brand partner.',
    ],
    interpretationsTitle: 'Interpretaciones comunes',
    interpretations: [
      {
        title: 'Mi tráfico cayó de repente esta semana',
        steps: [
          'Revisa primero el banner de links rotos.',
          'Filtro de tipo de clic — cambia a "No destination" y mira si esos clicks están pasando. Si sí, tienes links rotos sin fallbacks perdiendo tráfico ahora mismo',
          'Revisa Top platforms para ver si una plataforma cayó completamente.',
        ],
      },
      {
        title: 'Mis links funcionan pero las conversiones están mal',
        steps: [
          'AffProf trackea clicks, no conversiones.',
          'Revisa Top performing links y verifica sus URLs de destino.',
          'Revisa Devices. Si la mayoría del tráfico es mobile pero el destino está optimizado para desktop, probablemente ese es el problema.',
        ],
      },
      {
        title: 'Un link tiene muchos más clicks de los esperados',
        steps: [
          'Una pieza de contenido pudo haberse viralizado.',
          'Un bot puede estar golpeando el link repetidamente.',
          'El link pudo ser scraped y embebido en otro lugar. Revisa Sources por referrers inesperados.',
        ],
      },
      {
        title: 'Mi uptime está bajo de 90%',
        steps: [
          'Abre el analytics de cada link roto.',
          'Revisa Recent checks e identifica si las fallas son constantes, intermitentes, o por hora del día.',
          'Arregla el destino o actualiza el link a un URL que funcione.',
        ],
      },
      {
        title: "Tengo clicks 'No destination' — ¿qué hago ahora?",
        intro: 'Esto es arreglable en dos pasos.',
        steps: [
          '**Configura un fallback URL por defecto** en Settings — esto captura cada link roto que no tenga su propio fallback. Ponlo a tu homepage o página de ofertas',
          '**Encuentra los links rotos** — ve a Links y filtra por `Status = Broken`. Arregla el destino, configura un fallback por link, o deshabilita/borra el link',
        ],
        outro:
          'Después de arreglar, tu conteo futuro de "No destination" debe bajar a cero. Los clicks pasados ya perdidos no se pueden recuperar, pero los nuevos clicks serán salvados.',
      },
    ],
    filteringTitle: 'Tips de filtrado',
    filteringTips: [
      'Combina filtro de producto y rango de tiempo para evaluar una ventana específica de campaña.',
      'Usa No destination más 7d para un health check rápido.',
      'Usa 360d para patrones trimestrales o anuales como estacionalidad y crecimiento.',
    ],
    notShownTitle: 'Lo que el Dashboard no muestra',
    notShownIntro: 'Para alinear expectativas antes de leer los números.',
    notShown: [
      'Conversiones o ingresos. Usa el dashboard del programa de afiliados para eso.',
      'Identidad del visitante. País y device se guardan solo de forma agregada.',
      'Un contador en vivo. Analytics se actualiza en segundos, pero refresca para ver los números más recientes.',
      'Atribución a un URL específico de contenido. AffProf muestra categoría de fuente, no el URL exacto que refirió el clic.',
    ],
    attributionTip:
      'Para atribución a contenido específico, usa UTM parameters. El URL de destino pasa esos UTMs para que tu programa de afiliados o herramienta de analytics los pueda leer.',
    fallbackGuideLabel: 'Fallback URLs & Link Health',
    helpTitle: '¿Necesitas ayuda interpretando tu data?',
    helpBody:
      'Escribe a hello@affprof.com con un screenshot de lo que estás tratando de entender. Respondemos dentro de 24 horas, más rápido para usuarios Pro.',
  },
} satisfies Record<Locale, DashboardContent>;

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

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item} className="flex gap-2 text-sm leading-6 text-muted-foreground">
          <CheckCircle2 className="mt-1 size-4 shrink-0 text-primary" />
          <span>
            <InlineMarkdown text={item} />
          </span>
        </li>
      ))}
    </ul>
  );
}

function EmailText({ text }: { text: string }) {
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

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await getLocale()) as Locale;
  return { title: content[locale].title };
}

export default async function DashboardAnalyticsHelpPage() {
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
            <BarChart3 className="size-6 text-primary" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{page.title}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
            {page.description}
          </p>
          <p className="mt-3 text-sm text-muted-foreground">{page.linkAnalyticsNote}</p>
        </section>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>{page.tocTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
              {page.tocLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-xl border bg-muted/20 px-3 py-2 text-sm font-medium text-muted-foreground hover:border-primary/40 hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        <section className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>{page.answersTitle}</CardTitle>
              <CardDescription>{page.readingDescription}</CardDescription>
            </CardHeader>
            <CardContent>
              <BulletList items={page.answers} />
            </CardContent>
          </Card>

          <Card id="kpis" className="scroll-mt-20 rounded-2xl">
            <CardHeader>
              <CardTitle>{page.kpiTitle}</CardTitle>
              <CardDescription>{page.readingTitle}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                {page.kpis.map((kpi) => (
                  <div key={kpi.card} className="rounded-xl border bg-muted/20 p-4">
                    <div className="text-sm font-medium">{kpi.card}</div>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">{kpi.shows}</p>
                    <p className="mt-2 text-xs font-medium text-destructive">{kpi.redFlag}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          {page.sections.map(({ id, icon: Icon, title, description, items, note }) => (
            <Card key={id} id={id} className="scroll-mt-20 rounded-2xl">
              <CardHeader>
                <div className="flex items-start gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border bg-background">
                    <Icon className="size-5 text-muted-foreground" />
                  </div>
                  <div>
                    <CardTitle>{title}</CardTitle>
                    <CardDescription className="mt-1">{description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <BulletList items={items} />
                {note ? (
                  <div className="rounded-xl border bg-muted/30 p-3 text-sm leading-6 text-muted-foreground">
                    {note}
                    {id === 'link-health' ? (
                      <>
                        {' '}
                        <Link href="/help/fallbacks" className="font-medium text-primary hover:underline">
                          {page.fallbackGuideLabel}
                        </Link>
                      </>
                    ) : null}
                  </div>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </section>

        <section id="per-link" className="scroll-mt-20 rounded-2xl border bg-card p-6">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border bg-background">
              <Globe2 className="size-5 text-muted-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">{page.perLinkTitle}</h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">{page.perLinkDescription}</p>
            </div>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <div>
              <p className="mb-3 text-sm font-medium">{page.perLinkItemsTitle}</p>
              <BulletList items={page.perLinkItems} />
            </div>
            <div>
              <p className="mb-3 text-sm font-medium">{page.perLinkUseCasesTitle}</p>
              <BulletList items={page.perLinkUseCases} />
            </div>
          </div>
        </section>

        <section id="interpretations" className="scroll-mt-20 rounded-2xl border bg-muted/20 p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">{page.interpretationsTitle}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{page.filteringTitle}</p>
            </div>
            <TrendingDown className="size-5 text-muted-foreground" />
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {page.interpretations.map((item) => (
              <div key={item.title} className="rounded-xl border bg-background p-4">
                <div className="text-sm font-medium">{item.title}</div>
                {item.intro ? (
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.intro}</p>
                ) : null}
                <div className="mt-3">
                  <BulletList items={item.steps} />
                </div>
                {item.outro ? (
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.outro}</p>
                ) : null}
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <Card id="filtering" className="scroll-mt-20 rounded-2xl">
            <CardHeader>
              <CardTitle>{page.filteringTitle}</CardTitle>
            </CardHeader>
            <CardContent>
              <BulletList items={page.filteringTips} />
            </CardContent>
          </Card>

          <Card id="not-shown" className="scroll-mt-20 rounded-2xl">
            <CardHeader>
              <CardTitle>{page.notShownTitle}</CardTitle>
              <CardDescription>{page.notShownIntro}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <BulletList items={page.notShown} />
              <Separator />
              <p className="text-sm leading-6 text-muted-foreground">{page.attributionTip}</p>
            </CardContent>
          </Card>
        </section>

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

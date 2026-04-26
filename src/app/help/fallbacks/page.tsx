import type { Metadata } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  HelpCircle,
  Mail,
  RotateCcw,
  ShieldCheck,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import { getLocale, getTranslations } from 'next-intl/server';

import { PageLayout } from '@/components/sidebar/page-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { Locale } from '@/i18n/config';

type TextBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'bullets'; items: string[] }
  | { type: 'steps'; items: string[] }
  | { type: 'note'; text: string }
  | { type: 'comparison'; withoutTitle: string; without: string[]; withTitle: string; with: string[] };

type GuideSection = {
  id: string;
  icon: LucideIcon;
  title: string;
  description?: string;
  blocks: TextBlock[];
};

type FallbackContent = {
  title: string;
  description: string;
  tocTitle: string;
  tocLinks: Array<{ href: string; label: string }>;
  introSummary: Array<{ title: string; body: string }>;
  sections: GuideSection[];
  scenarioTitle: string;
  scenarioIntro: string;
  scenarioSteps: string[];
  scenarioPoint: string;
  countsTitle: string;
  withFallbackTitle: string;
  withoutFallbackTitle: string;
  withFallbackCounts: string[];
  withoutFallbackCounts: string[];
  withFallbackNote: string;
  withoutFallbackNote: string;
  questionsTitle: string;
  faqs: Array<{ question: string; answer: string }>;
  checklistTitle: string;
  checklistIntro: string;
  checklist: Array<{ title: string; time: string; items: string[] }>;
  helpTitle: string;
  helpBody: string;
};

const content = {
  en: {
    title: 'Fallback URLs & Link Health',
    description:
      "Affiliate links break silently. The page goes 404, the product gets pulled, the affiliate program rotates URLs, or the destination domain expires. AffProf pairs automatic link health monitoring with fallback URLs so you do not lose clicks while you fix the original destination.",
    tocTitle: 'In this guide',
    tocLinks: [
      { href: '#problem', label: 'The problem' },
      { href: '#monitoring', label: 'Link Health' },
      { href: '#manual-checks', label: 'Manual checks' },
      { href: '#fallbacks', label: 'Fallback URLs' },
      { href: '#choosing', label: 'Choosing fallbacks' },
      { href: '#setup', label: 'Setup' },
      { href: '#how-they-work', label: 'How they work together' },
      { href: '#click-counts', label: 'Click counts' },
      { href: '#questions', label: 'Common questions' },
      { href: '#checklist', label: 'Setup checklist' },
    ],
    introSummary: [
      {
        title: 'Automatic monitoring',
        body: 'AffProf checks every destination URL on a schedule and records status, response time, and history.',
      },
      {
        title: 'Fallback protection',
        body: 'Broken or disabled links can redirect to a backup URL instead of showing a dead end.',
      },
      {
        title: 'Clear diagnostics',
        body: 'Dashboard and per-link analytics show checks, uptime, fallback usage, and recent failures.',
      },
    ],
    sections: [
      {
        id: 'problem',
        icon: AlertTriangle,
        title: 'The problem in plain terms',
        description:
          'A product can disappear weeks after you publish content, and the link can keep losing money without you noticing.',
        blocks: [
          {
            type: 'comparison',
            withoutTitle: 'Without AffProf',
            without: [
              'Your content keeps getting views.',
              'Visitors click the affiliate link.',
              'They land on a 404 or failed destination.',
              'They give up and search somewhere else.',
              'You earn $0 and may not know it happened.',
            ],
            withTitle: 'With AffProf',
            with: [
              'AffProf detects the broken link within hours.',
              'You receive an email alert.',
              'If a fallback URL is configured, visitors go to your backup destination.',
              'You keep earning from those clicks while you fix the original.',
            ],
          },
        ],
      },
      {
        id: 'monitoring',
        icon: Clock3,
        title: 'Part 1: Link Health monitoring',
        description: 'AffProf automatically checks every link in your account on a schedule.',
        blocks: [
          {
            type: 'bullets',
            items: ['Free plan: once per day.', 'Pro plan: every 6 hours, 4 times per day.'],
          },
          {
            type: 'steps',
            items: [
              'AffProf sends a `GET` request to the destination URL with a 10-second timeout.',
              'It records the HTTP status code and response time.',
              "It saves the result to that link's check history.",
            ],
          },
          {
            type: 'paragraph',
            text: 'A single failed check does not mark a link as broken. Networks have hiccups, so AffProf marks a link as `broken` only after multiple consecutive failures.',
          },
          {
            type: 'bullets',
            items: [
              '4xx responses such as 404, 403, or 410.',
              '5xx responses such as 500, 502, or 503.',
              'Timeouts with no response within 10 seconds.',
              'Network errors such as DNS or certificate failures.',
            ],
          },
          {
            type: 'paragraph',
            text: 'When a link transitions from `Active` to `Broken`, the link status turns red, the Dashboard banner shows the broken count, and you receive an email alert if broken link alerts are enabled.',
          },
        ],
      },
      {
        id: 'manual-checks',
        icon: Wrench,
        title: 'Manual checks and history',
        description: 'You can verify a link immediately without waiting for the next scheduled check.',
        blocks: [
          {
            type: 'steps',
            items: ['Go to **Links**.', 'Open the actions menu on any link.', 'Click **Check link**.'],
          },
          {
            type: 'note',
            text: 'Use manual checks after fixing a destination URL, after a product launch, or anytime you want to confirm a link works right now.',
          },
          {
            type: 'bullets',
            items: [
              'Link Health card: uptime %, total checks, average response time, and fallback redirects.',
              'Recent checks table: last 10 checks with timestamp, status code, response time, and OK/Broken status.',
            ],
          },
        ],
      },
      {
        id: 'fallbacks',
        icon: RotateCcw,
        title: 'Part 2: Fallback URLs',
        description:
          'A fallback URL is a backup destination AffProf redirects to when a link is broken or manually disabled.',
        blocks: [
          {
            type: 'paragraph',
            text: 'Without a fallback, visitors of broken or disabled links see AffProf’s "link unavailable" page. With a fallback, they are redirected to a destination of your choice and never see an error.',
          },
          {
            type: 'bullets',
            items: [
              '**Per-link fallback**: highest priority, set on the individual link.',
              '**Account-wide default fallback**: set in **Settings -> Default fallback URL** and used when the per-link fallback is empty.',
              'If neither is configured, broken or disabled links show the "link unavailable" page.',
            ],
          },
        ],
      },
      {
        id: 'choosing',
        icon: ShieldCheck,
        title: 'Choosing the right fallback URL',
        description: 'The best fallback depends on the type of link.',
        blocks: [
          {
            type: 'bullets',
            items: [
              'Product links: use a similar product, category page, search page, or your own alternatives page.',
              'Tool or SaaS links: use the tool homepage with your affiliate code or your own review/comparison page.',
              'Everything else: use your homepage, deals page, or current recommendations page.',
            ],
          },
          {
            type: 'note',
            text: 'Recommendation: set your account-wide default fallback to a high-converting page on your own site. Even broken-link traffic becomes useful instead of bouncing.',
          },
        ],
      },
      {
        id: 'setup',
        icon: Wrench,
        title: 'How to set fallbacks',
        description: 'Configure fallbacks per link or as an account-wide default.',
        blocks: [
          {
            type: 'steps',
            items: [
              'Per-link fallback: create or edit a link, open **Options**, enter the **Fallback URL**, and save.',
              'Account default: go to **Settings -> Default fallback URL**, enter the full URL, and click **Save**.',
              'Fallback URLs must start with `https://` or `http://`.',
            ],
          },
          {
            type: 'paragraph',
            text: 'Every time a fallback fires, AffProf records the click as redirected, increments the per-link Fallback redirects counter, and increments the Dashboard’s Fallback used counter.',
          },
          {
            type: 'note',
            text: 'Every Fallback used count is a click you would have lost without a fallback configured. It is the ROI of this feature.',
          },
        ],
      },
    ],
    scenarioTitle: 'Part 3: How they work together',
    scenarioIntro: 'The two systems act as one safety net.',
    scenarioSteps: [
      'AffProf checks the link and confirms it is broken.',
      'AffProf marks the link as broken and sends you an alert.',
      'Visitors keep clicking the short link.',
      'AffProf detects the broken status at redirect time.',
      'Per-link fallback exists? Redirect there.',
      'No per-link fallback? Use the account-wide default fallback if one exists.',
      'No fallback at either level? Show the "link unavailable" page.',
      'You fix the destination.',
      'The next health check passes and the link returns to Active.',
      'New visitors go back to the original working destination.',
    ],
    scenarioPoint:
      'The point is that between detection and repair, fallbacks keep you from losing money.',
    countsTitle: 'What the click counts look like',
    withFallbackTitle: 'With a fallback configured',
    withoutFallbackTitle: 'Without a fallback',
    withFallbackCounts: ['All clicks: 100', 'Successful: 100', 'No destination: 0', 'Fallback used: 100'],
    withoutFallbackCounts: ['All clicks: 100', 'Successful: 0', 'No destination: 100', 'Fallback used: 0'],
    withFallbackNote:
      'Visitors did not see an error. They went to your fallback URL, so the redirect succeeded.',
    withoutFallbackNote: 'Visitors saw the link unavailable page. Conversion potential is zero.',
    questionsTitle: 'Common questions',
    faqs: [
      {
        question: 'Does the fallback URL also receive the original UTM parameters?',
        answer:
          'Yes. UTMs configured on the original link are appended to the fallback URL too, so analytics tools can still attribute the traffic.',
      },
      {
        question: 'What if my fallback URL also breaks?',
        answer:
          'AffProf checks the original destination, not the fallback. Use a stable fallback you control, ideally your own site.',
      },
      {
        question: "Can I update a broken link's destination without losing clicks?",
        answer:
          'Yes. Edit the link, paste the new working URL in Base URL, and save. The change is live immediately.',
      },
      {
        question: 'Do I get notified when a broken link starts working again?',
        answer:
          'Currently no. Only failures trigger emails. Recovery alerts are being considered for a future update.',
      },
      {
        question: 'Why is my Checks passed lower than expected?',
        answer:
          'The metric is historical for the selected period. Past failed checks remain in that period even after the link is fixed.',
      },
      {
        question: 'Can I disable health monitoring for a specific link?',
        answer:
          'Not currently. All links are monitored automatically.',
      },
      {
        question: 'What if my destination requires authentication or has a paywall?',
        answer:
          'AffProf checks are unauthenticated, so these destinations may appear broken. Contact hello@affprof.com if this affects your workflow.',
      },
    ],
    checklistTitle: 'Setup checklist',
    checklistIntro: 'If you are starting from scratch, do these in order.',
    checklist: [
      {
        title: 'Set an account-wide default fallback',
        time: '5 minutes',
        items: [
          'Settings -> Default fallback URL -> enter your homepage or top-products page.',
          'This protects every link that does not have its own fallback.',
        ],
      },
      {
        title: 'Add per-link fallbacks for your top 10 most-clicked links',
        time: '15 minutes',
        items: [
          'Open each high-traffic link and set a more specific fallback.',
          'These are the links where losing a click hurts most.',
        ],
      },
      {
        title: 'Verify broken link alerts are enabled',
        time: '30 seconds',
        items: [
          'Settings -> Notifications -> confirm Broken link alerts is on.',
          'Optionally add a CC email for a teammate.',
        ],
      },
      {
        title: 'Check Fallback used monthly',
        time: 'ongoing',
        items: [
          'This metric proves your fallbacks are saving real clicks.',
          'If it is growing, your safety net is working.',
        ],
      },
    ],
    helpTitle: 'Need help?',
    helpBody:
      'Email hello@affprof.com with your account email and a description of what you are trying to set up. We respond within 24 hours, faster for Pro users.',
  },
  es: {
    title: 'Fallback URLs y Link Health',
    description:
      'Los links de afiliado se rompen silenciosamente. La página da 404, el producto se descontinúa, el programa rota URLs, o el dominio del destino expira. AffProf combina monitoreo automático de salud de links con fallback URLs para que no pierdas clicks mientras arreglas el destino original.',
    tocTitle: 'En esta guía',
    tocLinks: [
      { href: '#problem', label: 'El problema' },
      { href: '#monitoring', label: 'Link Health' },
      { href: '#manual-checks', label: 'Chequeos manuales' },
      { href: '#fallbacks', label: 'Fallback URLs' },
      { href: '#choosing', label: 'Elegir fallbacks' },
      { href: '#setup', label: 'Configuración' },
      { href: '#how-they-work', label: 'Cómo trabajan juntos' },
      { href: '#click-counts', label: 'Conteos de clicks' },
      { href: '#questions', label: 'Preguntas comunes' },
      { href: '#checklist', label: 'Checklist' },
    ],
    introSummary: [
      {
        title: 'Monitoreo automático',
        body: 'AffProf chequea cada URL de destino con un horario y registra status, tiempo de respuesta e historial.',
      },
      {
        title: 'Protección con fallbacks',
        body: 'Links rotos o deshabilitados pueden redirigir a un URL de respaldo en vez de mostrar un callejón sin salida.',
      },
      {
        title: 'Diagnóstico claro',
        body: 'Dashboard y analytics por link muestran chequeos, uptime, uso de fallbacks y fallas recientes.',
      },
    ],
    sections: [
      {
        id: 'problem',
        icon: AlertTriangle,
        title: 'El problema en términos simples',
        description:
          'Un producto puede desaparecer semanas después de publicar contenido, y el link puede seguir perdiendo dinero sin que lo notes.',
        blocks: [
          {
            type: 'comparison',
            withoutTitle: 'Sin AffProf',
            without: [
              'Tu contenido sigue recibiendo views.',
              'Los visitantes hacen clic en el link de afiliado.',
              'Llegan a un 404 o destino fallido.',
              'Se rinden y buscan otra cosa.',
              'Ganas $0 y quizás nunca te enteras.',
            ],
            withTitle: 'Con AffProf',
            with: [
              'AffProf detecta el link roto en horas.',
              'Recibes una alerta por email.',
              'Si configuraste un fallback URL, los visitantes van a tu destino de respaldo.',
              'Sigues ganando de esos clicks mientras arreglas el original.',
            ],
          },
        ],
      },
      {
        id: 'monitoring',
        icon: Clock3,
        title: 'Parte 1: Link Health',
        description: 'AffProf chequea automáticamente cada link en tu cuenta con un horario.',
        blocks: [
          {
            type: 'bullets',
            items: ['Plan Free: una vez al día.', 'Plan Pro: cada 6 horas, 4 veces al día.'],
          },
          {
            type: 'steps',
            items: [
              'AffProf envía un request `GET` al URL de destino con timeout de 10 segundos.',
              'Registra el código de status HTTP y el tiempo de respuesta.',
              'Guarda el resultado en el historial de chequeos de ese link.',
            ],
          },
          {
            type: 'paragraph',
            text: 'Un solo chequeo fallido no marca un link como roto. Las redes tienen hipos, así que AffProf marca un link como `broken` solo después de varios fallos consecutivos.',
          },
          {
            type: 'bullets',
            items: [
              'Respuestas 4xx como 404, 403, o 410.',
              'Respuestas 5xx como 500, 502, o 503.',
              'Timeouts sin respuesta dentro de 10 segundos.',
              'Errores de red como DNS o certificados.',
            ],
          },
          {
            type: 'paragraph',
            text: 'Cuando un link cambia de `Active` a `Broken`, el status del link se pone rojo, el banner del Dashboard muestra el conteo de rotos, y recibes una alerta por email si las alertas están activadas.',
          },
        ],
      },
      {
        id: 'manual-checks',
        icon: Wrench,
        title: 'Chequeos manuales e historial',
        description: 'Puedes verificar un link inmediatamente sin esperar al siguiente chequeo programado.',
        blocks: [
          {
            type: 'steps',
            items: ['Ve a **Links**.', 'Abre el menú de acciones de cualquier link.', 'Haz clic en **Check link**.'],
          },
          {
            type: 'note',
            text: 'Usa chequeos manuales después de arreglar un URL de destino, después de un lanzamiento, o cuando quieras confirmar que un link funciona ahora mismo.',
          },
          {
            type: 'bullets',
            items: [
              'Card de Link Health: uptime %, total de chequeos, response promedio y fallback redirects.',
              'Tabla de Recent checks: últimos 10 chequeos con timestamp, status code, response time y status OK/Broken.',
            ],
          },
        ],
      },
      {
        id: 'fallbacks',
        icon: RotateCcw,
        title: 'Parte 2: Fallback URLs',
        description:
          'Un fallback URL es un destino de respaldo al que AffProf redirige cuando un link está roto o manualmente deshabilitado.',
        blocks: [
          {
            type: 'paragraph',
            text: 'Sin un fallback, los visitantes de links rotos o deshabilitados ven la página de "link no disponible" de AffProf. Con un fallback, son redirigidos al destino que elijas y nunca ven un error.',
          },
          {
            type: 'bullets',
            items: [
              '**Fallback por link**: prioridad más alta, configurado en el link individual.',
              '**Fallback default a nivel cuenta**: configurado en **Settings -> Default fallback URL** y usado cuando el fallback por link está vacío.',
              'Si ninguno está configurado, los links rotos o deshabilitados muestran la página de "link no disponible".',
            ],
          },
        ],
      },
      {
        id: 'choosing',
        icon: ShieldCheck,
        title: 'Eligiendo el fallback URL correcto',
        description: 'El mejor fallback depende del tipo de link.',
        blocks: [
          {
            type: 'bullets',
            items: [
              'Links de productos: usa un producto similar, página de categoría, búsqueda, o tu propia página de alternativas.',
              'Links de tools o SaaS: usa el homepage de la tool con tu código de afiliado o tu review/comparación.',
              'Todo lo demás: usa tu homepage, página de ofertas, o página de recomendaciones actuales.',
            ],
          },
          {
            type: 'note',
            text: 'Recomendación: configura tu fallback default a nivel cuenta a una página de alta conversión en tu propio sitio. Hasta el tráfico de links rotos se vuelve útil en vez de rebotar.',
          },
        ],
      },
      {
        id: 'setup',
        icon: Wrench,
        title: 'Cómo configurar fallbacks',
        description: 'Configura fallbacks por link o como default a nivel cuenta.',
        blocks: [
          {
            type: 'steps',
            items: [
              'Fallback por link: crea o edita un link, abre **Options**, ingresa el **Fallback URL**, y guarda.',
              'Default de cuenta: ve a **Settings -> Default fallback URL**, ingresa el URL completo, y haz clic en **Save**.',
              'Los fallback URLs deben empezar con `https://` o `http://`.',
            ],
          },
          {
            type: 'paragraph',
            text: 'Cada vez que un fallback se dispara, AffProf registra el click como redirigido, incrementa el contador de Fallback redirects por link, e incrementa el contador Fallback used del Dashboard.',
          },
          {
            type: 'note',
            text: 'Cada conteo de Fallback used es un clic que hubieras perdido sin un fallback configurado. Es el ROI de esta feature.',
          },
        ],
      },
    ],
    scenarioTitle: 'Parte 3: Cómo trabajan juntos',
    scenarioIntro: 'Los dos sistemas funcionan como una sola red de seguridad.',
    scenarioSteps: [
      'AffProf chequea el link y confirma que está roto.',
      'AffProf marca el link como broken y te envía una alerta.',
      'Los visitantes siguen haciendo clic en el link corto.',
      'AffProf detecta el status roto al momento del redirect.',
      '¿Existe fallback por link? Redirige ahí.',
      '¿No hay fallback por link? Usa el fallback default a nivel cuenta si existe.',
      '¿No hay fallback en ningún nivel? Muestra la página de "link no disponible".',
      'Arreglas el destino.',
      'El siguiente chequeo pasa y el link vuelve a Active.',
      'Nuevos visitantes vuelven al destino original funcionando.',
    ],
    scenarioPoint:
      'El punto es que entre la detección y la reparación, los fallbacks evitan que pierdas dinero.',
    countsTitle: 'Cómo se ven los conteos de clicks',
    withFallbackTitle: 'Con fallback configurado',
    withoutFallbackTitle: 'Sin fallback',
    withFallbackCounts: ['All clicks: 100', 'Successful: 100', 'No destination: 0', 'Fallback used: 100'],
    withoutFallbackCounts: ['All clicks: 100', 'Successful: 0', 'No destination: 100', 'Fallback used: 0'],
    withFallbackNote:
      'Los visitantes no vieron un error. Fueron a tu fallback URL, así que el redirect tuvo éxito.',
    withoutFallbackNote:
      'Los visitantes vieron la página de link no disponible. Potencial de conversión: cero.',
    questionsTitle: 'Preguntas comunes',
    faqs: [
      {
        question: '¿El fallback URL también recibe los UTM parameters originales?',
        answer:
          'Sí. Los UTMs configurados en el link original también se agregan al fallback URL, así tus herramientas de analytics pueden atribuir el tráfico.',
      },
      {
        question: '¿Qué pasa si mi fallback URL también se rompe?',
        answer:
          'AffProf chequea el destino original, no el fallback. Usa un fallback estable que controles, idealmente tu propio sitio.',
      },
      {
        question: '¿Puedo actualizar el destino de un link roto sin perder clicks?',
        answer:
          'Sí. Edita el link, pega el nuevo URL funcional en Base URL, y guarda. El cambio queda vivo inmediatamente.',
      },
      {
        question: '¿Me notifican cuando un link roto vuelve a funcionar?',
        answer:
          'Actualmente no. Solo las fallas disparan emails. Estamos considerando alertas de recuperación para una actualización futura.',
      },
      {
        question: '¿Por qué mi Checks passed está más bajo de lo esperado?',
        answer:
          'La métrica es histórica para el período seleccionado. Las fallas pasadas se quedan en ese período aunque el link ya esté arreglado.',
      },
      {
        question: '¿Puedo deshabilitar el monitoreo de salud para un link específico?',
        answer: 'Actualmente no. Todos los links se monitorean automáticamente.',
      },
      {
        question: '¿Qué pasa si mi destino requiere autenticación o tiene paywall?',
        answer:
          'Los chequeos de AffProf no tienen autenticación, así que esos destinos podrían aparecer broken. Contáctanos a hello@affprof.com si esto afecta tu workflow.',
      },
    ],
    checklistTitle: 'Checklist de configuración',
    checklistIntro: 'Si estás empezando desde cero, haz esto en orden.',
    checklist: [
      {
        title: 'Configura un fallback default a nivel cuenta',
        time: '5 minutos',
        items: [
          'Settings -> Default fallback URL -> ingresa tu homepage o página de top productos.',
          'Esto protege cada link que no tenga su propio fallback.',
        ],
      },
      {
        title: 'Agrega fallbacks por link a tus top 10 links más clickeados',
        time: '15 minutos',
        items: [
          'Abre cada link de alto tráfico y configura un fallback más específico.',
          'Estos son los links donde perder un clic duele más.',
        ],
      },
      {
        title: 'Verifica que las alertas de links rotos están activadas',
        time: '30 segundos',
        items: [
          'Settings -> Notifications -> confirma que Broken link alerts está activado.',
          'Opcionalmente agrega un CC email para un colega.',
        ],
      },
      {
        title: 'Revisa Fallback used mensualmente',
        time: 'continuo',
        items: [
          'Esta métrica prueba que tus fallbacks están salvando clicks reales.',
          'Si está creciendo, tu red de seguridad está funcionando.',
        ],
      },
    ],
    helpTitle: '¿Necesitas ayuda?',
    helpBody:
      'Escribe a hello@affprof.com con tu email de cuenta y una descripción de qué estás tratando de configurar. Respondemos dentro de 24 horas, más rápido para usuarios Pro.',
  },
} satisfies Record<Locale, FallbackContent>;

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

function RenderBlock({ block }: { block: TextBlock }) {
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
    case 'comparison':
      return (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border bg-muted/20 p-4">
            <div className="mb-3 text-sm font-medium">{block.withoutTitle}</div>
            <BulletList items={block.without} />
          </div>
          <div className="rounded-xl border bg-muted/20 p-4">
            <div className="mb-3 text-sm font-medium">{block.withTitle}</div>
            <BulletList items={block.with} />
          </div>
        </div>
      );
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await getLocale()) as Locale;
  return { title: content[locale].title };
}

export default async function FallbacksHelpPage() {
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
            <RotateCcw className="size-6 text-primary" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{page.title}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
            {page.description}
          </p>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {page.introSummary.map((item) => (
              <div key={item.title} className="rounded-xl border bg-muted/20 p-4">
                <div className="text-sm font-medium">{item.title}</div>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.body}</p>
              </div>
            ))}
          </div>
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

        <section id="how-they-work" className="scroll-mt-20 rounded-2xl border bg-card p-6">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border bg-background">
              <ShieldCheck className="size-5 text-muted-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">{page.scenarioTitle}</h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">{page.scenarioIntro}</p>
            </div>
          </div>
          <div className="mt-5">
            <StepList items={page.scenarioSteps} />
          </div>
          <div className="mt-5 rounded-xl border bg-muted/30 p-4 text-sm leading-6 text-muted-foreground">
            {page.scenarioPoint}
          </div>
        </section>

        <section id="click-counts" className="scroll-mt-20 rounded-2xl border bg-muted/20 p-6">
          <h2 className="text-xl font-semibold">{page.countsTitle}</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle>{page.withFallbackTitle}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <BulletList items={page.withFallbackCounts} />
                <p className="text-sm leading-6 text-muted-foreground">{page.withFallbackNote}</p>
              </CardContent>
            </Card>
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle>{page.withoutFallbackTitle}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <BulletList items={page.withoutFallbackCounts} />
                <p className="text-sm leading-6 text-muted-foreground">{page.withoutFallbackNote}</p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section id="questions" className="scroll-mt-20 rounded-2xl border bg-card p-6">
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-xl font-semibold">{page.questionsTitle}</h2>
            <HelpCircle className="size-5 text-muted-foreground" />
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {page.faqs.map((faq) => (
              <div key={faq.question} className="rounded-xl border bg-muted/20 p-4">
                <div className="text-sm font-medium">{faq.question}</div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  <EmailText text={faq.answer} />
                </p>
              </div>
            ))}
          </div>
        </section>

        <section id="checklist" className="scroll-mt-20 rounded-2xl border bg-card p-6">
          <h2 className="text-xl font-semibold">{page.checklistTitle}</h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">{page.checklistIntro}</p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {page.checklist.map((item, index) => (
              <Card key={item.title} className="rounded-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm text-primary">
                      {index + 1}
                    </span>
                    {item.title}
                  </CardTitle>
                  <CardDescription>{item.time}</CardDescription>
                </CardHeader>
                <CardContent>
                  <BulletList items={item.items} />
                </CardContent>
              </Card>
            ))}
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

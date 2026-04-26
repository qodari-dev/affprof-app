import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import {
  ArrowLeft,
  BadgeCheck,
  CheckCircle2,
  Download,
  HelpCircle,
  ImageIcon,
  Mail,
  Palette,
  QrCode,
  ScanLine,
  Settings,
  ShieldCheck,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import { getLocale, getTranslations } from 'next-intl/server';

import { PageLayout } from '@/components/sidebar/page-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { Locale } from '@/i18n/config';

type Block =
  | { type: 'paragraph'; text: string }
  | { type: 'subheading'; text: string }
  | { type: 'bullets'; items: string[] }
  | { type: 'steps'; items: string[] }
  | { type: 'note'; text: string }
  | { type: 'warning'; text: string }
  | { type: 'screenshot'; label: string };

type Section = {
  id: string;
  icon: LucideIcon;
  title: string;
  description?: string;
  blocks: Block[];
};

type BrandsContent = {
  title: string;
  description: string;
  proNote: string;
  summary: Array<{ title: string; body: string }>;
  sections: Section[];
  variationsTitle: string;
  variationsDescription: string;
  variations: string[];
  bestPracticesTitle: string;
  bestPractices: Array<{ title: string; items: string[] }>;
  trackingTitle: string;
  trackingDescription: string;
  trackingItems: string[];
  questionsTitle: string;
  faqs: Array<{ question: string; answer: string }>;
  setupTitle: string;
  setupItems: Array<{ title: string; time: string; items: string[] }>;
  helpTitle: string;
  helpBody: string;
};

const content = {
  en: {
    title: 'Brands & QR codes',
    description:
      'QR codes turn any physical surface into a clickable link: videos, presentations, packaging, business cards, displays, and livestream slides. AffProf generates a QR code for every short link automatically.',
    proNote:
      'On Pro, you can apply a brand, which is a saved combination of logo and colors, so every QR looks like part of your design system instead of a generic shortener artifact.',
    summary: [
      {
        title: 'Automatic QR codes',
        body: 'Every short link gets a QR code automatically, including on the Free plan.',
      },
      {
        title: 'Reusable brands',
        body: 'Save logo, foreground color, background color, and default selection once.',
      },
      {
        title: 'Scan analytics',
        body: 'QR scans are tracked separately from regular clicks in link analytics.',
      },
    ],
    sections: [
      {
        id: 'what-is-brand',
        icon: Palette,
        title: 'What is a brand in AffProf?',
        description: 'A brand is a saved style preset for QR codes.',
        blocks: [
          {
            type: 'bullets',
            items: [
              'Name: your internal label, such as "My YouTube" or "Holiday Promo".',
              'Logo: placed in the center of QR codes using this brand.',
              'QR foreground color: the color of the QR pattern.',
              'QR background color: the color behind the QR pattern.',
              'Default flag: whether this brand is pre-selected in the QR dialog.',
            ],
          },
          {
            type: 'note',
            text: 'Branded QR codes with custom logo and colors are a Pro feature. Free QR codes still work, but use the standard black-and-white style without a logo.',
          },
        ],
      },
      {
        id: 'why-branded',
        icon: ShieldCheck,
        title: 'Why use branded QR codes',
        description: 'Branded QRs can perform better than generic ones.',
        blocks: [
          {
            type: 'bullets',
            items: [
              '**Trust**: a logo makes the destination feel recognizable before the scan.',
              '**Brand consistency**: QR codes match your colors and visual system.',
              '**Recall**: people who do not scan still see your logo in the frame, package, or slide.',
            ],
          },
        ],
      },
      {
        id: 'creating',
        icon: Settings,
        title: 'Creating a brand',
        description: 'Go to **Settings -> Brands -> Add brand**.',
        blocks: [
          { type: 'screenshot', label: 'create-brand.png' },
          {
            type: 'bullets',
            items: [
              '**Name**: use a short label that is easy to recognize in the QR dialog later.',
              '**Logo**: upload JPG, PNG, or WEBP up to 4 MB.',
              '**QR foreground**: darker colors scan more reliably against light backgrounds.',
              '**QR background**: keep it light enough to maintain strong contrast.',
              '**Default brand**: toggle this on if you want this brand pre-selected when opening the QR dialog for any link that **doesn’t have its own brand assigned**. The default acts as a fallback — it’s used when a link wasn’t configured with a specific brand.',
            ],
          },
          {
            type: 'paragraph',
            text: 'If a link has its own brand set (in the link’s edit form, under **QR brand**), that brand takes priority over the default when opening the QR dialog.',
          },
          {
            type: 'note',
            text: 'The contrast rule: if your QR is hard to read with squinted eyes, it will be hard for phone cameras too. Test before printing.',
          },
        ],
      },
      {
        id: 'brand-precedence',
        icon: BadgeCheck,
        title: 'Brand precedence: how AffProf chooses which brand to pre-select',
        description:
          'When you open the QR dialog for any link, AffProf decides which brand to show pre-selected based on this order.',
        blocks: [
          {
            type: 'steps',
            items: [
              '**The link has its own brand assigned** -> that brand is pre-selected. Configured per-link in the link’s edit form, under **Options -> QR brand**.',
              '**The link has no brand, but you have a default brand** -> the default brand is pre-selected.',
              '**The link has no brand and you have no default** -> "Standard AffProf QR" (no brand, plain black-and-white) is pre-selected.',
            ],
          },
          {
            type: 'paragraph',
            text: 'Regardless of what’s pre-selected, the dropdown always shows all your saved brands plus the Standard option, so you can switch at download time.',
          },
          {
            type: 'note',
            text: 'Practical tip: assign a brand to each link when you create it (using the **QR brand** field in the link form). That way, every time you open that link’s QR dialog, the right brand is already there — no manual selection needed.',
          },
        ],
      },
      {
        id: 'logo-tips',
        icon: ImageIcon,
        title: 'Logo and color tips',
        description: 'Use QR-friendly assets so the code stays scannable.',
        blocks: [
          {
            type: 'bullets',
            items: [
              'Use square or near-square logos. Round logos work too.',
              'Use high contrast against the QR background.',
              'Prefer simple recognizable shapes over fine detail.',
              'Avoid thin lines, small text, low-contrast colors, photos, or complex imagery.',
              'Pastel and very light backgrounds work better than mid-tone or dark backgrounds.',
            ],
          },
        ],
      },
      {
        id: 'managing',
        icon: BadgeCheck,
        title: 'Managing your brands',
        description: 'Go to **Settings -> Brands** to see saved brands.',
        blocks: [
          {
            type: 'paragraph',
            text: 'Go to **Settings -> Brands** to see all your saved brands. Each row shows:',
          },
          {
            type: 'bullets',
            items: [
              'The brand’s logo preview.',
              'Name with a **⭐ Default** badge if it’s currently the default.',
              'Color preview circles showing the foreground and background colors.',
              'Hex codes of both colors.',
            ],
          },
          {
            type: 'paragraph',
            text: 'Action buttons:',
          },
          {
            type: 'bullets',
            items: [
              '**Set default** (only on non-default brands): makes this brand the new default. Only one brand can be default at a time, so setting a new default automatically removes the badge from the previous one.',
              '**Edit**: change the name, logo, colors, or default status.',
              '**Delete**: remove the brand. See "What happens when you delete a brand" below.',
              'You can have as many brands as you want. Use **Add brand** at the bottom to create a new one.',
            ],
          },
          {
            type: 'subheading',
            text: 'What happens when you delete a brand',
          },
          {
            type: 'bullets',
            items: [
              '**Existing QR codes you’ve already downloaded** with this brand are not affected. You already have the PNG files saved.',
              '**Links that had this brand assigned** automatically fall back to the next available option in the precedence chain: default brand if you have one, otherwise "Standard AffProf QR".',
              '**Future QR downloads** can no longer use the deleted brand.',
            ],
          },
        ],
      },
      {
        id: 'generating',
        icon: QrCode,
        title: 'Generating a QR code for a link',
        description: 'Open the QR dialog from Links or from the link detail panel.',
        blocks: [
          {
            type: 'steps',
            items: [
              'From Links: find the link, open the actions menu, and click **QR Code**.',
              'From the link detail panel: open any link and open the QR code section.',
              'Choose Standard AffProf QR or one of your saved brands in the dropdown.',
            ],
          },
          { type: 'screenshot', label: 'qr-dropdown.png' },
          { type: 'screenshot', label: 'qr-with-brand.png' },
          {
            type: 'bullets',
            items: [
              'Standard AffProf QR is plain black-and-white and works on every plan.',
              'Saved brands update the preview immediately with logo and colors.',
              'Use the standard QR for maximum compatibility or low-resolution printing.',
            ],
          },
          {
            type: 'warning',
            text: 'Note about naming: don’t confuse "Standard AffProf QR" (the system option that produces a plain black-and-white QR with no logo, always available) with a brand you might create and name "AffProf" yourself. They’re separate things. The system option is always there regardless of your brands. A brand named "AffProf" that you created is just a custom brand that happens to use that name.',
          },
        ],
      },
      {
        id: 'download',
        icon: Download,
        title: 'Download',
        description: 'Click **Download PNG** to save the QR code.',
        blocks: [
          {
            type: 'bullets',
            items: [
              'The file is a high-resolution PNG suitable for print and digital use.',
              'The filename includes the link slug for organization.',
              'The destination URL appears in plain text below the QR for accessibility.',
            ],
          },
        ],
      },
    ],
    variationsTitle: 'One link, multiple QR variations',
    variationsDescription:
      'You do not need separate links for separate QR styles. Download multiple QR codes from the same link by switching the brand each time.',
    variations: [
      'Instagram stories: branded with your YouTube logo and channel colors.',
      'Printed business cards: black and white, smaller, no logo for low-quality printing.',
      'Trade show banner: main logo and high-impact colors.',
      'All variations redirect to the same destination and contribute to the same link analytics.',
    ],
    bestPracticesTitle: 'Advanced QR tips',
    bestPractices: [
      {
        title: 'Sizing for print',
        items: [
          'Minimum size: 2 cm x 2 cm, about 0.8 inches.',
          'Posters and flyers: 3-5 cm.',
          'Trade show banners: 10 cm or larger.',
          'Include a small scan prompt nearby.',
        ],
      },
      {
        title: 'Sizing for digital',
        items: [
          'YouTube end screens: at least 200 x 200 px.',
          'Instagram stories: at least 400 x 400 px.',
          'Presentations: at least 300 x 300 px, larger for TVs or projectors.',
          'PDFs: use high resolution because users often zoom.',
        ],
      },
      {
        title: 'Contrast and readability',
        items: [
          'Scan it yourself before publishing.',
          'Test in low light if the QR appears in a dark venue.',
          'Print a test copy and scan from 1-2 meters away.',
          'Test with real camera apps like iOS Camera, Android Google Lens, and scanner apps.',
        ],
      },
      {
        title: 'Where QRs perform well',
        items: [
          'Video content viewers can pause.',
          'Print materials people examine up close.',
          'Presentation ending slides with 15+ seconds to scan.',
          'Packaging and in-person events.',
        ],
      },
      {
        title: 'Where QRs perform poorly',
        items: [
          'Fast-moving video with less than 5 seconds on screen.',
          'Billboards, motion graphics, and tiny placements.',
          'Glossy or curved surfaces.',
          'Anywhere the audience does not have a phone in hand.',
        ],
      },
    ],
    trackingTitle: 'Tracking QR scans',
    trackingDescription:
      'QR scans count as a separate metric in analytics. AffProf detects when a click came from a QR code and tags it accordingly.',
    trackingItems: [
      'QR scans: total scans of QR codes for this link.',
      'Recent clicks: entries tagged as QR.',
      'Dashboard: total QR-driven traffic across all links.',
      'Useful for measuring ROI of physical placements and print campaigns.',
    ],
    questionsTitle: 'Common questions',
    faqs: [
      {
        question: 'Can I use the same brand for multiple links?',
        answer: 'Yes. Brands are reusable. Set them up once, then apply them to any link.',
      },
      {
        question: 'Can I have a brand without a logo?',
        answer: 'Yes. Logo upload is optional. You can use colors only.',
      },
      {
        question: 'Why does my logo look blurry?',
        answer:
          'The logo may be low resolution, or the QR may be displayed too small. Use at least 500 x 500 px for best results.',
      },
      {
        question: 'Will adding a logo make my QR fail to scan?',
        answer:
          'QR codes have built-in error correction. Branded QRs scan reliably as long as you maintain strong contrast.',
      },
      {
        question: 'Can I use a transparent logo?',
        answer:
          'Yes, but solid-background PNGs are usually safer, especially with colored QR backgrounds.',
      },
      {
        question: 'My downloaded PNG has a watermark or wrong colors',
        answer:
          'That should not happen. Contact hello@affprof.com with the link slug and selected brand.',
      },
      {
        question: 'Can I generate QR codes in bulk?',
        answer:
          'Not yet. QR codes are downloaded one at a time. Bulk QR export is being considered for a future update.',
      },
    ],
    setupTitle: 'Setup recommendation',
    setupItems: [
      {
        title: 'Create one default brand',
        time: '5 minutes',
        items: [
          'Settings -> Brands -> Add brand.',
          'Name it after your main use case.',
          'Toggle it as default.',
        ],
      },
      {
        title: 'Generate your first branded QR',
        time: '1 minute',
        items: [
          'Pick any link -> actions menu -> QR Code.',
          'Confirm your default brand is pre-selected.',
          'Download PNG and verify it looks right.',
        ],
      },
      {
        title: 'Add more brands as needed',
        time: 'as you grow',
        items: [
          'Different campaign? Different brand.',
          'Seasonal promo? Create a seasonal brand.',
          'Black-and-white print ad? Save that as a separate brand.',
        ],
      },
    ],
    helpTitle: 'Need help?',
    helpBody:
      'Email hello@affprof.com with your account email and a description of what you are trying to do. We respond within 24 hours, faster for Pro users.',
  },
  es: {
    title: 'Marcas y códigos QR',
    description:
      'Los códigos QR convierten cualquier superficie física en un link clickeable: videos, presentaciones, empaques, tarjetas, displays y slides en livestreams. AffProf genera un código QR para cada link corto automáticamente.',
    proNote:
      'En Pro puedes aplicar una marca, una combinación guardada de logo y colores, para que cada QR se vea como parte de tu sistema de diseño en vez de un artefacto genérico.',
    summary: [
      {
        title: 'QR codes automáticos',
        body: 'Cada link corto recibe un QR automáticamente, incluso en el plan Free.',
      },
      {
        title: 'Marcas reutilizables',
        body: 'Guarda logo, color foreground, color background y selección default una sola vez.',
      },
      {
        title: 'Analytics de escaneos',
        body: 'Los QR scans se trackean separados de los clicks normales en analytics del link.',
      },
    ],
    sections: [
      {
        id: 'what-is-brand',
        icon: Palette,
        title: '¿Qué es una marca en AffProf?',
        description: 'Una marca es un preset de estilo guardado para códigos QR.',
        blocks: [
          {
            type: 'bullets',
            items: [
              'Nombre: tu etiqueta interna, como "Mi YouTube" o "Promo de Navidad".',
              'Logo: ubicado en el centro de los QR que usan esta marca.',
              'Color foreground del QR: el color del patrón QR.',
              'Color background del QR: el color detrás del patrón.',
              'Bandera de default: si esta marca queda pre-seleccionada en el diálogo QR.',
            ],
          },
          {
            type: 'note',
            text: 'Los QR codes con logo y colores personalizados son una feature Pro. En Free los QR funcionan igual, pero usan el estilo estándar blanco y negro sin logo.',
          },
        ],
      },
      {
        id: 'why-branded',
        icon: ShieldCheck,
        title: 'Por qué usar QR codes con marca',
        description: 'Los QRs con marca pueden performar mejor que los genéricos.',
        blocks: [
          {
            type: 'bullets',
            items: [
              '**Confianza**: un logo hace que el destino se sienta reconocible antes del scan.',
              '**Consistencia de marca**: los QR coinciden con tus colores y sistema visual.',
              '**Recordación**: quien no escanea igual ve tu logo en el video, empaque o slide.',
            ],
          },
        ],
      },
      {
        id: 'creating',
        icon: Settings,
        title: 'Creando una marca',
        description: 'Ve a **Settings -> Brands -> Add brand**.',
        blocks: [
          { type: 'screenshot', label: 'create-brand.png' },
          {
            type: 'bullets',
            items: [
              '**Name**: usa una etiqueta corta fácil de reconocer en el diálogo QR.',
              '**Logo**: sube JPG, PNG, o WEBP hasta 4 MB.',
              '**QR foreground**: colores oscuros escanean mejor contra fondos claros.',
              '**QR background**: mantenlo claro para conservar contraste fuerte.',
              '**Default brand**: activa esto si quieres que esta marca quede pre-seleccionada al abrir el diálogo de QR para cualquier link que **no tenga su propia marca asignada**. El default actúa como un fallback — se usa cuando un link no fue configurado con una marca específica.',
            ],
          },
          {
            type: 'paragraph',
            text: 'Si un link tiene su propia marca configurada (en el formulario de edición del link, bajo **QR brand**), esa marca tiene prioridad sobre el default al abrir el diálogo de QR.',
          },
          {
            type: 'note',
            text: 'La regla del contraste: si tu QR es difícil de leer con los ojos entrecerrados, también será difícil para cámaras de teléfono. Pruébalo antes de imprimir.',
          },
        ],
      },
      {
        id: 'brand-precedence',
        icon: BadgeCheck,
        title: 'Precedencia de marcas: cómo AffProf elige cuál marca pre-seleccionar',
        description:
          'Cuando abres el diálogo de QR para cualquier link, AffProf decide qué marca mostrar pre-seleccionada basado en este orden.',
        blocks: [
          {
            type: 'steps',
            items: [
              '**El link tiene su propia marca asignada** -> esa marca queda pre-seleccionada. Configurada por link en el formulario de edición del link, bajo **Options -> QR brand**.',
              '**El link no tiene marca, pero tú tienes una marca default** -> la marca default queda pre-seleccionada.',
              '**El link no tiene marca y tú no tienes default** -> "Standard AffProf QR" (sin marca, blanco y negro plano) queda pre-seleccionada.',
            ],
          },
          {
            type: 'paragraph',
            text: 'Sin importar qué esté pre-seleccionado, el dropdown siempre muestra todas tus marcas guardadas más la opción Standard, así puedes cambiar al momento de descargar.',
          },
          {
            type: 'note',
            text: 'Tip práctico: asigna una marca a cada link cuando lo creas (usando el campo **QR brand** en el formulario del link). Así, cada vez que abras el diálogo de QR de ese link, la marca correcta ya está ahí — sin selección manual necesaria.',
          },
        ],
      },
      {
        id: 'logo-tips',
        icon: ImageIcon,
        title: 'Tips para logo y colores',
        description: 'Usa assets amigables para QR para mantener buen escaneo.',
        blocks: [
          {
            type: 'bullets',
            items: [
              'Usa logos cuadrados o casi cuadrados. Los logos redondos también funcionan.',
              'Usa alto contraste contra el background del QR.',
              'Prefiere formas simples y reconocibles sobre detalles finos.',
              'Evita líneas delgadas, texto pequeño, bajo contraste, fotos o imágenes complejas.',
              'Fondos pastel o muy claros funcionan mejor que fondos oscuros o de tono medio.',
            ],
          },
        ],
      },
      {
        id: 'managing',
        icon: BadgeCheck,
        title: 'Manejando tus marcas',
        description: 'Ve a **Settings -> Brands** para ver tus marcas guardadas.',
        blocks: [
          {
            type: 'paragraph',
            text: 'Ve a **Settings -> Brands** para ver todas tus marcas guardadas. Cada fila muestra:',
          },
          {
            type: 'bullets',
            items: [
              'Preview del logo de la marca.',
              'Nombre con un badge **⭐ Default** si actualmente es la marca por defecto.',
              'Círculos de preview de colores mostrando los colores de foreground y background.',
              'Códigos hex de ambos colores.',
            ],
          },
          {
            type: 'paragraph',
            text: 'Botones de acción:',
          },
          {
            type: 'bullets',
            items: [
              '**Set default** (solo en marcas que no son default): hace que esta marca sea la nueva default. Solo una marca puede ser default a la vez, así que poner una nueva default automáticamente remueve el badge de la anterior.',
              '**Edit**: cambia el nombre, logo, colores, o estado de default.',
              '**Delete**: remueve la marca. Ve "Qué pasa cuando borras una marca" abajo.',
              'Puedes tener tantas marcas como quieras. Usa **Add brand** abajo para crear una nueva.',
            ],
          },
          {
            type: 'subheading',
            text: 'Qué pasa cuando borras una marca',
          },
          {
            type: 'bullets',
            items: [
              '**Los QR codes existentes que ya descargaste** con esta marca no se afectan. Ya tienes los archivos PNG guardados.',
              '**Los links que tenían esta marca asignada** automáticamente caen a la siguiente opción disponible en la cadena de precedencia: la marca default si tienes una, si no "Standard AffProf QR".',
              '**Las futuras descargas de QR** ya no pueden usar la marca borrada.',
            ],
          },
        ],
      },
      {
        id: 'generating',
        icon: QrCode,
        title: 'Generando un código QR para un link',
        description: 'Abre el diálogo QR desde Links o desde el panel de detalle del link.',
        blocks: [
          {
            type: 'steps',
            items: [
              'Desde Links: encuentra el link, abre el menú de acciones y haz clic en **QR Code**.',
              'Desde el panel de detalle: abre cualquier link y busca la sección de QR code.',
              'Elige Standard AffProf QR o una de tus marcas guardadas en el dropdown.',
            ],
          },
          { type: 'screenshot', label: 'qr-dropdown.png' },
          { type: 'screenshot', label: 'qr-with-brand.png' },
          {
            type: 'bullets',
            items: [
              'Standard AffProf QR es blanco y negro, sin logo, y funciona en cualquier plan.',
              'Las marcas guardadas actualizan el preview inmediatamente con logo y colores.',
              'Usa el QR estándar para máxima compatibilidad o impresión de baja resolución.',
            ],
          },
          {
            type: 'warning',
            text: 'Nota sobre el naming: no confundas "Standard AffProf QR" (la opción del sistema que produce un QR plano blanco y negro sin logo, siempre disponible) con una marca que tú podrías crear y nombrar "AffProf". Son cosas separadas. La opción del sistema siempre está ahí sin importar tus marcas. Una marca llamada "AffProf" que tú creaste es solo una marca custom que casualmente usa ese nombre.',
          },
        ],
      },
      {
        id: 'download',
        icon: Download,
        title: 'Descarga',
        description: 'Haz clic en **Download PNG** para guardar el QR.',
        blocks: [
          {
            type: 'bullets',
            items: [
              'El archivo es un PNG de alta resolución apto para impresión y digital.',
              'El filename incluye el slug del link para organización.',
              'El URL de destino aparece en texto plano debajo del QR para accesibilidad.',
            ],
          },
        ],
      },
    ],
    variationsTitle: 'Un link, múltiples variaciones de QR',
    variationsDescription:
      'No necesitas links separados para estilos separados. Descarga múltiples QR desde el mismo link cambiando la marca cada vez.',
    variations: [
      'Instagram stories: con logo de YouTube y colores del canal.',
      'Tarjetas impresas: blanco y negro, más pequeño, sin logo para impresión de baja calidad.',
      'Banner de feria: logo principal y colores de alto impacto.',
      'Todas las variaciones redirigen al mismo destino y contribuyen al mismo analytics del link.',
    ],
    bestPracticesTitle: 'Tips avanzados de QR',
    bestPractices: [
      {
        title: 'Tamaño para impresión',
        items: [
          'Tamaño mínimo: 2 cm x 2 cm, aproximadamente 0.8 pulgadas.',
          'Pósters y folletos: 3-5 cm.',
          'Banners de ferias: 10 cm o más.',
          'Incluye una pista pequeña de escaneo cerca.',
        ],
      },
      {
        title: 'Tamaño para digital',
        items: [
          'End screens de YouTube: al menos 200 x 200 px.',
          'Instagram stories: al menos 400 x 400 px.',
          'Presentaciones: al menos 300 x 300 px, más grande para TVs o proyectores.',
          'PDFs: alta resolución porque los usuarios hacen zoom.',
        ],
      },
      {
        title: 'Contraste y legibilidad',
        items: [
          'Escanéalo tú mismo antes de publicar.',
          'Prueba en luz baja si aparece en un venue oscuro.',
          'Imprime una copia de prueba y escanea desde 1-2 metros.',
          'Prueba con apps reales como iOS Camera, Android Google Lens y scanner apps.',
        ],
      },
      {
        title: 'Dónde los QRs performan bien',
        items: [
          'Video que los viewers pueden pausar.',
          'Materiales impresos que la gente examina de cerca.',
          'Slides finales con 15+ segundos para escanear.',
          'Empaques y eventos en persona.',
        ],
      },
      {
        title: 'Dónde los QRs performan mal',
        items: [
          'Video rápido con menos de 5 segundos en pantalla.',
          'Billboards, motion graphics y ubicaciones diminutas.',
          'Superficies brillantes o curvas.',
          'Lugares donde la audiencia no tiene el teléfono en mano.',
        ],
      },
    ],
    trackingTitle: 'Trackeando escaneos de QR',
    trackingDescription:
      'Los QR scans cuentan como una métrica separada en analytics. AffProf detecta cuando un click vino de QR y lo etiqueta.',
    trackingItems: [
      'QR scans: escaneos totales de QR codes para este link.',
      'Recent clicks: entradas etiquetadas como QR.',
      'Dashboard: tráfico total impulsado por QR en todos los links.',
      'Útil para medir ROI de campañas físicas e impresas.',
    ],
    questionsTitle: 'Preguntas comunes',
    faqs: [
      {
        question: '¿Puedo usar la misma marca para múltiples links?',
        answer: 'Sí. Las marcas son reutilizables. Las configuras una vez y luego las aplicas a cualquier link.',
      },
      {
        question: '¿Puedo tener una marca sin logo?',
        answer: 'Sí. El logo es opcional. Puedes usar solo colores.',
      },
      {
        question: '¿Por qué mi logo se ve borroso?',
        answer:
          'El logo puede ser de baja resolución o el QR puede estar muy pequeño. Usa al menos 500 x 500 px para mejores resultados.',
      },
      {
        question: '¿Agregar un logo hará que mi QR falle?',
        answer:
          'Los QR tienen corrección de errores. Los QRs con marca escanean bien si mantienes buen contraste.',
      },
      {
        question: '¿Puedo usar un logo transparente?',
        answer:
          'Sí, pero los PNGs con fondo sólido suelen ser más seguros, especialmente con backgrounds QR de color.',
      },
      {
        question: 'Mi PNG tiene watermark o colores incorrectos',
        answer:
          'Eso no debería pasar. Contáctanos a hello@affprof.com con el slug del link y la marca seleccionada.',
      },
      {
        question: '¿Puedo generar QR codes en lote?',
        answer:
          'Todavía no. Se descargan uno a la vez. Estamos considerando exportación masiva en una actualización futura.',
      },
    ],
    setupTitle: 'Recomendación de configuración',
    setupItems: [
      {
        title: 'Crea una marca default',
        time: '5 minutos',
        items: [
          'Settings -> Brands -> Add brand.',
          'Nómbrala según tu caso de uso principal.',
          'Actívala como default.',
        ],
      },
      {
        title: 'Genera tu primer QR con marca',
        time: '1 minuto',
        items: [
          'Elige cualquier link -> menú de acciones -> QR Code.',
          'Confirma que tu marca default está pre-seleccionada.',
          'Descarga PNG y verifica que se vea bien.',
        ],
      },
      {
        title: 'Agrega más marcas según necesites',
        time: 'mientras creces',
        items: [
          '¿Campaña diferente? Marca diferente.',
          '¿Promo estacional? Crea una marca estacional.',
          '¿Anuncio impreso blanco y negro? Guárdalo como marca separada.',
        ],
      },
    ],
    helpTitle: '¿Necesitas ayuda?',
    helpBody:
      'Escribe a hello@affprof.com con tu email de cuenta y una descripción de qué estás tratando de hacer. Respondemos dentro de 24 horas, más rápido para usuarios Pro.',
  },
} satisfies Record<Locale, BrandsContent>;

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
    case 'subheading':
      return <h3 className="pt-1 text-base font-medium">{block.text}</h3>;
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
    case 'warning':
      return (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/20 dark:text-amber-100">
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
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await getLocale()) as Locale;
  return { title: content[locale].title };
}

export default async function BrandsQrHelpPage() {
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
            <QrCode className="size-6 text-primary" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{page.title}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">{page.description}</p>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">{page.proNote}</p>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {page.summary.map((item) => (
              <div key={item.title} className="rounded-xl border bg-muted/20 p-4">
                <div className="text-sm font-medium">{item.title}</div>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.body}</p>
              </div>
            ))}
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

        <section className="rounded-2xl border bg-card p-6">
          <div className="flex items-start gap-3">
            <ScanLine className="mt-0.5 size-5 text-muted-foreground" />
            <div>
              <h2 className="text-xl font-semibold">{page.variationsTitle}</h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">{page.variationsDescription}</p>
            </div>
          </div>
          <div className="mt-5">
            <BulletList items={page.variations} />
          </div>
        </section>

        <section className="rounded-2xl border bg-card p-6">
          <div className="flex items-start gap-3">
            <Sparkles className="mt-0.5 size-5 text-muted-foreground" />
            <div>
              <h2 className="text-xl font-semibold">{page.trackingTitle}</h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">{page.trackingDescription}</p>
            </div>
          </div>
          <div className="mt-5">
            <BulletList items={page.trackingItems} />
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
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  <EmailText text={faq.answer} />
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border bg-card p-6">
          <h2 className="text-xl font-semibold">{page.setupTitle}</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {page.setupItems.map((item, index) => (
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

        <section className="rounded-2xl border bg-muted/20 p-6">
          <h2 className="text-xl font-semibold">{page.bestPracticesTitle}</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {page.bestPractices.map((practice) => (
              <Card key={practice.title} className="rounded-2xl">
                <CardHeader>
                  <CardTitle>{practice.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <BulletList items={practice.items} />
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

import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  HelpCircle,
  Mail,
  RefreshCcw,
  Upload,
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
  | { type: 'csv'; text: string }
  | { type: 'columns'; title: string; columns: Array<{ name: string; description: string; example: string }> };

type Section = {
  id: string;
  icon: LucideIcon;
  title: string;
  description?: string;
  blocks: Block[];
};

type ImportExportContent = {
  title: string;
  description: string;
  note: string;
  useCases: string[];
  sections: Section[];
  updateTitle: string;
  updateDescription: string;
  updateItems: string[];
  tipsTitle: string;
  tips: string[];
  limitationsTitle: string;
  limitations: string[];
  questionsTitle: string;
  faqs: Array<{ question: string; answer: string }>;
  helpTitle: string;
  helpBody: string;
};

const content = {
  en: {
    title: 'Import & export links',
    description:
      'Move link data in and out of AffProf using CSV files. This is useful for migrations, bulk updates, UTM changes, backups, and reports.',
    note: 'Bulk CSV import is a Pro feature. Export is available on all plans, including Free.',
    useCases: [
      'Migrating from another shortener or spreadsheet.',
      'Updating destination URLs across many links at once.',
      'Adding UTM parameters to a batch of existing links.',
      'Backing up your link library before major changes.',
      'Sharing your link list with a teammate or in a report.',
    ],
    sections: [
      {
        id: 'export',
        icon: Download,
        title: 'Export your links',
        description:
          'Export downloads every link in your account into the same CSV format that import accepts.',
        blocks: [
          {
            type: 'steps',
            items: [
              'Go to **Links**.',
              'Click **Export CSV** in the top toolbar.',
              'The file downloads immediately to your computer.',
            ],
          },
          {
            type: 'paragraph',
            text: 'The export contains these columns: `product`, `link`, `slug`, `platform`, `fallback_url`, `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`, `is_enabled`, `notes`, `tags`.',
          },
          {
            type: 'bullets',
            items: [
              'Includes all links regardless of status: active, broken, or disabled.',
              'Includes metadata such as UTMs, fallbacks, notes, and tags.',
              'Tags are joined with `|`, the same format import uses.',
            ],
          },
          {
            type: 'note',
            text: 'Export does not include click analytics, health check history, or per-link brand assignments. For full analytics export, contact hello@affprof.com.',
          },
        ],
      },
      {
        id: 'workflow',
        icon: RefreshCcw,
        title: 'The export -> edit -> re-upload workflow',
        description:
          'This is the fastest way to make bulk changes once you have a few dozen links.',
        blocks: [
          {
            type: 'bullets',
            items: [
              'Update 50 destination URLs after an affiliate program rotates URLs.',
              'Add `utm_source=newsletter` to email campaign links.',
              'Rename a tag across many links at once.',
              'Disable seasonal links after a promotion ends.',
            ],
          },
          {
            type: 'steps',
            items: [
              'Export your full link list to CSV.',
              'Open the CSV in Excel, Google Sheets, Numbers, or another spreadsheet app.',
              'Make your changes with find/replace, sorting, filtering, or direct cell edits.',
              'Save as CSV. Do not change to XLSX or another format.',
              'Re-upload via **Links -> Import CSV**.',
              'AffProf updates existing links by matching the `slug` column.',
            ],
          },
          {
            type: 'note',
            text: 'Important: the match is by `slug`. If you change a slug in the CSV, AffProf treats it as a new link instead of updating the existing one.',
          },
        ],
      },
      {
        id: 'import-start',
        icon: Upload,
        title: 'Import: starting fresh or migrating',
        description: 'Use import when you want to add bulk content to AffProf.',
        blocks: [
          {
            type: 'steps',
            items: [
              'Go to **Links** and click **Import CSV** in the top toolbar.',
              'Drag a CSV into the dropzone or browse for one on your computer.',
              'If this is your first import, click **Download template**.',
              'Use the **Fields & example** tab to see every accepted column.',
            ],
          },
          { type: 'screenshot', label: 'import-link-step1.png' },
          { type: 'screenshot', label: 'import-link-step2-fields-example.png' },
        ],
      },
      {
        id: 'columns',
        icon: FileSpreadsheet,
        title: 'CSV columns',
        description: 'Four columns are required. Optional columns enrich the imported links.',
        blocks: [
          {
            type: 'columns',
            title: 'Required columns',
            columns: [
              { name: 'product', description: 'Product name. Created automatically if missing.', example: 'Blue Yeti Microphone' },
              { name: 'link', description: 'The destination affiliate URL.', example: 'https://www.amazon.com/dp/B002VA464S' },
              { name: 'slug', description: 'Short link slug. Lowercase letters, numbers, and hyphens only.', example: 'blue-yeti-amazon' },
              { name: 'platform', description: 'Affiliate network or marketplace.', example: 'amazon' },
            ],
          },
          {
            type: 'columns',
            title: 'Optional columns',
            columns: [
              { name: 'fallback_url', description: 'Backup destination if the link breaks.', example: 'https://yourbrand.com/backup' },
              { name: 'utm_source', description: 'UTM source parameter.', example: 'instagram' },
              { name: 'utm_medium', description: 'UTM medium parameter.', example: 'bio' },
              { name: 'utm_campaign', description: 'UTM campaign parameter.', example: 'spring-launch' },
              { name: 'utm_content', description: 'UTM content parameter.', example: 'hero-button' },
              { name: 'utm_term', description: 'UTM term parameter.', example: 'creator-tools' },
              { name: 'is_enabled', description: 'Accepts `true/false`, `yes/no`, or `1/0`.', example: 'true' },
              { name: 'notes', description: 'Internal note, only visible to you.', example: 'Best performer in Instagram bio' },
              { name: 'tags', description: 'Pipe-separated tag names. Max 10 per link.', example: 'amazon|tech|review' },
            ],
          },
          {
            type: 'csv',
            text: 'product,link,slug,platform\nBlue Yeti Microphone,https://www.amazon.com/dp/B002VA464S,blue-yeti-amazon,amazon\nKindle Paperwhite,https://www.amazon.com/dp/B0CFPHTMDX,kindle-paperwhite-amazon,amazon\nNotion,https://affiliate.notion.so/abc123,notion-affiliate,notion',
          },
        ],
      },
      {
        id: 'preview-errors',
        icon: Wrench,
        title: 'Upload, preview, and fix issues',
        description: 'AffProf previews valid rows and shows exactly what needs fixing.',
        blocks: [
          { type: 'screenshot', label: 'import-link-step3.png' },
          {
            type: 'bullets',
            items: [
              'You see the total number of valid rows ready to import.',
              'A preview table shows the first rows for spot-checking.',
              'Row numbers match the original CSV.',
              'Use **Replace** if the file looks wrong.',
            ],
          },
          { type: 'screenshot', label: 'import-link-step4-if-there-are-errors.png' },
          {
            type: 'bullets',
            items: [
              'Invalid URL: must start with `http://` or `https://`.',
              'Invalid slug: only lowercase letters, numbers, and hyphens.',
              'Missing required field: `product`, `link`, `slug`, or `platform` is empty.',
              'Slug conflict: slug already exists or appears twice in the CSV.',
              'Slug too long: max 100 characters.',
            ],
          },
          {
            type: 'note',
            text: 'You can import valid rows now and fix the rest later, or fix everything first and click **Replace** to upload the corrected CSV.',
          },
        ],
      },
      {
        id: 'confirm',
        icon: CheckCircle2,
        title: 'Confirm import',
        description: 'When all rows look good, click **Import links**.',
        blocks: [
          { type: 'screenshot', label: 'import-link-step5.png' },
          {
            type: 'paragraph',
            text: 'AffProf processes the batch and shows how many links were created or updated. Close the dialog and your links appear immediately in the Links table.',
          },
        ],
      },
    ],
    updateTitle: 'How updates work',
    updateDescription:
      'For each CSV row, AffProf checks whether a link with that slug already exists in your account.',
    updateItems: [
      'If yes, AffProf updates that link with the new CSV values. Everything except the slug itself can change.',
      'If no, AffProf creates a new link.',
      'The slug is the identity of a link. To rename a slug safely, export, change the slug, import as a new link, then delete the old one.',
    ],
    tipsTitle: 'Tips for clean imports',
    tips: [
      'Keep your CSV in UTF-8.',
      'Quote fields with commas, for example `"Notion, the all-in-one workspace"`.',
      'Start directly with column names: `product,link,slug,...`.',
      'Test with 5-10 rows before importing hundreds.',
      'Use pipe for tags, not commas: `amazon|tech|review`.',
      'Save as CSV, not XLSX.',
    ],
    limitationsTitle: 'Limitations',
    limitations: [
      'Maximum 10 tags per link. Extra tags are ignored.',
      'Slugs must be unique within your account.',
      'CSV files only. XLSX, ODS, and other formats must be exported to CSV first.',
      'Per-link brand assignments are not included in import/export.',
    ],
    questionsTitle: 'Common questions',
    faqs: [
      {
        question: 'If I delete a link, will it come back if I re-upload my old CSV?',
        answer:
          'Yes. Import creates new links for any slug not currently in your account, with no previous analytics history.',
      },
      {
        question: 'Can I delete links via CSV?',
        answer: 'No. Deletion must be done through the UI for safety. CSV import only creates and updates.',
      },
      {
        question: 'What happens if I change the slug in my CSV?',
        answer:
          'AffProf treats it as a new link. The old link with the old slug stays unchanged.',
      },
      {
        question: 'Can I use export to back up links before a big change?',
        answer:
          'Yes. Export before bulk changes so you can restore most fields later if needed.',
      },
      {
        question: 'Why does export not include analytics?',
        answer:
          'Click data is large and changes often. Use Dashboard or per-link analytics for current analytics.',
      },
      {
        question: 'Can I schedule recurring exports?',
        answer:
          'Not currently. Each export is manual. Tell us at hello@affprof.com if scheduled exports matter to your workflow.',
      },
    ],
    helpTitle: 'Need help with a specific CSV?',
    helpBody:
      'Email hello@affprof.com with your file attached and a description of what you are trying to do. We respond within 24 hours, faster for Pro users.',
  },
  es: {
    title: 'Importar y exportar links',
    description:
      'Mueve data de links dentro y fuera de AffProf usando archivos CSV. Es útil para migraciones, cambios masivos, UTMs, backups y reportes.',
    note:
      'La importación masiva por CSV es una feature Pro. La exportación está disponible en todos los planes, incluyendo Free.',
    useCases: [
      'Migrar desde otro acortador o una hoja de cálculo.',
      'Actualizar URLs de destino a través de muchos links a la vez.',
      'Agregar UTM parameters a un batch de links existentes.',
      'Hacer backup de tu librería antes de cambios mayores.',
      'Compartir tu lista de links con un colega o en un reporte.',
    ],
    sections: [
      {
        id: 'export',
        icon: Download,
        title: 'Exportar tus links',
        description:
          'Export descarga cada link en tu cuenta en el mismo formato CSV que acepta el import.',
        blocks: [
          {
            type: 'steps',
            items: [
              'Ve a **Links**.',
              'Haz clic en **Export CSV** en la barra superior.',
              'El archivo se descarga inmediatamente a tu computadora.',
            ],
          },
          {
            type: 'paragraph',
            text: 'El export contiene estas columnas: `product`, `link`, `slug`, `platform`, `fallback_url`, `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`, `is_enabled`, `notes`, `tags`.',
          },
          {
            type: 'bullets',
            items: [
              'Incluye todos los links sin importar status: activo, roto o deshabilitado.',
              'Incluye metadata como UTMs, fallbacks, notas y tags.',
              'Los tags se unen con `|`, el mismo formato que usa el import.',
            ],
          },
          {
            type: 'note',
            text: 'Export no incluye analytics de clicks, historial de chequeos de salud ni asignaciones de brand por link. Para exportación completa de analytics, contáctanos a hello@affprof.com.',
          },
        ],
      },
      {
        id: 'workflow',
        icon: RefreshCcw,
        title: 'El workflow export -> editar -> re-subir',
        description:
          'Esta es la forma más rápida de hacer cambios masivos cuando ya tienes algunas docenas de links.',
        blocks: [
          {
            type: 'bullets',
            items: [
              'Actualizar 50 URLs de destino cuando un programa rota URLs.',
              'Agregar `utm_source=newsletter` a links de campañas de email.',
              'Renombrar un tag a través de muchos links.',
              'Deshabilitar links estacionales después de una promoción.',
            ],
          },
          {
            type: 'steps',
            items: [
              'Exporta tu lista completa a CSV.',
              'Abre el CSV en Excel, Google Sheets, Numbers u otra app.',
              'Haz cambios con find/replace, sort, filter o edición directa.',
              'Guarda como CSV. No cambies a XLSX u otro formato.',
              'Re-sube vía **Links -> Import CSV**.',
              'AffProf actualiza links existentes haciendo match por `slug`.',
            ],
          },
          {
            type: 'note',
            text: 'Importante: el match es por `slug`. Si cambias un slug en el CSV, AffProf lo trata como un link nuevo en vez de actualizar el existente.',
          },
        ],
      },
      {
        id: 'import-start',
        icon: Upload,
        title: 'Importar: empezando de cero o migrando',
        description: 'Usa import cuando quieres meter contenido masivo en AffProf.',
        blocks: [
          {
            type: 'steps',
            items: [
              'Ve a **Links** y haz clic en **Import CSV** en la barra superior.',
              'Arrastra un CSV al dropzone o búscalo en tu computadora.',
              'Si es tu primer import, haz clic en **Download template**.',
              'Usa la pestaña **Fields & example** para ver cada columna aceptada.',
            ],
          },
          { type: 'screenshot', label: 'import-link-step1.png' },
          { type: 'screenshot', label: 'import-link-step2-fields-example.png' },
        ],
      },
      {
        id: 'columns',
        icon: FileSpreadsheet,
        title: 'Columnas CSV',
        description: 'Cuatro columnas son requeridas. Las opcionales enriquecen los links importados.',
        blocks: [
          {
            type: 'columns',
            title: 'Columnas requeridas',
            columns: [
              { name: 'product', description: 'Nombre del producto. Se crea automáticamente si no existe.', example: 'Blue Yeti Microphone' },
              { name: 'link', description: 'URL de destino del afiliado.', example: 'https://www.amazon.com/dp/B002VA464S' },
              { name: 'slug', description: 'Slug del link corto. Solo minúsculas, números y guiones.', example: 'blue-yeti-amazon' },
              { name: 'platform', description: 'Red o marketplace de afiliados.', example: 'amazon' },
            ],
          },
          {
            type: 'columns',
            title: 'Columnas opcionales',
            columns: [
              { name: 'fallback_url', description: 'Destino de respaldo si el link se rompe.', example: 'https://tumarca.com/backup' },
              { name: 'utm_source', description: 'UTM source parameter.', example: 'instagram' },
              { name: 'utm_medium', description: 'UTM medium parameter.', example: 'bio' },
              { name: 'utm_campaign', description: 'UTM campaign parameter.', example: 'spring-launch' },
              { name: 'utm_content', description: 'UTM content parameter.', example: 'hero-button' },
              { name: 'utm_term', description: 'UTM term parameter.', example: 'creator-tools' },
              { name: 'is_enabled', description: 'Acepta `true/false`, `yes/no`, o `1/0`.', example: 'true' },
              { name: 'notes', description: 'Nota interna, solo visible para ti.', example: 'El que mejor performa en bio de Instagram' },
              { name: 'tags', description: 'Tags separados por pipe. Máximo 10 por link.', example: 'amazon|tech|review' },
            ],
          },
          {
            type: 'csv',
            text: 'product,link,slug,platform\nBlue Yeti Microphone,https://www.amazon.com/dp/B002VA464S,blue-yeti-amazon,amazon\nKindle Paperwhite,https://www.amazon.com/dp/B0CFPHTMDX,kindle-paperwhite-amazon,amazon\nNotion,https://affiliate.notion.so/abc123,notion-affiliate,notion',
          },
        ],
      },
      {
        id: 'preview-errors',
        icon: Wrench,
        title: 'Sube, previsualiza y arregla issues',
        description: 'AffProf muestra filas válidas y exactamente qué debes corregir.',
        blocks: [
          { type: 'screenshot', label: 'import-link-step3.png' },
          {
            type: 'bullets',
            items: [
              'Ves el total de filas válidas listas para importar.',
              'Una tabla preview muestra las primeras filas para revisar.',
              'Los números de fila coinciden con el CSV original.',
              'Usa **Replace** si el archivo se ve mal.',
            ],
          },
          { type: 'screenshot', label: 'import-link-step4-if-there-are-errors.png' },
          {
            type: 'bullets',
            items: [
              'URL inválida: debe empezar con `http://` o `https://`.',
              'Slug inválido: solo minúsculas, números y guiones.',
              'Campo requerido faltante: `product`, `link`, `slug`, o `platform` está vacío.',
              'Conflicto de slug: el slug ya existe o aparece dos veces en el CSV.',
              'Slug muy largo: máximo 100 caracteres.',
            ],
          },
          {
            type: 'note',
            text: 'Puedes importar filas válidas ahora y arreglar el resto después, o arreglar todo primero y hacer clic en **Replace** para subir el CSV corregido.',
          },
        ],
      },
      {
        id: 'confirm',
        icon: CheckCircle2,
        title: 'Confirma la importación',
        description: 'Cuando todas las filas se vean bien, haz clic en **Import links**.',
        blocks: [
          { type: 'screenshot', label: 'import-link-step5.png' },
          {
            type: 'paragraph',
            text: 'AffProf procesa el batch y muestra cuántos links se crearon o actualizaron. Cierra el diálogo y tus links aparecen inmediatamente en la tabla de Links.',
          },
        ],
      },
    ],
    updateTitle: 'Cómo funcionan las actualizaciones',
    updateDescription:
      'Por cada fila CSV, AffProf revisa si ya existe un link con ese slug en tu cuenta.',
    updateItems: [
      'Si sí, AffProf actualiza ese link con los nuevos valores del CSV. Todo excepto el slug puede cambiar.',
      'Si no, AffProf crea un link nuevo.',
      'El slug es la identidad de un link. Para renombrar un slug de forma segura, exporta, cambia el slug, importa como link nuevo y borra el viejo.',
    ],
    tipsTitle: 'Tips para imports limpios',
    tips: [
      'Mantén tu CSV en UTF-8.',
      'Pon comillas a campos con comas, por ejemplo `"Notion, el workspace todo en uno"`.',
      'Empieza directamente con nombres de columnas: `product,link,slug,...`.',
      'Prueba con 5-10 filas antes de importar cientos.',
      'Usa pipe para tags, no comas: `amazon|tech|review`.',
      'Guarda como CSV, no XLSX.',
    ],
    limitationsTitle: 'Limitaciones',
    limitations: [
      'Máximo 10 tags por link. Tags extra se ignoran.',
      'Los slugs deben ser únicos dentro de tu cuenta.',
      'Solo CSV. XLSX, ODS y otros formatos deben exportarse a CSV primero.',
      'Asignaciones de brand por link no se incluyen en import/export.',
    ],
    questionsTitle: 'Preguntas comunes',
    faqs: [
      {
        question: 'Si borro un link, ¿volverá si re-subo mi CSV viejo?',
        answer:
          'Sí. Import crea links nuevos para cualquier slug que no esté actualmente en tu cuenta, sin historial de analytics anterior.',
      },
      {
        question: '¿Puedo borrar links vía CSV?',
        answer: 'No. La eliminación debe hacerse por UI por seguridad. CSV import solo crea y actualiza.',
      },
      {
        question: '¿Qué pasa si cambio el slug en mi CSV?',
        answer:
          'AffProf lo trata como link nuevo. El link viejo con el slug viejo queda sin cambios.',
      },
      {
        question: '¿Puedo usar export para backup antes de un cambio grande?',
        answer:
          'Sí. Exporta antes de cambios masivos para poder restaurar la mayoría de campos después.',
      },
      {
        question: '¿Por qué el export no incluye analytics?',
        answer:
          'La data de clicks es grande y cambia seguido. Usa Dashboard o analytics por link para datos actuales.',
      },
      {
        question: '¿Puedo programar exports recurrentes?',
        answer:
          'Actualmente no. Cada export es manual. Avísanos a hello@affprof.com si exports programados importan para tu workflow.',
      },
    ],
    helpTitle: '¿Necesitas ayuda con un CSV específico?',
    helpBody:
      'Escribe a hello@affprof.com con tu archivo adjunto y una descripción de qué estás tratando de hacer. Respondemos dentro de 24 horas, más rápido para usuarios Pro.',
  },
} satisfies Record<Locale, ImportExportContent>;

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
    case 'csv':
      return <pre className="overflow-x-auto rounded-xl border bg-muted/30 p-4 text-xs leading-5 text-foreground"><code>{block.text}</code></pre>;
    case 'columns':
      return (
        <div className="overflow-hidden rounded-xl border">
          <div className="border-b bg-muted/30 px-4 py-3 text-sm font-medium">{block.title}</div>
          <div className="divide-y">
            {block.columns.map((column) => (
              <div key={column.name} className="grid gap-2 px-4 py-3 text-sm md:grid-cols-[150px_1fr_220px]">
                <code className="font-mono text-foreground">{column.name}</code>
                <div className="text-muted-foreground"><EmailText text={column.description} /></div>
                <div className="font-mono text-xs text-muted-foreground">{column.example}</div>
              </div>
            ))}
          </div>
        </div>
      );
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await getLocale()) as Locale;
  return { title: content[locale].title };
}

export default async function ImportExportHelpPage() {
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
            <FileSpreadsheet className="size-6 text-primary" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{page.title}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">{page.description}</p>
          <div className="mt-4 rounded-xl border bg-muted/30 p-4 text-sm leading-6 text-muted-foreground">
            {page.note}
          </div>
          <div className="mt-5">
            <BulletList items={page.useCases} />
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
                {blocks.map((block, index) => (
                  <RenderBlock key={`${id}-${index}`} block={block} />
                ))}
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="rounded-2xl border bg-card p-6">
          <h2 className="text-xl font-semibold">{page.updateTitle}</h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">{page.updateDescription}</p>
          <div className="mt-4">
            <BulletList items={page.updateItems} />
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <Card className="rounded-2xl">
            <CardHeader><CardTitle>{page.tipsTitle}</CardTitle></CardHeader>
            <CardContent><BulletList items={page.tips} /></CardContent>
          </Card>
          <Card className="rounded-2xl">
            <CardHeader><CardTitle>{page.limitationsTitle}</CardTitle></CardHeader>
            <CardContent><BulletList items={page.limitations} /></CardContent>
          </Card>
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

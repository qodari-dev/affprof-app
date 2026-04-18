export type EmailLocale = 'en' | 'es';

const translations = {
  en: {
    // Layout footer
    footerReceiving: "You're receiving this because notifications are enabled on your AffProf account.",
    footerManage: 'Manage notifications',
    footerOpen: 'Open AffProf',
    footerCopyright: 'All rights reserved.',

    // Broken links email
    brokenBadge: '⚠\u00a0\u00a0Broken links detected',
    brokenHeadingSingle: '1 link needs your attention',
    brokenHeadingPlural: (n: number) => `${n} links need your attention`,
    brokenIntro: (name: string) =>
      `Hi ${name}, we ran a health check and found broken links that may be costing you affiliate revenue. Act fast to avoid losing commissions.`,
    brokenColLink: 'Link / Product',
    brokenColState: 'State',
    brokenColHttp: 'HTTP',
    brokenColResponse: 'Response',
    brokenStateNew: 'Newly broken',
    brokenStateStill: 'Still broken',
    brokenCta: 'Review and fix now →',
    brokenFooterNote: 'You can disable alerts for specific links from your',
    brokenFooterLink: 'notification settings',
    subjectSingle: '⚠ 1 broken affiliate link detected',
    subjectPlural: (n: number) => `⚠ ${n} broken affiliate links detected`,

    // Weekly digest email
    weeklyBadge: '📊\u00a0\u00a0Weekly summary',
    weeklyHeading: 'Your week in review',
    weeklyIntro: (name: string, period: string) =>
      `Hi ${name}, here's how your affiliate links performed from ${period}.`,
    weeklyStatClicks: 'Total clicks',
    weeklyStatLinks: 'Active links',
    weeklyStatBroken: 'Broken links',
    weeklyStatAllHealthy: 'All healthy ✓',
    weeklyStatNeedsAttention: 'Needs attention',
    weeklyTopLinks: 'Top performing links',
    weeklyNoClicks: 'No clicks recorded this week.',
    weeklyColLink: 'Link / Product',
    weeklyColClicks: 'Clicks',
    weeklyBrokenBadge: (n: number) => `⚠\u00a0\u00a0${n} broken ${n === 1 ? 'link' : 'links'}`,
    weeklyColHttp: 'HTTP status',
    weeklyCta: 'Open dashboard →',
    weeklyFooterNote: 'You can change your digest day and time in',
    weeklyFooterLink: 'notification settings',
    weeklySubject: (period: string) => `Your weekly AffProf summary — ${period}`,
    preheaderWeekly: (clicks: number, links: number, broken: number) =>
      `${clicks.toLocaleString()} clicks · ${links} active links · ${broken > 0 ? `${broken} broken` : 'all healthy'} — your week in review.`,
    preheaderBroken: (n: number) =>
      `${n} broken affiliate ${n === 1 ? 'link' : 'links'} detected — act now to protect your commissions.`,
  },

  es: {
    // Layout footer
    footerReceiving: 'Recibes este correo porque tienes las notificaciones activadas en tu cuenta de AffProf.',
    footerManage: 'Gestionar notificaciones',
    footerOpen: 'Abrir AffProf',
    footerCopyright: 'Todos los derechos reservados.',

    // Broken links email
    brokenBadge: '⚠\u00a0\u00a0Enlaces rotos detectados',
    brokenHeadingSingle: '1 enlace necesita tu atención',
    brokenHeadingPlural: (n: number) => `${n} enlaces necesitan tu atención`,
    brokenIntro: (name: string) =>
      `Hola ${name}, realizamos una revisión de salud y encontramos enlaces rotos que pueden estar costándote ingresos de afiliado. Actúa rápido para no perder comisiones.`,
    brokenColLink: 'Enlace / Producto',
    brokenColState: 'Estado',
    brokenColHttp: 'HTTP',
    brokenColResponse: 'Respuesta',
    brokenStateNew: 'Recién roto',
    brokenStateStill: 'Sigue roto',
    brokenCta: 'Revisar y corregir →',
    brokenFooterNote: 'Puedes desactivar alertas para enlaces específicos desde tus',
    brokenFooterLink: 'ajustes de notificaciones',
    subjectSingle: '⚠ 1 enlace de afiliado roto detectado',
    subjectPlural: (n: number) => `⚠ ${n} enlaces de afiliado rotos detectados`,

    // Weekly digest email
    weeklyBadge: '📊\u00a0\u00a0Resumen semanal',
    weeklyHeading: 'Tu semana en resumen',
    weeklyIntro: (name: string, period: string) =>
      `Hola ${name}, así funcionaron tus enlaces de afiliado del ${period}.`,
    weeklyStatClicks: 'Clics totales',
    weeklyStatLinks: 'Enlaces activos',
    weeklyStatBroken: 'Enlaces rotos',
    weeklyStatAllHealthy: 'Todos saludables ✓',
    weeklyStatNeedsAttention: 'Requiere atención',
    weeklyTopLinks: 'Enlaces con mejor rendimiento',
    weeklyNoClicks: 'No se registraron clics esta semana.',
    weeklyColLink: 'Enlace / Producto',
    weeklyColClicks: 'Clics',
    weeklyBrokenBadge: (n: number) => `⚠\u00a0\u00a0${n} ${n === 1 ? 'enlace roto' : 'enlaces rotos'}`,
    weeklyColHttp: 'Estado HTTP',
    weeklyCta: 'Abrir panel →',
    weeklyFooterNote: 'Puedes cambiar el día y hora de tu resumen en',
    weeklyFooterLink: 'ajustes de notificaciones',
    weeklySubject: (period: string) => `Tu resumen semanal de AffProf — ${period}`,
    preheaderWeekly: (clicks: number, links: number, broken: number) =>
      `${clicks.toLocaleString()} clics · ${links} enlaces activos · ${broken > 0 ? `${broken} rotos` : 'todos saludables'} — tu semana en resumen.`,
    preheaderBroken: (n: number) =>
      `${n} ${n === 1 ? 'enlace de afiliado roto' : 'enlaces de afiliado rotos'} detectado${n === 1 ? '' : 's'} — actúa ahora para proteger tus comisiones.`,
  },
} as const;

const welcomeTranslations = {
  en: {
    subject: "Welcome to AffProf — let's protect your commissions 🚀",
    preheader: 'Your affiliate link manager is ready. Add your first link and start tracking.',
    badge: '👋  Welcome aboard',
    heading: (name: string) => `Welcome, ${name}!`,
    body: 'You\'re now set up on AffProf — your command center for affiliate links. Here\'s what you can do:',
    feature1Title: 'Add your affiliate links',
    feature1Desc: 'Shorten and organize all your affiliate URLs in one place.',
    feature2Title: 'Track every click',
    feature2Desc: 'See which links perform best, by product, country, and source.',
    feature3Title: 'Get alerts when links break',
    feature3Desc: 'We check your links automatically and notify you before you lose commissions.',
    cta: 'Add your first link →',
    footerNote: 'Questions? Reply to this email — we\'re happy to help.',
  },
  es: {
    subject: 'Bienvenido a AffProf — protejamos tus comisiones 🚀',
    preheader: 'Tu gestor de enlaces de afiliado está listo. Agrega tu primer enlace y empieza a rastrear.',
    badge: '👋  Bienvenido',
    heading: (name: string) => `¡Bienvenido, ${name}!`,
    body: 'Ya estás en AffProf — tu centro de control para enlaces de afiliado. Esto es lo que puedes hacer:',
    feature1Title: 'Agrega tus enlaces de afiliado',
    feature1Desc: 'Acorta y organiza todas tus URLs de afiliado en un solo lugar.',
    feature2Title: 'Rastrea cada clic',
    feature2Desc: 'Ve qué enlaces rinden mejor, por producto, país y fuente.',
    feature3Title: 'Recibe alertas cuando los enlaces se rompan',
    feature3Desc: 'Revisamos tus enlaces automáticamente y te avisamos antes de que pierdas comisiones.',
    cta: 'Agregar tu primer enlace →',
    footerNote: '¿Preguntas? Responde este correo — con gusto te ayudamos.',
  },
} as const;

const subscriptionTranslations = {
  en: {
    subjectTrial: (plan: string) => `Your ${plan} trial is active — 14 days, on us 🎉`,
    subjectPaid: (plan: string) => `Welcome to ${plan} — you're all set 🎉`,
    preheaderTrial: 'Your 14-day free trial has started. No charge until it ends.',
    preheaderPaid: 'Your Pro subscription is now active. All features unlocked.',
    badgeTrial: '🎉  Trial activated',
    badgePaid: '🎉  Subscription activated',
    headingTrial: (name: string) => `You're on trial, ${name}!`,
    headingPaid: (name: string) => `You're all set, ${name}!`,
    bodyTrial: (trialEnd: string) => `Your 14-day free trial started today. You won't be charged until ${trialEnd}. Cancel anytime before that — no questions asked.`,
    bodyPaid: 'Your Pro subscription is now active. All features are unlocked and ready to use.',
    unlockedTitle: 'What\'s unlocked with Pro:',
    unlock1: 'Unlimited affiliate links',
    unlock2: 'Link health checks 4× per day',
    unlock3: 'Custom domains & branded QR codes',
    unlock4: 'Bulk import via CSV',
    unlock5: 'Fallback URLs',
    planLabel: 'Plan',
    billingLabel: 'Billing',
    billingMonthly: 'Monthly',
    billingAnnual: 'Annual',
    trialEndsLabel: 'Trial ends',
    cta: 'Explore Pro features →',
    footerNote: 'Manage your subscription anytime from',
    footerLink: 'billing settings',
  },
  es: {
    subjectTrial: (plan: string) => `Tu prueba de ${plan} está activa — 14 días, sin costo 🎉`,
    subjectPaid: (plan: string) => `Bienvenido a ${plan} — ya está todo listo 🎉`,
    preheaderTrial: 'Tu prueba gratuita de 14 días ha comenzado. Sin cobro hasta que termine.',
    preheaderPaid: 'Tu suscripción Pro está activa. Todas las funciones desbloqueadas.',
    badgeTrial: '🎉  Prueba activada',
    badgePaid: '🎉  Suscripción activada',
    headingTrial: (name: string) => `¡Estás en prueba, ${name}!`,
    headingPaid: (name: string) => `¡Todo listo, ${name}!`,
    bodyTrial: (trialEnd: string) => `Tu prueba gratuita de 14 días comenzó hoy. No se te cobrará hasta el ${trialEnd}. Cancela en cualquier momento antes de esa fecha, sin preguntas.`,
    bodyPaid: 'Tu suscripción Pro ya está activa. Todas las funciones están desbloqueadas y listas para usar.',
    unlockedTitle: 'Lo que desbloqueas con Pro:',
    unlock1: 'Enlaces de afiliado ilimitados',
    unlock2: 'Verificación de salud de enlaces 4× al día',
    unlock3: 'Dominios personalizados y códigos QR con tu marca',
    unlock4: 'Importación masiva por CSV',
    unlock5: 'URLs de respaldo (fallback)',
    planLabel: 'Plan',
    billingLabel: 'Facturación',
    billingMonthly: 'Mensual',
    billingAnnual: 'Anual',
    trialEndsLabel: 'Prueba termina',
    cta: 'Explorar funciones Pro →',
    footerNote: 'Gestiona tu suscripción en cualquier momento desde',
    footerLink: 'ajustes de facturación',
  },
} as const;

export function getEmailTranslations(locale: EmailLocale) {
  return translations[locale] ?? translations.en;
}

export function getWelcomeTranslations(locale: EmailLocale) {
  return welcomeTranslations[locale] ?? welcomeTranslations.en;
}

export function getSubscriptionTranslations(locale: EmailLocale) {
  return subscriptionTranslations[locale] ?? subscriptionTranslations.en;
}

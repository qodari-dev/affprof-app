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
    badge: '👋  Welcome to AffProf',
    heading: (name: string) => `You're all set, ${name}`,
    body: 'Your account is ready. Now let\'s start protecting your affiliate revenue.',
    feature1Title: 'Add your affiliate links',
    feature1Desc: 'Turn messy URLs into clean, trackable links in seconds.',
    feature2Title: 'Track every click',
    feature2Desc: 'See exactly what content is making you money.',
    feature3Title: 'Get alerts before you lose money',
    feature3Desc: 'We monitor your links and notify you before broken links cost you commissions.',
    cta: 'Add your first link and start tracking →',
    footerNote: 'Have questions? Just reply — we\'ll help you get set up.',
  },
  es: {
    subject: 'Bienvenido a AffProf — protejamos tus comisiones 🚀',
    preheader: 'Tu gestor de enlaces de afiliado está listo. Agrega tu primer enlace y empieza a rastrear.',
    badge: '👋  Bienvenido a AffProf',
    heading: (name: string) => `Todo listo, ${name}`,
    body: 'Tu cuenta está lista. Ahora empecemos a proteger tus ingresos de afiliados.',
    feature1Title: 'Agrega tus enlaces de afiliado',
    feature1Desc: 'Convierte URLs largas en enlaces claros y rastreables en segundos.',
    feature2Title: 'Rastrea cada clic',
    feature2Desc: 'Descubre qué contenido realmente te está generando dinero.',
    feature3Title: 'Recibe alertas antes de perder dinero',
    feature3Desc: 'Monitoreamos tus enlaces y te avisamos antes de que pierdas comisiones.',
    cta: 'Agrega tu primer enlace y empieza a rastrear →',
    footerNote: '¿Tienes preguntas? Responde este correo — te ayudamos a empezar.',
  },
} as const;

const subscriptionTranslations = {
  en: {
    subjectTrial: (_plan: string) => `Pro trial started 🚀`,
    subjectPaid: (plan: string) => `Welcome to ${plan} — you're all set 🎉`,
    preheaderTrial: 'Your 14-day Pro trial has started. Full access, no limits.',
    preheaderPaid: 'Your Pro subscription is now active. All features unlocked.',
    badgeTrial: '🚀  Pro trial started',
    badgePaid: '🎉  Subscription activated',
    headingTrial: (name: string) => `You're on trial, ${name}!`,
    headingPaid: (name: string) => `You're all set, ${name}!`,
    bodyTrial: (trialEnd: string) => `Your 14-day Pro trial has started. You now have full access to everything — no limits. Cancel anytime before ${trialEnd}.`,
    bodyPaid: 'Your Pro subscription is now active. All features are unlocked and ready to use.',
    unlockedTitle: 'Here\'s what you can start using right now:',
    unlock1: 'Create unlimited affiliate links',
    unlock2: 'Catch broken links faster with 4× daily checks',
    unlock3: 'Use your own domain and branded QR codes',
    unlock4: 'Import your entire link library in seconds',
    unlock5: 'Never send traffic to a dead link again',
    planLabel: 'Plan',
    billingLabel: 'Billing',
    billingMonthly: 'Monthly',
    billingAnnual: 'Annual',
    trialEndsLabel: 'Trial ends',
    cta: 'Start using Pro now →',
    footerNote: 'Manage or cancel anytime from your',
    footerLink: 'billing settings',
  },
  es: {
    subjectTrial: (_plan: string) => `Prueba Pro iniciada 🚀`,
    subjectPaid: (plan: string) => `Bienvenido a ${plan} — ya está todo listo 🎉`,
    preheaderTrial: 'Tu prueba Pro de 14 días ha comenzado. Acceso completo, sin límites.',
    preheaderPaid: 'Tu suscripción Pro está activa. Todas las funciones desbloqueadas.',
    badgeTrial: '🚀  Prueba Pro iniciada',
    badgePaid: '🎉  Suscripción activada',
    headingTrial: (name: string) => `¡Estás en prueba, ${name}!`,
    headingPaid: (name: string) => `¡Todo listo, ${name}!`,
    bodyTrial: (trialEnd: string) => `Tu prueba Pro de 14 días ha comenzado. Ahora tienes acceso completo a todas las funcionalidades — sin límites. Cancela cuando quieras antes del ${trialEnd}.`,
    bodyPaid: 'Tu suscripción Pro ya está activa. Todas las funciones están desbloqueadas y listas para usar.',
    unlockedTitle: 'Esto es lo que puedes empezar a usar desde ahora:',
    unlock1: 'Crea enlaces de afiliado ilimitados',
    unlock2: 'Detecta enlaces rotos más rápido con revisiones 4× al día',
    unlock3: 'Usa tu propio dominio y códigos QR personalizados',
    unlock4: 'Importa toda tu librería de enlaces en segundos',
    unlock5: 'Nunca vuelvas a enviar tráfico a un enlace roto',
    planLabel: 'Plan',
    billingLabel: 'Facturación',
    billingMonthly: 'Mensual',
    billingAnnual: 'Anual',
    trialEndsLabel: 'Prueba termina',
    cta: 'Empieza a usar Pro ahora →',
    footerNote: 'Gestiona o cancela cuando quieras desde tu',
    footerLink: 'configuración de pagos',
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

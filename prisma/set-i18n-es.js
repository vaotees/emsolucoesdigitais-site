/**
 * Grava a versão em espanhol (/es) do conteúdo do banco, na coluna i18n de cada tabela: i18n = { ..., es: { ... } }.
 * O que não estiver aqui aparece em português no site em espanhol (ver src/lib/localize.ts e docs/i18n.md).
 * Mesma estrutura de prisma/set-i18n-en.js: mudou o português, atualize os dois.
 *
 * - Cases (ClientProject): campos do projeto, destaques técnicos (pelo título em português) e caseContent.
 *   Listas do caseContent seguem a posição: o item 2 traduz o item 2 da versão em português.
 * - Serviços (Feature): pelo título em português. Depoimentos (Testimonial): pelo nome do autor.
 * - Configurações das seções (hero, serviços, depoimentos).
 *
 * Regras de conteúdo: tradução natural, sem inventar números ou recursos. Depoimentos são tradução fiel
 * (o site mostra "Traducido del portugués") e a frase em destaque precisa ser trecho do próprio texto.
 * A LIMPO.AI não mostra preços no site: o preço é combinado no WhatsApp.
 *
 * Simulação:  node --env-file=.env prisma/set-i18n-es.js
 * Aplicar:    node --env-file=.env prisma/set-i18n-es.js --apply
 * Backup das colunas i18n atuais em backups/ (ou em BACKUP_DIR) antes de gravar.
 */
const fs = require('fs')
const path = require('path')
const { PrismaClient } = require('@prisma/client')
const { revalidateSite } = require('./revalidate-site')

const prisma = new PrismaClient()
const APPLY = process.argv.includes('--apply')
const LOCALE = 'es'

const TEAM = 'En solitario, del diseño al deploy'
const FIGMA_HEAD = { eyebrow: 'Diseño en Figma', title: 'Del design system', highlight: 'al prototipo' }

/* ─── Cases ─────────────────────────────────────────────── */

const PROJECTS = {
  condomira: {
    category: 'Producto · Gestión de condominios',
    tagline: 'Una plataforma completa para empresas administradoras de condominios',
    description:
      'Sitio web corporativo, portal del condominio para administrador, residentes y portería, y panel de administración con CMS en un único producto de EM Soluções Digitais, con una demo pública para probar.',
    role: 'Senior Design Engineer (Producto, UI/UX y Full-Stack)',
    status: 'Demo pública',
    challengeText:
      'Las empresas administradoras de condominios suelen trabajar con un sitio web corporativo genérico, un portal de terceros para el administrador y hojas de cálculo para todo lo demás. Dentro del condominio, la rutina está todavía más dispersa: paquetes anotados en un cuaderno en la portería, reservas del salón acordadas por mensaje y votaciones en papel. Cada sistema tiene su propia contraseña, su propia identidad visual y sus propios datos. El desafío era reunirlo todo en un único producto, con la marca de la empresa administradora, que pudiera adaptarse a un nuevo cliente sin reescribir código.',
    solutionText:
      'Desarrollamos Condomira como un monorepo con tres aplicaciones Next.js que comparten base de datos, autenticación y componentes: el sitio web corporativo, el portal del condominio y el panel de administración con CMS. El portal atiende a tres perfiles, administrador, residente y portería, cada uno con su propio menú y pantalla de inicio, y se puede instalar en el móvil como una app. El nombre, los contactos y el WhatsApp de la empresa administradora están en un único archivo de marca, así que adaptar la plataforma a un nuevo cliente es cambiar la marca, no el código.',
    impactText:
      'Un solo producto en lugar de varios proveedores: sitio web, portal del administrador, app del residente y control de la portería, con la marca y el dominio de la empresa administradora.',
    highlights: {
      'Três aplicações, uma base': { title: 'Tres aplicaciones, una base', body: 'Sitio web, portal y panel en un monorepo: la misma base de datos, la misma autenticación y los mismos componentes.' },
      'Um portal, três perfis': {
        title: 'Un portal, tres perfiles',
        body: 'Administrador, residentes y portería entran por el mismo portal, cada uno con su propio menú y pantalla de inicio. Las cuentas del panel de administración no entran en el portal.',
      },
      'Instalável no celular': { title: 'Instalable en el móvil', body: 'El portal es una PWA: el residente lo agrega a la pantalla de inicio y lo usa como una app, sin pasar por una tienda de aplicaciones.' },
      'Marca configurável em um arquivo': {
        title: 'Marca configurable en un archivo',
        body: 'El nombre, los contactos y el WhatsApp de la empresa administradora están en un único archivo de marca. Un nuevo cliente es una nueva marca, con el mismo código.',
      },
      'Documentos privados por condomínio': {
        title: 'Documentos privados por condominio',
        body: 'Los archivos se guardan en un almacenamiento privado: el panel los sube y los elimina, el portal solo entrega cada documento al condominio al que pertenece, y la empresa administradora elige qué pueden ver los residentes.',
      },
      'Demonstração que se recupera sozinha': {
        title: 'Una demo que se restablece sola',
        body: 'Los datos vuelven a su estado original todos los días a las 3:00. En la demo, el CMS, la subida de archivos y los avisos por correo están desactivados, y los buscadores no indexan el sitio.',
      },
    },
    caseContent: {
      ogEyebrow: 'Producto EM',
      notice: 'Condomira es una marca ficticia, creada para la demo pública de la plataforma.',
      heroPrimaryLabel: 'Abrir la demo',
      heroSecondaryLabel: 'Ver accesos de prueba',
      cta: {
        eyebrow: 'Para empresas administradoras',
        title: '¿Quieres la plataforma con',
        highlight: 'tu marca?',
        text: 'Adaptamos el sitio web, el portal y el panel a la identidad de tu empresa administradora, con tus servicios, contactos y dominio.',
        whatsappText: '¡Hola! Vi el caso de Condomira y me gustaría la plataforma con la marca de mi empresa administradora.',
      },
      admin: {
        eyebrow: 'Dentro del portal',
        title: 'La rutina del condominio',
        highlight: 'en un solo lugar',
        intro: 'Cada módulo aparece para quien lo necesita. Cada acción se comprueba en el servidor según el perfil y el condominio de quien ha iniciado sesión.',
        modules: [
          { title: 'Paquetes', description: 'La portería registra la llegada y el residente lo retira con un código. El historial muestra quién lo retiró y cuándo.' },
          { title: 'Reservas', description: 'Salón de fiestas, barbacoa y cancha, con tarifa, antelación mínima y límite mensual. Cuando el espacio lo exige, el administrador aprueba o rechaza.' },
          { title: 'Visitas', description: 'El residente autoriza la visita y la portería ve la lista del día y registra la entrada.' },
          { title: 'Incidencias', description: 'El residente informa de un problema y sigue la respuesta del administrador desde el portal.' },
          { title: 'Votaciones', description: 'Consultas con plazo y resultado parcial para el administrador, con un voto por unidad.' },
          { title: 'Comunicados', description: 'Avisos del administrador para todo el condominio, con los más importantes fijados arriba.' },
          { title: 'Finanzas', description: 'Para el administrador, la recaudación del mes y la morosidad por unidad. Para el residente, sus recibos y duplicados.' },
          { title: 'Cobros', description: 'En el panel, la empresa administradora carga la cuota del mes de todas las unidades, registra los pagos y adjunta el recibo en PDF.' },
          { title: 'Avisos por correo', description: 'Paquete recibido, visita en la portería, reserva aprobada o rechazada, nueva votación: cada evento avisa a quien necesita saberlo.' },
        ],
      },
      facts: {
        period: 'abr–oct 2026',
        team: TEAM,
        numbers: [{ label: 'apps en un monorepo' }, { label: 'páginas' }, { label: 'tablas en la base de datos' }, { label: 'PageSpeed del portal en móvil' }],
      },
      figma: {
        ...FIGMA_HEAD,
        text: 'El portal también está en Figma: variables con los mismos tokens del código, componentes con variantes y estados interactivos, y un prototipo navegable con los tres perfiles. La colección Marca tiene dos modos, y cambiar de modo cambia toda la identidad, como pasaría con un nuevo cliente.',
        previewAlt: 'Flujo del prototipo en Figma: inicio del residente, reservas, formulario completado y solicitud enviada, unidos por flechas de interacción',
        stats: [{ label: 'variables' }, { label: 'componentes' }, { label: 'pantallas' }, { label: 'flujos en el prototipo' }],
      },
      listing: {
        summary: 'Sitio web, portales de administrador, residente y portería y panel con CMS en un producto, con demo pública.',
        coverAlt: 'Portal del administrador de Condomira en escritorio y el sitio web en el móvil',
      },
      features: {
        eyebrow: 'El producto',
        title: 'Tres aplicaciones,',
        highlight: 'una plataforma',
        intro: 'Todo está en línea. El portal tiene tres perfiles, administrador, residente y portería, cada uno con su propio menú y pantalla de inicio. Abre cada aplicación y entra con los accesos de la demo que aparecen abajo.',
        note: 'Cómo funciona la demo: puedes crear, editar y eliminar lo que quieras. Los datos vuelven a su estado original todos los días a las 3:00 (hora de Brasilia). El CMS, la subida de archivos y los avisos por correo están desactivados, y los buscadores no indexan el sitio.',
        items: [
          {
            title: 'Sitio web corporativo',
            description: 'La vitrina de la empresa administradora: cada servicio tiene su propia página, con una URL indexable, y el formulario de contacto envía el lead directo al panel.',
            bullets: ['Inicio, servicios, casos, nosotros y contacto', 'Contacto con captación de leads'],
            screenAlt: 'Pantalla del sitio web corporativo de la demo de Condomira',
          },
          {
            title: 'Portal del administrador',
            description:
              'El administrador entra y ve el día del condominio: reservas por aprobar, incidencias abiertas, unidades morosas y paquetes en la portería. Desde el mismo portal publica comunicados, abre votaciones, da acceso a residentes y portería, y sigue contratos y solicitudes con la empresa administradora.',
            bullets: [
              'Resumen "El condominio hoy" en la pantalla de inicio',
              'Acceso de residentes y portería con contraseña temporal',
              'Comunicados, reservas, incidencias y votaciones',
              'Recaudación del mes y morosidad por unidad',
              'Contratos, documentos y solicitudes con la empresa administradora',
            ],
            screenAlt: 'Pantalla de inicio del administrador en el portal Condomira, con el resumen El condominio hoy',
          },
          {
            title: 'Portal del residente',
            description:
              'Pensado para el móvil e instalable como app. El residente ve los paquetes que llegaron con su código de retiro, reserva el salón de fiestas o la barbacoa, autoriza visitas, vota en las consultas del condominio y descarga el duplicado del recibo de la cuota.',
            bullets: [
              'Paquetes con código de retiro',
              'Reservas con las reglas de cada espacio',
              'Visitas autorizadas directo a la portería',
              'Votaciones con un voto por unidad',
              'Duplicado del recibo y documentos del condominio',
            ],
            screenAlt: 'Pantalla de inicio de la residente en el portal Condomira, con paquetes, próxima reserva, votación y recibos',
          },
          {
            title: 'Portería',
            description: 'El portero registra el paquete y el residente recibe el código para retirarlo. Las visitas autorizadas por los residentes aparecen en la lista del día, y la entrada se registra con un toque.',
            bullets: ['Registro de paquetes y retiros', 'Visitas esperadas hoy y entradas del día', 'Comunicados del condominio'],
            screenAlt: 'Pantalla de la portería en el portal Condomira, con visitas esperadas y paquetes por retirar',
          },
          {
            title: 'Panel de administración',
            description:
              'Donde trabaja el equipo de la empresa administradora: registra clientes y contratos, responde solicitudes, carga la cuota del mes de cada condominio con el recibo en PDF, elige qué documentos pueden ver los residentes, sigue los leads del sitio web y edita los textos desde el CMS.',
            bullets: ['Dashboard, leads, clientes, contratos y solicitudes', 'Cobros: cuota del mes por unidad, pagos y recibo en PDF', 'Documentos compartidos con los residentes', 'CMS y usuarios'],
            screenAlt: 'Pantalla de cobros del panel de administración de Condomira, con la cuota del mes de cada unidad',
          },
        ],
      },
      stackNotes: {
        pnpm: 'Monorepo con pnpm workspaces y paquetes compartidos de base de datos, autenticación e interfaz.',
        Prisma: 'Un solo schema para las tres apps, con un seed que recrea los datos de la demo.',
        Resend: 'Avisos por correo del portal: paquete recibido, visita en la portería, reservas, votaciones e incidencias.',
        Vercel: 'Tres proyectos publicados en cada push, documentos y recibos en Blob privado y un Cron para el reinicio diario de la demo.',
        'Auth.js': 'Versión 5. Inicio de sesión con correo y contraseña (bcrypt) en el portal y en el panel, con sesiones independientes y perfiles de administrador, residente y portería.',
        'Next.js': 'Versión 16: tres apps con App Router y Turbopack. Cada servicio del sitio web tiene su propia ruta, indexable por Google, y el portal se instala como PWA.',
        TypeScript: 'Tipado de punta a punta, del schema de la base de datos a los componentes de las tres apps.',
        'Tailwind CSS': 'Versión 4. Un design system compartido: el sitio web, el portal y el panel usan los mismos componentes.',
        'Neon Postgres': 'PostgreSQL serverless compartido por el sitio web, el portal y el panel.',
      },
      brand: {
        concept: 'Dos tejados en forma de flecha, calados en un cuadrado de esquinas redondeadas: los edificios y la idea de avanzar juntos. Un solo tono de azul petróleo, sobrio, y el nombre en una sans geométrica, que funciona del ícono de la app en el móvil a la cabecera del portal.',
        intro: 'Marca creada para la demostración pública de la plataforma. Nombre, logo y contactos están en un solo archivo, que se cambia para cada empresa administradora.',
        colors: [
          { name: 'Azul petróleo', usage: 'Logo e ícono' },
          { name: 'Petróleo del sitio', usage: 'Sitio: botones y destacados' },
          { name: 'Petróleo oscuro', usage: 'Sitio: pie de página' },
          { name: 'Hielo', usage: 'Sitio: fondos claros' },
          { name: 'Dorado', usage: 'Sitio: detalles' },
        ],
        fonts: [
          { role: 'Títulos', usage: 'Títulos y llamadas del sitio, del portal y del panel.' },
          { role: 'Texto', usage: 'Textos, formularios y tablas.', sample: 'Gestión de condominios' },
        ],
        logo: { alt: 'Logo de Condomira Gestão Condominial' },
        variants: [{ label: 'Horizontal' }, { label: 'Símbolo' }],
        applications: [
          { label: 'Ícono de la app y favicon', detail: 'El símbolo solo en la pestaña del navegador y en la pantalla de inicio del móvil, donde el portal se instala como app.' },
          { label: 'Sitio, portal y panel', detail: 'Logo horizontal en la cabecera del sitio de la empresa administradora, en la barra lateral del portal y en el panel.' },
          { label: 'Pie de página y acceso en blanco', detail: 'Sobre el azul petróleo del pie de página y de la pantalla de acceso del portal, el logo aparece todo en blanco.' },
        ],
      },
    },
  },

  limpoai: {
    category: 'Limpieza de tapicería',
    tagline: 'Presupuesto por foto con IA y agenda con horarios reales',
    description:
      'Sitio web y sistema de reservas de una empresa de limpieza de tapicería: la IA arma el pedido a partir de una foto en el propio móvil del cliente, el precio se acuerda por WhatsApp y la agenda solo ofrece horarios que están realmente libres.',
    role: 'Senior Design Engineer (UI/UX, Front-end y Full-Stack)',
    status: 'En línea',
    challengeText:
      'La limpieza de tapicería suele venderse por WhatsApp, con muchas idas y vueltas para enviar fotos, explicar qué hay que limpiar y encontrar un horario. El desafío era acortar ese camino, con el pedido llegando listo a la conversación y la disponibilidad real en el propio sitio, y darle a la sucursal un sistema de gestión sin costos fijos, ya que estaba empezando.',
    solutionText:
      'Construimos un sitio en el que el cliente lo resuelve todo en pocos pasos: toma una foto y la IA arma el pedido, ajusta las piezas si hace falta y elige un horario libre. El pedido llega listo al WhatsApp del dueño, que acuerda el precio en la conversación. Detrás, un panel con agenda, clientes, precios, promociones y marketing funciona solo con servicios de plan gratuito.',
    highlights: {
      'IA sem servidor e sem custo': {
        title: 'IA sin servidor y sin costo',
        body: 'El modelo, de unos 7,8 MB, solo se descarga cuando la sección se acerca y se ejecuta en un Web Worker: la página no se congela y no hay factura de una API de IA.',
      },
      'Vaga garantida sem conflito': {
        title: 'Horario garantizado, sin choques',
        body: 'Cada reserva comprueba el horario en una transacción serializable en la base de datos, así que dos clientes nunca se quedan con el mismo horario.',
      },
      'Origem de cada pedido': {
        title: 'El origen de cada pedido',
        body: 'UTM, gclid y fbclid se guardan durante 30 días y viajan con la reserva. El panel agrupa los pedidos por canal y por campaña.',
      },
      'Privacidade e LGPD': {
        title: 'Privacidad y LGPD (protección de datos)',
        body: 'GA4, Google Ads y Meta Pixel solo se cargan después de aceptar las cookies, y los datos de un cliente se pueden borrar desde el panel.',
      },
    },
    caseContent: {
      ogEyebrow: 'Caso de éxito',
      notice: 'Proyecto hecho para la sucursal Águas Claras (Distrito Federal, Brasil) de LIMPO.AI.',
      heroPrimaryLabel: 'Ver el sitio en línea',
      heroSecondaryLabel: 'Qué se entregó',
      cta: {
        eyebrow: 'Siguiente paso',
        title: '¿Quieres vender',
        highlight: 'mientras el cliente está en tu sitio?',
        text: 'Creamos sitios que arman el pedido y muestran la disponibilidad al momento, con un panel para que tu equipo gestione los pedidos.',
        whatsappText: '¡Hola! Vi el caso de LIMPO.AI y me gustaría algo así para mi negocio.',
      },
      admin: {
        eyebrow: 'Panel del equipo',
        title: 'Del pedido al cliente fiel,',
        highlight: 'en un solo lugar',
        intro: 'Lo que aparece en el sitio se edita en el panel y cambia al instante, sin volver a publicar. Cada persona solo ve las áreas de su nivel de acceso.',
        modules: [
          { title: 'Resumen', description: 'Pedidos, ingresos obtenidos, ticket medio, origen de los clientes y la agenda de los próximos 7 días.' },
          { title: 'Agenda', description: 'Vista en lista o por semana, con confirmar, completar y cancelar, el importe cobrado y el bloqueo de días.' },
          { title: 'Clientes', description: 'Un CRM armado a partir de las reservas, con historial, etiquetas, recomendaciones y mensajes de WhatsApp listos.' },
          { title: 'Precios y promociones', description: 'La tabla del simulador, cuotas, cupones, recomendaciones y un plan para mascotas, todo editable.' },
          { title: 'Marketing', description: 'Pedidos por canal y por campaña, un generador de enlaces con UTM e IDs de GA4, Google Ads y Meta Pixel.' },
          { title: 'Acceso', description: 'Niveles Administrador y Agente, bloqueo tras contraseñas incorrectas, recuperación por correo e historial de cambios.' },
        ],
      },
      brand: {
        intro: 'Colores y fuentes comprobados en el sitio en línea, y no solo en el código.',
        colors: [
          { name: 'Marino', usage: 'Fondo y títulos' },
          { name: 'Marino oscuro', usage: 'Secciones y texto de los botones' },
          { name: 'Cian', usage: 'Botones y destacados' },
          { name: 'Sol', usage: 'Brillos y detalles' },
          { name: 'Crema', usage: 'Fondos claros' },
          { name: 'Mancha', usage: 'Manchas del cojín' },
        ],
        fonts: [
          { role: 'Títulos', usage: 'Títulos y números destacados.' },
          { role: 'Destacados', usage: 'Palabras en cursiva dentro de los títulos.' },
          { role: 'Texto', usage: 'Texto corrido y formularios.' },
          { role: 'Etiquetas', usage: 'Etiquetas, contadores y el recibo del presupuesto.' },
        ],
      },
      facts: { period: 'oct 2026', team: TEAM, numbers: [{ label: 'páginas' }, { label: 'componentes' }, { label: 'tablas en la base de datos' }, { label: 'rutas de API' }] },
      figma: {
        ...FIGMA_HEAD,
        text: 'El sitio también está en Figma: variables con los mismos tokens del código, componentes con variantes y estados interactivos, y un prototipo navegable del presupuesto por foto hasta la reserva. La colección Marca tiene dos modos, y cambiar de modo cambia toda la identidad.',
        previewAlt: 'Flujo del prototipo en Figma: elegir la foto, la IA analizándola, el pedido armado y la reserva, unidos por flechas de interacción',
        stats: [{ label: 'variables' }, { label: 'componentes' }, { label: 'pantallas' }, { label: 'flujo en el prototipo' }],
      },
      listing: {
        summary: 'Presupuesto por foto con IA en el propio móvil y una agenda que solo ofrece horarios realmente libres.',
        coverAlt: 'El sitio web de Limpo.AI en escritorio y en el móvil',
      },
      features: {
        eyebrow: 'Qué se entregó',
        title: 'Del primer clic',
        highlight: 'a la cita reservada',
        intro: 'Cuatro etapas del sitio, tal como están en línea.',
        items: [
          {
            title: 'Un cojín para limpiar',
            description: 'Nada más entrar, el visitante pasa el ratón (o el dedo) sobre un cojín manchado y ve cómo sale la suciedad, mientras un contador va del 0% al 100% limpio.',
            bullets: ['Muestra el resultado del servicio antes de cualquier texto', 'La sucursal y el próximo horario libre arriba de todo'],
            screenAlt: 'Apertura del sitio de LIMPO.AI con el cojín manchado',
          },
          {
            title: 'Presupuesto por foto, con IA en el dispositivo',
            description:
              'El cliente envía una foto y la IA reconoce un sofá, sillón, silla o cama y arma el pedido. El análisis se ejecuta en el propio navegador: la foto solo sale del dispositivo cuando el cliente toca “Veja o preço” (“Ver el precio”), y entonces va al equipo junto con el mensaje.',
            bullets: ['MediaPipe con el modelo EfficientDet-Lite0, en un Web Worker', 'El cliente corrige las piezas si la IA se equivoca', 'Alfombras, vehículos y manchas pasan a evaluación del equipo'],
            screenAlt: 'Sección de presupuesto por foto de LIMPO.AI',
          },
          {
            title: 'Pedido armado, precio por WhatsApp',
            description: 'El cliente arma el pedido pieza por pieza y ve el tiempo de servicio y el de secado. El precio lo da la propia LIMPO.AI, por WhatsApp, con el pedido ya escrito en el mensaje.',
            bullets: [
              'Tabla de precios cargada en el panel y oculta en el sitio, lista para volver si la sucursal lo quiere',
              'Artículos, tiempos y formas de pago definidos en el panel',
              'Pedido listo para reservar o enviar por WhatsApp',
            ],
            screenAlt: 'Simulador de LIMPO.AI con el recibo del pedido y el botón “Veja o preço”',
          },
          {
            title: 'Una agenda con disponibilidad real',
            description: 'Solo aparecen los horarios libres, de lunes a sábado, por la mañana y por la tarde. Al enviar, el horario se comprueba de nuevo y el pedido llega listo al WhatsApp del dueño.',
            bullets: ['Consulta del código postal para la zona de servicio y una tarifa por barrio', 'Cupón, código de recomendación y plan para mascotas en el mismo formulario'],
            screenAlt: 'Formulario de reserva de LIMPO.AI con los días libres',
          },
        ],
      },
      stackNotes: {
        GSAP: 'Animaciones de la página y desplazamiento suave con Lenis.',
        React: 'Versión 19. Componentes interactivos: el cojín, el simulador, el presupuesto por foto y la agenda.',
        Prisma: 'Reservas, clientes, configuraciones e historial en el Postgres serverless de Neon.',
        Vercel: 'Publicado en São Paulo, con una tarea diaria (Cron) para los recordatorios de mantenimiento.',
        'Next.js': 'Versión 16. Sitio, panel y rutas de API en la misma app, con una tarea diaria de recordatorios.',
        MediaPipe: 'Detección de objetos en el navegador, en un Web Worker, sin servidor de IA.',
        TypeScript: 'Reglas de precios, agenda y permisos tipadas y validadas con zod.',
        'Tailwind CSS': 'Tokens de la marca y del lenguaje visual del sitio.',
      },
    },
  },

  veritas: {
    category: 'Auditoría y contabilidad',
    tagline: 'Sitio web corporativo y panel para una firma de auditoría contable',
    description:
      'Sitio web de una firma de auditoría y contabilidad de Brasilia, construido sobre el símbolo de la marca, con un panel propio para que el equipo edite textos, fotos y contactos sin depender de un programador.',
    role: 'Senior Design Engineer (UI/UX, Front-end y Full-Stack)',
    status: 'En línea',
    challengeText:
      'Los sitios de contabilidad suelen parecerse entre sí, y Veritas necesitaba mostrar rigor técnico desde el primer contacto, tanto a empresas como a condominios. El equipo también necesitaba mantener el sitio por su cuenta: cambiar textos y fotos, actualizar contactos y hacer seguimiento de las solicitudes de propuesta.',
    solutionText:
      'Partimos del propio símbolo de la marca. En la apertura, una foto de Brasilia aparece dentro de las franjas de la “V”. Los cuatro servicios se convierten en cuatro franjas, cada una del color de una franja del símbolo. Detalles de los papeles de trabajo del auditor (rayado, números en fuente monoespaciada y marcas de verificación) unen la identidad. Detrás, un panel propio edita cada sección del sitio y organiza los contactos recibidos.',
    highlights: {
      'Conteúdo com rede de segurança': {
        title: 'Contenido con red de seguridad',
        body: 'Cada sección tiene un esquema validado (zod) con límites de texto. Si la base de datos falla, el sitio muestra el contenido por defecto en lugar de romperse.',
      },
      'Imagens leves por padrão': {
        title: 'Imágenes livianas por defecto',
        body: 'Reducción en el navegador, conversión a WebP con sharp y limpieza automática de las fotos que ninguna sección usa.',
      },
      'LGPD desde o início': {
        title: 'Protección de datos (LGPD) desde el inicio',
        body: 'Una política de privacidad generada con los datos del panel y una retención de 12 meses aplicada automáticamente a los contactos recibidos.',
      },
      'Acesso em dois níveis': { title: 'Acceso en dos niveles', body: 'Administrador y Editor con permisos separados, recuperación de contraseña e historial de cambios.' },
    },
    caseContent: {
      ogEyebrow: 'Caso de éxito',
      heroPrimaryLabel: 'Ver el sitio en línea',
      heroSecondaryLabel: 'Qué se entregó',
      cta: {
        eyebrow: 'Siguiente paso',
        title: '¿Quieres un sitio así',
        highlight: 'para tu firma?',
        text: 'Creamos sitios con identidad propia y un panel para que tu equipo actualice el contenido sin depender de nadie.',
        whatsappText: '¡Hola! Vi el caso de Veritas y me gustaría un sitio así para mi negocio.',
      },
      admin: {
        eyebrow: 'Panel propio',
        title: 'El equipo gestiona el sitio',
        highlight: 'sin programador',
        intro: 'Los textos, las fotos y los contactos se editan en el panel. Si la base de datos falla, el sitio sigue en línea con el contenido por defecto.',
        modules: [
          {
            title: 'Contenido del sitio',
            description: 'Cada sección es editable: portada, servicios, condominios, etapas, preguntas frecuentes y contacto. Guardar actualiza el sitio al instante, y el botón “Texto original” deshace el cambio.',
          },
          {
            title: 'Fotos optimizadas',
            description: 'Las fotos se reducen en el navegador antes de subirlas y se convierten a WebP en el servidor. Las que ninguna sección usa se borran después de un día.',
          },
          { title: 'Contactos', description: 'Cada envío del formulario queda guardado como nuevo, atendido o archivado, con aviso opcional por correo.' },
          { title: 'Privacidad (LGPD)', description: 'Una página de privacidad armada con los datos de la sección Contacto. Los contactos recibidos se borran automáticamente a los 12 meses.' },
          { title: 'Usuarios e historial', description: 'Administrador y Editor con permisos distintos, e historial de los cambios hechos en el panel.' },
          { title: 'Formulario protegido', description: 'Un límite de 5 envíos por hora por dirección y una trampa para bots, sin captcha para el visitante.' },
        ],
      },
      brand: {
        intro: 'Colores y fuentes comprobados en el sitio en línea. Los colores vienen del archivo original de la marca.',
        colors: [
          { name: 'Marino', usage: 'Fondos y títulos' },
          { name: 'Verde', usage: 'Franja de la V y destacados' },
          { name: 'Verde claro', usage: 'Franja de la V' },
          { name: 'Azul', usage: 'Franja de la V' },
          { name: 'Papel', usage: 'Fondo de las secciones claras' },
          { name: 'Grafito', usage: 'Texto de apoyo' },
        ],
        fonts: [
          { role: 'Títulos y texto', usage: 'Toda la tipografía del sitio, de los títulos al cuerpo de texto.' },
          { role: 'Números y etiquetas', usage: 'Cifras, etapas y etiquetas, como en un papel de trabajo de auditoría.' },
        ],
      },
      facts: { period: 'oct 2026', team: TEAM, numbers: [{ label: 'páginas' }, { label: 'componentes' }, { label: 'tablas en la base de datos' }, { label: 'accesibilidad en Lighthouse' }] },
      figma: {
        ...FIGMA_HEAD,
        text: 'El sitio también está en Figma: variables con los mismos tokens del código, componentes con variantes y un prototipo navegable en el móvil, del inicio al mensaje enviado por WhatsApp, pasando por la lista de selección propia del sitio. La colección Marca tiene dos modos, y cambiar de modo cambia toda la identidad, incluido el símbolo.',
        previewAlt: 'Flujo del prototipo en Figma: el formulario completado, la lista de servicios, el formulario listo, WhatsApp con el mensaje y el mensaje enviado',
        stats: [{ label: 'variables' }, { label: 'componentes' }, { label: 'pantallas' }, { label: 'flujo en el prototipo' }],
      },
      listing: {
        summary: 'Sitio de auditoría contable construido sobre el símbolo de la marca, con un panel para que el equipo edite todo.',
        coverAlt: 'El sitio web de Veritas en escritorio y en el móvil',
      },
      features: {
        eyebrow: 'Qué se entregó',
        title: 'Un sitio que habla',
        highlight: 'el idioma del auditor',
        intro: 'Tres momentos del sitio, tal como están en línea.',
        items: [
          {
            title: 'Una apertura en forma de V',
            description: 'Una foto de Brasilia aparece dentro de las franjas del símbolo de la marca. A medida que el visitante se desplaza, la V crece hasta que la foto ocupa toda la pantalla.',
            bullets: ['Símbolo convertido del archivo EPS original a SVG', 'Animación guiada por el desplazamiento, con GSAP y Lenis'],
            screenAlt: 'Apertura del sitio de Veritas con el símbolo en V',
          },
          {
            title: 'Cuatro servicios, cuatro franjas',
            description: 'Cada servicio es una franja con su propia foto, del color de la franja correspondiente de la V. Al pasar el ratón, la franja se abre y muestra lo que incluye, con el botón de propuesta.',
            bullets: ['Auditoría y asesoría contable', 'Contabilidad para micro y pequeñas empresas', 'Auditoría de condominios', 'Servicios fiscales y obligaciones formales'],
            screenAlt: 'Sección de servicios de Veritas en cuatro franjas con fotos',
          },
          {
            title: 'Una lupa sobre las cuentas',
            description: 'Para administradores y comités de control, una rendición de cuentas de ejemplo con lupa: al mover el cursor, el visitante ve cómo se revisa cada asiento, con marcas de revisado y pendiente.',
            bullets: ['Números en IBM Plex Mono, como en un papel de trabajo', 'Una lista de lo que se revisa y de los buenos momentos para auditar'],
            screenAlt: 'Sección de condominios de Veritas con la lupa sobre la rendición de cuentas',
          },
        ],
      },
      stackNotes: {
        GSAP: 'Animaciones de la apertura y de las franjas, con desplazamiento suave de Lenis.',
        React: 'Versión 19. Un componente por sección, en el orden de la página, fácil de reorganizar.',
        Prisma: 'Contenido, contactos, usuarios e historial en el mismo schema.',
        Vercel: 'Publicado en São Paulo; el build aplica el schema de la base de datos antes de publicar.',
        'Next.js': 'Versión 16, con App Router; sitemap, datos estructurados e imagen para compartir generados por el propio sitio.',
        TypeScript: 'Esquema de contenido tipado: cada campo editable tiene tipo y límite de longitud.',
        'Tailwind CSS': 'Tokens de la marca en el tema: marino, verdes, azul y el tono papel.',
        'Neon Postgres': 'Base de datos propia del proyecto, en la región de São Paulo.',
      },
    },
  },

  'cm-imoveis': {
    category: 'Plataforma inmobiliaria',
    tagline: 'Full-Stack y CRM',
    description:
      'Portal inmobiliario completo con búsqueda inteligente, panel CMS/CRM privado, SEO dinámico con Open Graph y modo oscuro nativo, todo serverless y propiedad del cliente.',
    role: 'Senior Design Engineer (UI/UX, Front-end y Back-end)',
    status: 'En línea',
    challengeText:
      'La agente inmobiliaria Cassia Marques necesitaba más que una vitrina virtual; necesitaba una máquina de ventas autónoma. El desafío era crear una experiencia de alto nivel para el comprador (enfocada en rendimiento y SEO) y, al mismo tiempo, construir un sistema de gestión robusto y seguro (CMS/CRM) para que ella administrara sus inmuebles y leads sin depender de terceros ni de cuotas mensuales de plataformas genéricas.',
    solutionText:
      'Desarrollé un portal inmobiliario completo con las tecnologías más modernas del mercado. La interfaz se diseñó pensando en la conversión y la accesibilidad, y el back-end se estructuró sobre una arquitectura serverless para lograr máxima velocidad y seguridad de los datos.',
    impactText: 'CM Imóveis ahora tiene una plataforma propia, escalable y optimizada para Google, que da total autonomía operativa a la agente y una experiencia inmersiva a sus clientes.',
    highlights: {
      'Engenharia de Busca Inteligente': {
        title: 'Ingeniería de búsqueda inteligente',
        body: 'Un autocompletado dinámico conectado a la base de datos, para que los usuarios solo filtren por ubicaciones con inmuebles realmente disponibles, lo que reduce la tasa de rebote.',
      },
      'Painel Administrativo Privado': {
        title: 'Panel de administración privado',
        body: 'Un CMS a medida protegido con inicio de sesión de Google, para registrar inmuebles, subir fotos (con Google Cloud) y gestionar contactos (CRM) en tiempo real.',
      },
      'Performance & SEO Dinâmico': {
        title: 'Rendimiento y SEO dinámico',
        body: 'Etiquetas Open Graph generadas automáticamente con los datos del servidor. Cada inmueble compartido por WhatsApp muestra al instante una tarjeta de vista previa completa.',
      },
      'UI/UX Premium': {
        title: 'UI/UX premium',
        body: 'Modo oscuro nativo (next-themes) con transiciones suaves y glassmorphism para destacar los formularios sin tapar las fotos de los inmuebles de alto nivel.',
      },
    },
    caseContent: {
      ogEyebrow: 'Caso de éxito',
      heroPrimaryLabel: 'Ver el sitio en línea',
      heroSecondaryLabel: 'Qué se entregó',
      facts: { period: 'abr–ago 2026', team: TEAM, numbers: [{ label: 'páginas' }, { label: 'componentes' }, { label: 'rutas de API' }, { label: 'commits' }] },
      figma: {
        ...FIGMA_HEAD,
        text: 'El portal también está en Figma: variables con los mismos tokens del código, componentes con variantes y un prototipo navegable en el móvil, de la búsqueda a la visita reservada con la agente. La colección Marca tiene dos modos, y cambiar de modo cambia toda la identidad.',
        previewAlt: 'Flujo del prototipo en Figma: la búsqueda, los resultados, el detalle del inmueble, la reserva de la visita y la visita reservada, unidos por flechas',
        stats: [{ label: 'variables' }, { label: 'componentes' }, { label: 'pantallas' }, { label: 'flujo en el prototipo' }],
      },
      listing: {
        summary: 'Portal inmobiliario cuya búsqueda solo muestra barrios con inmuebles, con un CRM propio para la agente.',
        coverAlt: 'El portal de CM Imóveis en escritorio y en el móvil',
      },
      brand: {
        concept: 'Las iniciales CM en letras gruesas y geométricas: la C lleva un degradado de ámbar a violeta, que le da calidez a la marca, y la M queda en grafito, sólida. Debajo, IMÓVEIS en mayúsculas espaciadas. El mismo degradado rellena la casa del favicon.',
        intro: 'Logo, paleta y tipografía de CM Imóveis, creados junto con el portal. Las letras del logo son Helvetica Neue Bold convertida en curvas.',
        colors: [
          { name: 'Ámbar', usage: 'Inicio del degradado de la C y de la casa' },
          { name: 'Rosa', usage: 'Mitad del degradado' },
          { name: 'Violeta', usage: 'Final del degradado y color de acento del sitio' },
          { name: 'Grafito', usage: 'La M, IMÓVEIS y el fondo del ícono' },
          { name: 'Blanco roto', usage: 'Fondo del sitio' },
        ],
        logo: { alt: 'Logo de CM Imóveis' },
        variants: [{ label: 'Color' }, { label: 'Blanco' }, { label: 'Ícono (casa)' }],
        applications: [
          { label: 'Favicon e ícono de la app', detail: 'La casa con el degradado de la marca, sobre grafito, en la pestaña del navegador y en la pantalla de inicio del móvil.' },
          { label: 'Cabecera del sitio y acceso al panel', detail: 'Logo a color en la cabecera del portal y en la entrada del panel de la corredora.' },
          { label: 'Marca de agua en las fotos', detail: 'El panel aplica el logo en las fotos de los inmuebles.' },
          { label: 'Videos de los inmuebles', detail: 'La versión blanca firma los videos que arma el panel.' },
        ],
        fonts: [
          { role: 'Títulos', usage: 'Display y títulos, con cursiva en los destacados.' },
          { role: 'Interfaz y texto', usage: 'Botones, filtros, tarjetas de inmuebles y textos.' },
        ],
        rules: {
          do: [
            'Usa la versión a color sobre fondos blancos y claros',
            'Usa la versión blanca sobre fondos oscuros y fotos',
            'Respeta el área de protección alrededor del logo',
            'Usa el degradado solo en los elementos definidos',
            'Respeta la altura mínima de 24px',
            'Usa Playfair Display para títulos y Montserrat para la interfaz',
          ],
          dont: [
            'No cambies los colores originales del logo',
            'No lo deformes, lo rotes ni le apliques efectos',
            'No lo uses sobre fondos con poco contraste',
            'No uses la versión a color sobre fondos de color',
            'No agregues sombras ni bordes al logo',
          ],
        },
      },
      cta: {
        eyebrow: 'Siguiente paso',
        title: '¿Quieres un portal así',
        highlight: 'para tu inmobiliaria?',
        text: 'Creamos portales con búsqueda, panel propio y CRM, sin depender de plataformas genéricas.',
        whatsappText: '¡Hola! Vi el caso de CM Imóveis y me gustaría un portal así para mi negocio.',
      },
    },
  },

  'fino-trato': {
    category: 'Limpieza profesional',
    tagline: 'Sitio web con reservas en línea, CRM y sistema de marca',
    description:
      'Sitio web de una empresa de limpieza de tapicería de Brasilia: una landing page con un antes y después interactivo, solicitud de presupuesto y reservas en línea, y un panel con inicio de sesión de Google en el que el equipo sigue leads y reservas y edita servicios, testimonios, fotos y SEO. La marca también se creó desde cero.',
    role: 'Senior Design Engineer (UI/UX y Front-end)',
    status: 'En línea',
    challengeText:
      'Fino Trato necesitaba un sitio que transmitiera confianza a las familias de Brasilia, mostrara el resultado del servicio y convirtiera la visita en una solicitud. El equipo también necesitaba seguir presupuestos y reservas sin depender de conversaciones sueltas en WhatsApp, y la marca todavía no existía.',
    solutionText:
      'Creé la marca desde cero (logo, paleta, tipografía y guía de uso) y construí el sitio en Next.js: un antes y después interactivo, solicitud de presupuesto y reservas en línea con fecha y franja horaria, con aviso por correo en cada solicitud. En el panel, con inicio de sesión de Google, el equipo sigue leads y reservas en un CRM y edita servicios, testimonios, fotos y SEO sin programador.',
    impactText:
      'Fino Trato ahora tiene una marca coherente en todos sus canales y un sitio que recibe solicitudes y reservas a cualquier hora, con todo registrado en un panel que el propio equipo administra.',
    highlights: {
      'Antes e depois interativo': { title: 'Antes y después interactivo', body: 'El visitante arrastra el control y ve el mismo tapizado antes y después de la limpieza.' },
      'Agendamento online': {
        title: 'Reservas en línea',
        body: 'Servicio, fecha preferida y franja horaria (mañana, tarde o noche) elegidos en el sitio, con confirmación por WhatsApp y un aviso por correo al equipo en cada solicitud.',
      },
      'CRM de leads e agendamentos': { title: 'CRM de leads y reservas', body: 'Cada solicitud entra en el panel con un estado, del primer contacto al servicio realizado.' },
      'Painel com login Google': { title: 'Panel con inicio de sesión de Google', body: 'Acceso restringido al equipo, sin una contraseña nueva que recordar.' },
      'Conteúdo editável': { title: 'Contenido editable', body: 'Servicios, testimonios, fotos de la portada y SEO se cambian desde el panel, sin programador.' },
      'Marca criada do zero': { title: 'Marca creada desde cero', body: 'Logo, paleta, tipografía, tokens y guía de uso documentados y aplicados en el sitio.' },
    },
    caseContent: {
      ogEyebrow: 'Caso de éxito',
      heroPrimaryLabel: 'Ver el sitio en línea',
      heroSecondaryLabel: 'Qué se entregó',
      facts: { period: 'abr–oct 2026', team: TEAM, numbers: [{ label: 'páginas' }, { label: 'tablas en la base de datos' }, { label: 'rutas de API' }, { label: 'commits' }] },
      figma: {
        ...FIGMA_HEAD,
        text: 'El sitio también está en Figma: variables con los mismos colores y fuentes del código, componentes con variantes y estados interactivos (el comparador antes y después se mueve con un toque) y un prototipo navegable del inicio de la página a la solicitud por WhatsApp. La colección Marca tiene dos modos, y cambiar de modo cambia toda la identidad.',
        previewAlt: 'Flujo del prototipo en Figma: el inicio de la página, el antes y después, la reserva vacía y completada y la solicitud por WhatsApp, unidos por flechas',
        stats: [{ label: 'variables' }, { label: 'componentes' }, { label: 'pantallas' }, { label: 'flujo en el prototipo' }],
      },
      listing: {
        summary: 'Landing page con antes y después, reservas en línea y panel con CRM, con una marca creada desde cero.',
        coverAlt: 'El sitio web de Fino Trato en escritorio y en el móvil',
      },
      brand: {
        concept: 'Un hexágono en dos mitades, azul y morado, enmarca un sofá con gotas de agua: el servicio explicado en el propio símbolo. El nombre en serifa clásica da el tono cuidadoso del “fino trato”, y la línea de servicios en mayúsculas espaciadas cierra el conjunto en los mismos dos colores.',
        intro: 'Logo creado en 2020. Con el sitio nuevo, la marca ganó paleta digital, tipografía, voz y reglas de uso, documentadas en una guía.',
        colors: [
          { name: 'Azul', usage: 'Logo: mitad del hexágono y servicios' },
          { name: 'Morado', usage: 'Logo: mitad del hexágono, sofá y nombre' },
          { name: 'Azul claro', usage: 'Logo: gotas de agua' },
          { name: 'Azul real', usage: 'Sitio: botones y enlaces' },
          { name: 'Morado vivo', usage: 'Sitio: degradado de la marca' },
          { name: 'Noche', usage: 'Sitio: fondos oscuros' },
        ],
        logo: { alt: 'Logo de Fino Trato' },
        variants: [{ label: 'Horizontal' }, { label: 'Vertical' }, { label: 'Símbolo' }],
        applications: [
          { label: 'Favicon', detail: 'El hexágono solo, en la pestaña del navegador.' },
          { label: 'Cabecera del sitio, panel y acceso', detail: 'Logo horizontal en la cabecera de la landing page y en la entrada del panel.' },
          { label: 'Guía de marca', detail: 'Página con logo, paleta, tipografía, voz y reglas de uso, publicada junto con el sitio.' },
        ],
        fonts: [
          { role: 'Títulos', usage: 'Display y títulos, con cursiva en los destacados.' },
          { role: 'Interfaz y texto', usage: 'Botones, formularios y texto corrido.' },
        ],
        rules: {
          do: [
            'Usa el azul #1565C0 como color de acento en los CTA',
            'Combina Playfair Display (títulos) con Inter (cuerpo)',
            'Usa el degradado azul→morado en banners y destacados',
            'Respeta el área de protección alrededor del logo',
            'Respeta el tamaño mínimo de 120px / 32mm',
            'Usa fotos reales del servicio con antes/después',
          ],
          dont: [
            'No deformes el logo ni le apliques efectos no aprobados',
            'No lo uses sobre fondos con poco contraste',
            'No mezcles otras fuentes sin aprobación',
            'No uses imágenes genéricas de bancos de imágenes',
            'No abuses de las MAYÚSCULAS',
          ],
        },
        voice: {
          intro: 'Fino Trato transmite cuidado, competencia y cercanía. El lenguaje une profesionalismo y calidez, como un especialista de confianza de la familia.',
          traits: ['Confiable', 'Profesional', 'Sofisticado', 'Cuidadoso', 'Cálido', 'Transparente'],
          tone: ['Directo y claro', 'Didáctico', 'Cercano, no íntimo', 'Aspiracional', 'Sin jerga técnica'],
        },
      },
      cta: {
        eyebrow: 'Siguiente paso',
        title: '¿Quieres una marca y un sitio',
        highlight: 'que traigan solicitudes?',
        text: 'Creamos la marca, el sitio y el panel para que tu equipo siga cada solicitud.',
        whatsappText: '¡Hola! Vi el caso de Fino Trato y me gustaría algo así para mi negocio.',
      },
    },
  },

  cejb: {
    category: 'Sitio institucional',
    tagline: 'Presencia digital para el condominio más completo de Jardim Botânico',
    description:
      'Un sitio institucional de una sola página con fotografía aérea profesional e identidad verde, que transmite seguridad, sostenibilidad y calidad de vida en un condominio de 488 unidades en Brasilia, Brasil.',
    role: 'Senior Design Engineer (UI/UX, Front-end y Estrategia Digital)',
    status: 'En línea',
    challengeText:
      'El CEJB, uno de los primeros y más tradicionales condominios de Jardim Botânico, con 488 unidades y casi 40 años de historia, necesitaba una presencia digital a la altura de su nivel. Había que transmitir un estilo de vida único (seguro, sostenible y lleno de ocio) en una experiencia web moderna, sin perder su esencia institucional ni la calidez de la comunidad.',
    solutionText:
      'Desarrollamos un sitio institucional de una sola página con un diseño inmersivo, con fotografía y video aéreos profesionales como protagonistas. La arquitectura de la información guía al visitante por los pilares del condominio: seguridad (videovigilancia 24 h, 3 porterías), sostenibilidad (4 plantas solares, 27.000 kWh/mes) y calidad de vida (ocio completo, escuela de fútbol, salón de fiestas). Un CMS WordPress da total autonomía al cliente.',
    impactText:
      'Un sitio institucional que funciona como vitrina digital para residentes, futuros residentes y empresas aliadas, y que consolida la imagen del CEJB como referente de vivienda de alto nivel en Jardim Botânico, en Brasilia. Un único formulario para contacto y alianzas, accesos directos de ubicación a Google Maps y Waze, y una galería de 27 fotos profesionales en la sección de Ocio.',
    highlights: {
      'Design Imersivo com Identidade Verde': {
        title: 'Diseño inmersivo con identidad verde',
        body: 'Una paleta y una jerarquía visual inspiradas en la naturaleza y en la ubicación privilegiada, cerca del Jardín Botánico de Brasilia. La fotografía aérea profesional (dron) es la gran protagonista de la experiencia.',
      },
      'Sustentabilidade em Destaque': {
        title: 'La sostenibilidad en primer plano',
        body: 'Una sección dedicada a las 4 plantas de energía solar (27.000 kWh/mes, instaladas en 2023), que posiciona al CEJB como referente ambiental y reduce directamente las facturas de las áreas comunes.',
      },
      'Comunicação de Segurança': {
        title: 'Comunicar la seguridad',
        body: 'Una sección pensada para transmitir confianza institucional: videovigilancia 24 h en las áreas comunes, control de acceso con barreras y torniquetes en 3 porterías, y un equipo en formación continua.',
      },
      'Estratégia One-Page de Alto Impacto': {
        title: 'Una estrategia one-page de alto impacto',
        body: 'Una arquitectura UX de página única con desplazamiento suave, una galería de ocio con más de 27 fotos profesionales, una sección de correspondencia y un único formulario de contacto para residentes y empresas aliadas.',
      },
    },
    caseContent: {
      ogEyebrow: 'Caso de éxito',
      heroPrimaryLabel: 'Ver el sitio en línea',
      heroSecondaryLabel: 'Qué se entregó',
      facts: { period: '2025', team: TEAM, numbers: [{ label: 'unidades en el condominio' }] },
      figma: {
        ...FIGMA_HEAD,
        text: 'El sitio también está en Figma: variables con los colores y las fuentes del tema en línea (verde oliva, arena, Lato y Lora), componentes con variantes y un prototipo navegable en el móvil, del menú a la galería de ocio y al contacto con la administración. La colección Marca tiene dos modos, y cambiar de modo cambia toda la identidad.',
        previewAlt: 'Flujo del prototipo en Figma: inicio, menú, galería de ocio, formulario de contacto y mensaje enviado, unidos por flechas de interacción',
        stats: [{ label: 'variables' }, { label: 'componentes' }, { label: 'pantallas' }, { label: 'flujo en el prototipo' }],
      },
      listing: {
        summary: 'Sitio de un condominio de 488 unidades, con fotos y video aéreos y contenido que actualiza la administración.',
        coverAlt: 'El sitio web del Condomínio Estância Jardim Botânico en escritorio y en el móvil',
      },
      brand: {
        concept: 'Tres hojas que también son árboles, con troncos blancos, crecen bajo un arco color arena. La hoja del medio, verde, es la más alta. Debajo, “Condomínio” en mayúsculas espaciadas y el nombre en cursiva verde: una marca serena, cerca de la naturaleza del Jardim Botânico.',
        intro: 'Logo del condominio, usado en el sitio, en las redes y en los avisos a los residentes. Los colores vienen del archivo original del logo y del tema del sitio.',
        colors: [
          { name: 'Verde', usage: 'Logo: nombre y hoja del medio' },
          { name: 'Arena', usage: 'Logo: arco' },
          { name: 'Dorado', usage: 'Logo: hoja de la izquierda' },
          { name: 'Caqui', usage: 'Logo: hoja de la derecha' },
          { name: 'Verde oliva', usage: 'Sitio: títulos y botones' },
          { name: 'Grafito', usage: 'Sitio: textos' },
        ],
        logo: { alt: 'Logo del Condomínio Estância Jardim Botânico' },
        variants: [{ label: 'Completo' }, { label: 'Símbolo' }],
        applications: [
          { label: 'Favicon del sitio', detail: 'El arco con las tres hojas, sin el nombre, en la pestaña del navegador.' },
          { label: 'Cabecera del sitio', detail: 'Logo completo en la cabecera de cejbonline.com.br.' },
          { label: 'Posts en Instagram', detail: 'El logo firma los posts del condominio, al pie de cada pieza.' },
          { label: 'Avisos por WhatsApp', detail: 'Piezas enviadas a los residentes, como la de la actualización del reglamento, con el logo.' },
        ],
        fonts: [
          { role: 'Títulos', usage: 'Títulos del sitio.' },
          { role: 'Texto', usage: 'Textos del sitio.' },
        ],
        voice: {
          intro: 'El CEJB transmite seguridad, pertenencia y calidad de vida. El lenguaje une solidez institucional y calidez humana, como un condominio que también es una comunidad.',
          traits: ['Seguro', 'Cálido', 'Sostenible', 'Exclusivo', 'Comunitario', 'Transparente'],
          tone: ['Institucional y sereno', 'Inclusivo y familiar', 'Positivo y orgulloso', 'Confiable, no formal', 'Cercano a la naturaleza'],
        },
      },
      cta: {
        eyebrow: 'Siguiente paso',
        title: '¿Quieres un sitio así',
        highlight: 'para tu condominio?',
        text: 'Creamos sitios institucionales que ponen en valor el lugar y que la administración actualiza por su cuenta.',
        whatsappText: '¡Hola! Vi el caso del CEJB y me gustaría un sitio así para mi condominio.',
      },
    },
  },
}

/* ─── Home ──────────────────────────────────────────────── */

const HERO = {
  badge: 'EM Soluções Digitais',
  titlePrefix: 'Especialistas en',
  rotatingWords: 'Autoridad Digital,Sitios Web Premium,Diseño y Branding,Automatización con IA,Publicidad Online,Landing Pages,Redes Sociales',
  description: 'Estrategia, diseño y tecnología de vanguardia para que tu negocio sea un referente en su mercado. Resultados medibles, diseño impecable.',
  ctaPrimaryText: 'Empezar un proyecto',
  ctaSecondaryText: 'Ver nuestros proyectos',
  socialClients: '+27 clientes',
}

const FEATURES_CONFIG = {
  tagline: 'Servicios',
  title1: 'Del primer wireframe',
  titleHighlight: 'al producto en línea',
  description: 'Diseño en Figma y desarrollo a cargo de la misma persona, de principio a fin.',
}

// Pelo título em português
const FEATURES = {
  'Aplicativos e sistemas': {
    title: 'Apps y plataformas',
    description: 'Apps para iOS, Android y web, con inicio de sesión para tus clientes y un panel para tu equipo.',
    deliverables: 'Prototipo en Figma\nEn las tiendas o instalable\nPanel de administración',
  },
  'Sites institucionais': {
    title: 'Sitios web corporativos',
    description: 'Sitios rápidos, fáciles de encontrar en Google y que tu equipo actualiza sin depender de un programador.',
    deliverables: 'Panel de contenido\nSEO técnico\nListo para el móvil',
  },
  'Landing pages': {
    title: 'Landing pages',
    description: 'Una página con un solo objetivo: convertir la visita en una conversación por WhatsApp o en una reserva.',
    deliverables: 'Textos y diseño\nWhatsApp y reservas\nGoogle Analytics',
  },
  'UX/UI, design system e marca': {
    title: 'UX/UI, design systems y marca',
    description: 'Investigación, wireframes, prototipos navegables, componentes e identidad visual, documentados en Figma y listos para el desarrollo.',
    deliverables: 'Prototipo en Figma\nDesign system con variables\nIdentidad visual',
  },
  'Atendimento com IA no WhatsApp': {
    title: 'Atención con IA en WhatsApp',
    description: 'Un asistente que responde, filtra a los interesados y reserva citas por WhatsApp, a cualquier hora.',
  },
  'Tráfego pago': { title: 'Publicidad online', description: 'Campañas en Google e Instagram, con seguimiento hasta que llega el contacto.' },
  'Redes sociais': { title: 'Redes sociales', description: 'Contenido y diseño para Instagram, con calendario y estrategia.' },
}

const TESTIMONIALS_CONFIG = {
  tagline: 'Testimonios',
  title1: 'Quien nos contrata, ',
  titleHighlight: 'nos recomienda',
  description: 'En palabras de clientes que ya tienen su proyecto en línea, con el caso al lado para comprobarlo.',
}

// Pelo nome do autor. Tradução fiel: o site mostra "Traducido del portugués".
const TESTIMONIALS = {
  'Cássia Marques': {
    authorRole: 'CEO, CM Imóveis',
    content:
      'El mercado inmobiliario no perdona la lentitud ni el amateurismo. Necesitábamos una vitrina impecable y un motor de ventas que siguiera nuestro ritmo. EM Soluções Digitais nos entregó una plataforma de alto rendimiento que superó todas las expectativas. El panel de control exclusivo que desarrollaron facilitó enormemente la gestión de nuestros leads y la actualización de nuestro catálogo. Con una estructura enfocada en SEO dinámico y un diseño web sofisticado, nuestros inmuebles ganaron la visibilidad premium que merecen. Es una tecnología veloz, elegante y enfocada por completo en la conversión.',
    highlight: 'Una plataforma de alto rendimiento que superó todas las expectativas.',
    deliverables: 'Portal inmobiliario\nPanel con CRM\nSEO dinámico',
  },
  'LIMPO.AI': {
    authorRole: 'Sucursal Águas Claras',
    content:
      'Antes, todo presupuesto empezaba con un largo intercambio de fotos y mensajes por WhatsApp. Con el nuevo sitio, el cliente envía la foto del sofá, la IA arma el pedido al instante y él elige un horario que está realmente libre. El precio lo acordamos por WhatsApp, ya con todo en la mano. La agenda organizó nuestra rutina y el panel muestra de dónde viene cada pedido. EM entendió nuestro negocio y entregó rápido.',
    highlight: 'El cliente envía la foto del sofá, la IA arma el pedido al instante y él elige un horario que está realmente libre.',
    deliverables: 'Presupuesto por foto con IA\nAgenda con horarios libres\nPanel de pedidos',
  },
  'Fino Trato': {
    authorRole: 'Dirección',
    content:
      'En nuestro sector, la experiencia de limpieza, cuidado y sofisticación tiene que empezar mucho antes de la ejecución del servicio: empieza en nuestro sitio web. EM Soluções Digitais tradujo nuestro rigor técnico en una presencia digital impecable. La nueva landing page y el diseño web premium que desarrollaron no solo elevaron el estatus de nuestra marca, sino que crearon un embudo de reservas extremadamente rápido e intuitivo para nuestros clientes. La percepción de valor de nuestro trabajo cambió por completo, y atrae exactamente al público de alto nivel que buscábamos. Es un diseño que genera confianza a primera vista y ganancias directas en caja.',
    highlight: 'Un diseño que genera confianza a primera vista y ganancias directas en caja.',
    deliverables: 'Marca desde cero\nLanding page\nReservas en línea',
  },
}

/* ─── Conferências ──────────────────────────────────────── */

// Limites de normalizeCaseContent (src/lib/caseContent.ts): texto maior seria cortado no site
const LIMITS = {
  'listing.summary': 120,
  'listing.coverAlt': 160,
  'figma.text': 600,
  'figma.previewAlt': 160,
  'figma.stats.label': 40,
  'facts.period': 40,
  'facts.team': 80,
  'facts.numbers.label': 40,
  'features.intro': 300,
  'features.note': 500,
  'features.items.title': 100,
  'features.items.description': 700,
  'features.items.bullets': 160,
  'features.items.screenAlt': 160,
  'admin.intro': 300,
  'admin.modules.title': 80,
  'admin.modules.description': 300,
  'brand.intro': 300,
  'brand.concept': 500,
  'brand.logo.alt': 160,
  'brand.variants.label': 40,
  'brand.applications.label': 60,
  'brand.applications.detail': 200,
  'brand.colors.name': 40,
  'brand.colors.usage': 80,
  'brand.fonts.role': 40,
  'brand.fonts.usage': 160,
  'brand.rules.do': 160,
  'brand.rules.dont': 160,
  'brand.voice.intro': 300,
  'brand.voice.traits': 40,
  'brand.voice.tone': 60,
  'cta.title': 80,
  'cta.highlight': 80,
  'cta.text': 300,
  'cta.whatsappText': 300,
  notice: 240,
  ogEyebrow: 40,
  heroPrimaryLabel: 40,
  heroSecondaryLabel: 40,
  stackNotes: 240,
}

const problems = []

function checkLimits(slug, value, at = '') {
  if (typeof value === 'string') {
    const key = at.split('.').filter((p) => !/^\d+$/.test(p)).join('.')
    const limit = LIMITS[key] || (key.startsWith('stackNotes.') ? LIMITS.stackNotes : null)
    if (limit && value.length > limit) problems.push(`${slug}: ${at} tem ${value.length} caracteres (limite ${limit})`)
    return
  }
  if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) checkLimits(slug, v, at ? `${at}.${k}` : k)
  }
}

// Listas traduzidas precisam ter o mesmo tamanho das listas em português (a tradução segue a posição)
function checkLists(slug, pt, en, at = 'caseContent') {
  if (Array.isArray(en)) {
    if (!Array.isArray(pt)) problems.push(`${slug}: ${at} não existe em português`)
    else if (pt.length !== en.length) problems.push(`${slug}: ${at} tem ${en.length} itens em espanhol e ${pt.length} em português`)
    if (Array.isArray(pt)) en.forEach((item, i) => checkLists(slug, pt[i], item, `${at}.${i}`))
    return
  }
  if (en && typeof en === 'object' && !Array.isArray(en)) {
    for (const [k, v] of Object.entries(en)) {
      if (at === 'caseContent.stackNotes') continue
      checkLists(slug, pt && typeof pt === 'object' ? pt[k] : undefined, v, `${at}.${k}`)
    }
  }
}

const norm = (s) => s.toLowerCase().replace(/[.!?]+$/, '').trim()
const withLocale = (row, en) => ({ ...(row.i18n && typeof row.i18n === 'object' ? row.i18n : {}), [LOCALE]: en })
// O Postgres (jsonb) devolve as chaves em outra ordem: compara com as chaves ordenadas
const stable = (v) => (Array.isArray(v) ? v.map(stable) : v && typeof v === 'object' ? Object.fromEntries(Object.keys(v).sort().map((k) => [k, stable(v[k])])) : v)
const same = (a, b) => JSON.stringify(stable(a ?? null)) === JSON.stringify(stable(b ?? null))

async function main() {
  const [projects, features, featuresCfg, testimonials, testimonialsCfg, hero] = await Promise.all([
    prisma.clientProject.findMany({ include: { highlights: true } }),
    prisma.feature.findMany(),
    prisma.sectionFeaturesConfig.findUnique({ where: { id: 'singleton' } }),
    prisma.testimonial.findMany(),
    prisma.sectionTestimonialsConfig.findUnique({ where: { id: 'singleton' } }),
    prisma.sectionHeroConfig.findUnique({ where: { id: 'singleton' } }),
  ])

  // Cliente Prisma gerado antes da coluna i18n: a leitura viria sem ela e a gravação apagaria os outros idiomas
  if ([...projects, ...features, ...testimonials].some((row) => !('i18n' in row))) {
    console.error('❌ O cliente Prisma não conhece a coluna i18n. Rode "npx prisma generate" e tente de novo.')
    process.exitCode = 1
    return
  }

  const writes = [] // { table, id, label, before, after }

  for (const [slug, en] of Object.entries(PROJECTS)) {
    const p = projects.find((x) => x.slug === slug)
    if (!p) {
      problems.push(`case ${slug} não encontrado`)
      continue
    }
    for (const ptTitle of Object.keys(en.highlights || {})) {
      if (!p.highlights.some((h) => h.title === ptTitle)) problems.push(`${slug}: destaque "${ptTitle}" não existe em português`)
    }
    for (const h of p.highlights) {
      if (!en.highlights?.[h.title]) problems.push(`${slug}: destaque "${h.title}" sem tradução`)
    }
    checkLists(slug, p.caseContent || {}, en.caseContent || {})
    checkLimits(slug, en.caseContent || {})
    for (const tag of String(p.stackTags || '').split(',').map((t) => t.trim()).filter(Boolean)) {
      const ptNotes = (p.caseContent && p.caseContent.stackNotes) || {}
      if (ptNotes[tag] && !en.caseContent?.stackNotes?.[tag]) problems.push(`${slug}: nota da stack "${tag}" sem tradução`)
    }
    writes.push({ table: 'clientProject', id: p.id, label: `case ${slug}`, before: p.i18n, after: withLocale(p, en) })
  }
  for (const p of projects) if (!PROJECTS[p.slug] && p.published) problems.push(`case ${p.slug} publicado sem tradução`)

  for (const f of features) {
    const en = FEATURES[f.title]
    if (!en) {
      problems.push(`serviço "${f.title}" sem tradução`)
      continue
    }
    const ptLines = (f.deliverables || '').split('\n').filter(Boolean).length
    const enLines = (en.deliverables || '').split('\n').filter(Boolean).length
    if (ptLines !== enLines) problems.push(`serviço "${f.title}": ${enLines} entregas em espanhol e ${ptLines} em português`)
    if ((en.deliverables || '').split('\n').some((l) => l.length > 60)) problems.push(`serviço "${f.title}": entrega com mais de 60 caracteres`)
    writes.push({ table: 'feature', id: f.id, label: `serviço ${f.title}`, before: f.i18n, after: withLocale(f, en) })
  }
  for (const title of Object.keys(FEATURES)) if (!features.some((f) => f.title === title)) problems.push(`serviço "${title}" não existe em português`)

  for (const t of testimonials) {
    const en = TESTIMONIALS[t.authorName]
    if (!en) {
      problems.push(`depoimento de ${t.authorName} sem tradução`)
      continue
    }
    if (!norm(en.content).includes(norm(en.highlight))) problems.push(`depoimento de ${t.authorName}: a frase em destaque não é trecho do texto`)
    writes.push({ table: 'testimonial', id: t.id, label: `depoimento ${t.authorName}`, before: t.i18n, after: withLocale(t, en) })
  }

  if (featuresCfg) writes.push({ table: 'sectionFeaturesConfig', id: featuresCfg.id, label: 'seção Serviços', before: featuresCfg.i18n, after: withLocale(featuresCfg, FEATURES_CONFIG) })
  if (testimonialsCfg) writes.push({ table: 'sectionTestimonialsConfig', id: testimonialsCfg.id, label: 'seção Depoimentos', before: testimonialsCfg.i18n, after: withLocale(testimonialsCfg, TESTIMONIALS_CONFIG) })
  if (hero) writes.push({ table: 'sectionHeroConfig', id: hero.id, label: 'Hero', before: hero.i18n, after: withLocale(hero, HERO) })

  for (const w of writes) console.log(`${same(w.before, w.after) ? '=' : '✎'} ${w.label}`)
  if (problems.length) {
    console.log('\n⚠️  Conferir antes de gravar:')
    problems.forEach((p) => console.log(`  - ${p}`))
    process.exitCode = 1
    if (APPLY) console.log('\nNada foi gravado.')
    return
  }
  const changed = writes.filter((w) => !same(w.before, w.after))
  console.log(`\n${changed.length} de ${writes.length} registros mudam.`)
  if (!APPLY) {
    console.log('Simulação. Rode com --apply para gravar.')
    return
  }
  if (!changed.length) return

  const backupDir = process.env.BACKUP_DIR || path.join(__dirname, '..', 'backups')
  fs.mkdirSync(backupDir, { recursive: true })
  const backupFile = path.join(backupDir, `i18n-${LOCALE}-${new Date().toISOString().replace(/[:.]/g, '-')}.json`)
  fs.writeFileSync(backupFile, JSON.stringify(changed.map(({ table, id, label, before }) => ({ table, id, label, i18n: before ?? null })), null, 2))
  console.log(`Backup: ${backupFile}`)
  for (const w of changed) await prisma[w.table].update({ where: { id: w.id }, data: { i18n: w.after } })
  console.log('✅ Versão em espanhol gravada.')
  await revalidateSite(['/', '/cases', ...Object.keys(PROJECTS).map((s) => `/cases/${s}`)])
}

main()
  .catch((err) => {
    console.error('❌', err.message || err)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())

/**
 * Grava a versão em inglês (/en) do conteúdo do banco, na coluna i18n de cada tabela: i18n = { ..., en: { ... } }.
 * O que não estiver aqui aparece em português no site em inglês (ver src/lib/localize.ts e docs/i18n.md).
 *
 * - Cases (ClientProject): campos do projeto, destaques técnicos (pelo título em português) e caseContent.
 *   Listas do caseContent seguem a posição: o item 2 traduz o item 2 da versão em português.
 * - Serviços (Feature): pelo título em português. Depoimentos (Testimonial): pelo nome do autor.
 * - Configurações das seções (hero, serviços, depoimentos).
 *
 * Regras de conteúdo: tradução natural, sem inventar números ou recursos. Depoimentos são tradução fiel
 * (o site mostra "Translated from Portuguese") e a frase em destaque precisa ser trecho do próprio texto.
 * A LIMPO.AI não mostra preços no site: o preço é combinado no WhatsApp.
 *
 * Simulação:  node --env-file=.env prisma/set-i18n-en.js
 * Aplicar:    node --env-file=.env prisma/set-i18n-en.js --apply
 * Backup das colunas i18n atuais em backups/ (ou em BACKUP_DIR) antes de gravar.
 */
const fs = require('fs')
const path = require('path')
const { PrismaClient } = require('@prisma/client')
const { revalidateSite } = require('./revalidate-site')

const prisma = new PrismaClient()
const APPLY = process.argv.includes('--apply')
const LOCALE = 'en'

const TEAM = 'Solo, from design to deploy'
const FIGMA_HEAD = { eyebrow: 'Design in Figma', title: 'From design system', highlight: 'to prototype' }

/* ─── Cases ─────────────────────────────────────────────── */

const PROJECTS = {
  condomira: {
    category: 'Product · Condominium management',
    tagline: 'An all-in-one platform for condominium management companies',
    description:
      'A company website, a condominium portal for building managers, residents and the front desk, and an admin panel with a CMS, all in one EM Soluções Digitais product, with a public demo you can try.',
    role: 'Senior Design Engineer (Product, UI/UX & Full-Stack)',
    status: 'Public demo',
    challengeText:
      "Condominium management companies usually run on a generic company website, a third-party portal for the building manager and spreadsheets for everything else. Inside the building, the routine is even more scattered: packages logged in a notebook at the front desk, party-room bookings arranged by text message and votes held on paper. Each system has its own password, its own look and its own data. The challenge was to bring everything together in a single product, under the management company's brand, that could be adapted to a new client without rewriting code.",
    solutionText:
      "We built Condomira as a monorepo with three Next.js apps that share the database, authentication and components: the company website, the condominium portal and the admin panel with a CMS. The portal serves three roles, building manager, resident and front desk, each with its own menu and home screen, and it can be installed on a phone like an app. The management company's name, contacts and WhatsApp live in a single brand file, so adapting the platform to a new client means changing the brand, not the code.",
    impactText:
      "One product instead of several vendors: website, building manager portal, resident app and front-desk control, under the management company's own brand and domain.",
    highlights: {
      'Três aplicações, uma base': { title: 'Three apps, one codebase', body: 'Website, portal and admin panel in a monorepo: the same database, the same authentication and the same components.' },
      'Um portal, três perfis': {
        title: 'One portal, three roles',
        body: 'Building managers, residents and the front desk sign in to the same portal, each with their own menu and home screen. Admin panel accounts cannot access the portal.',
      },
      'Instalável no celular': { title: 'Installable on mobile', body: 'The portal is a PWA: residents add it to their home screen and use it like an app, without going through an app store.' },
      'Marca configurável em um arquivo': {
        title: 'Brand set in a single file',
        body: "The management company's name, contacts and WhatsApp live in a single brand file. A new client means a new brand, with the same code.",
      },
      'Documentos privados por condomínio': {
        title: 'Private documents per condominium',
        body: 'Files are kept in private storage: the admin panel uploads and deletes them, the portal only serves each document to the condominium it belongs to, and the management company chooses what residents can see.',
      },
      'Demonstração que se recupera sozinha': {
        title: 'A demo that resets itself',
        body: 'The data goes back to its original state every day at 3 am. In the demo, the CMS, file uploads and email notifications are turned off, and search engines do not index the site.',
      },
    },
    caseContent: {
      ogEyebrow: 'EM product',
      notice: "Condomira is a fictional brand created for the platform's public demo.",
      heroPrimaryLabel: 'Open the live demo',
      heroSecondaryLabel: 'See demo logins',
      cta: {
        eyebrow: 'For management companies',
        title: 'Want the platform with',
        highlight: 'your brand?',
        text: "We adapt the website, portal and admin panel to your management company's identity, with your services, contacts and domain.",
        whatsappText: "Hi! I saw the Condomira case study and I'd like the platform with my management company's brand.",
      },
      admin: {
        eyebrow: 'Inside the portal',
        title: 'The condominium routine',
        highlight: 'in one place',
        intro: 'Each module appears for whoever needs it. Every action is checked on the server against the role and the condominium of the signed-in user.',
        modules: [
          { title: 'Packages', description: 'The front desk logs each arrival and the resident picks it up with a code. The history shows who picked it up and when.' },
          { title: 'Bookings', description: 'Party room, barbecue area and court, with fees, minimum notice and a monthly limit. When a space requires it, the building manager approves or declines.' },
          { title: 'Visitors', description: "The resident authorizes the visit, the front desk sees the day's list and logs the entry." },
          { title: 'Issues', description: "The resident reports a problem and follows the building manager's reply through the portal." },
          { title: 'Votes', description: 'Polls with a deadline and partial results for the building manager, with one vote per unit.' },
          { title: 'Announcements', description: 'Notices from the building manager to the whole condominium, with the most important ones pinned to the top.' },
          { title: 'Finances', description: "For the building manager, the month's collections and arrears by unit. For residents, their bills and duplicate copies." },
          { title: 'Billing', description: "In the admin panel, the management company posts the month's fee for every unit, records payments and attaches the bill as a PDF." },
          { title: 'Email notifications', description: 'Package received, visitor at the front desk, booking approved or declined, new vote: each event notifies whoever needs to know.' },
        ],
      },
      facts: {
        period: 'Apr–Oct 2026',
        team: TEAM,
        numbers: [{ label: 'apps in a monorepo' }, { label: 'pages' }, { label: 'database tables' }, { label: 'portal PageSpeed on mobile' }],
      },
      figma: {
        ...FIGMA_HEAD,
        text: 'The portal is also in Figma: variables with the same tokens as the code, components with variants and interactive states, and a clickable prototype covering all three roles. The Brand collection has two modes, and switching modes changes the whole identity, just as it would for a new client.',
        previewAlt: "Prototype flow in Figma: the resident's home, bookings, the completed form and the request sent, connected by interaction arrows",
        stats: [{ label: 'variables' }, { label: 'components' }, { label: 'screens' }, { label: 'prototype flows' }],
      },
      listing: {
        summary: 'Website, portals for managers, residents and the front desk, and a CMS admin panel in one product, with a public demo.',
        coverAlt: "Condomira's building manager portal on desktop and the website on mobile",
      },
      features: {
        eyebrow: 'The product',
        title: 'Three apps,',
        highlight: 'one platform',
        intro: 'Everything is live. The portal has three roles, building manager, resident and front desk, each with its own menu and home screen. Open each app and sign in with the demo credentials below.',
        note: 'How the demo works: feel free to create, edit and delete anything. The data goes back to its original state every day at 3 am (Brasília time). The CMS, file uploads and email notifications are turned off, and search engines do not index the site.',
        items: [
          {
            title: 'Company website',
            description: "The management company's storefront: each service has its own page with an indexable URL, and the contact form sends the lead straight to the admin panel.",
            bullets: ['Home, services, case studies, about and contact', 'Contact form with lead capture'],
            screenAlt: 'The company website in the Condomira demo',
          },
          {
            title: 'Building manager portal',
            description:
              "The building manager signs in and sees the condominium's day: bookings to approve, open issues, units in arrears and packages at the front desk. From the same portal they publish announcements, open votes, give residents and the front desk access, and follow contracts and requests with the management company.",
            bullets: [
              '"Condominium today" summary on the home screen',
              'Resident and front-desk access with a temporary password',
              'Announcements, bookings, issues and votes',
              "The month's collections and arrears by unit",
              'Contracts, documents and requests with the management company',
            ],
            screenAlt: "The building manager's home screen in the Condomira portal, with the Condominium today summary",
          },
          {
            title: 'Resident portal',
            description:
              'Built for mobile and installable as an app. Residents see the packages that have arrived with their pickup code, book the party room or the barbecue area, authorize visitors, vote in condominium polls and download a copy of their monthly fee bill.',
            bullets: [
              'Packages with a pickup code',
              'Bookings with the rules of each space',
              'Authorized visits sent straight to the front desk',
              'Votes with one vote per unit',
              'Monthly fee copies and condominium documents',
            ],
            screenAlt: "The resident's home screen in the Condomira portal, with packages, the next booking, a vote and bills",
          },
          {
            title: 'Front desk',
            description: "The doorman logs the package and the resident receives the pickup code. Visits authorized by residents appear on the day's list, and the entry is logged with one tap.",
            bullets: ['Package arrivals and pickups', "Today's expected visitors and the day's entries", 'Condominium announcements'],
            screenAlt: 'The front desk screen in the Condomira portal, with expected visitors and packages awaiting pickup',
          },
          {
            title: 'Admin panel',
            description:
              "Where the management company's team works: they register clients and contracts, answer requests, post each condominium's monthly fee with the bill as a PDF, choose which documents residents can see, follow the website's leads and edit the copy through the CMS.",
            bullets: ['Dashboard, leads, clients, contracts and requests', "Billing: the month's fee per unit, payments and PDF bills", 'Documents shared with residents', 'CMS and users'],
            screenAlt: "The billing screen of the Condomira admin panel, with each unit's monthly fee",
          },
        ],
      },
      stackNotes: {
        pnpm: 'Monorepo with pnpm workspaces and shared packages for the database, authentication and UI.',
        Prisma: 'A single schema for all three apps, with a seed that recreates the demo data.',
        Resend: 'Portal email notifications: package received, visitor at the front desk, bookings, votes and issues.',
        Vercel: 'Three projects deployed on every push, documents and bills in private Blob storage, and a Cron job for the daily demo reset.',
        'Auth.js': 'Version 5. Email and password sign-in (bcrypt) for the portal and the admin panel, with separate sessions and building manager, resident and front-desk roles.',
        'Next.js': 'Version 16: three apps with the App Router and Turbopack. Each service on the website has its own route that Google can index, and the portal is installable as a PWA.',
        TypeScript: 'End-to-end typing, from the database schema to the components of all three apps.',
        'Tailwind CSS': 'Version 4. A shared design system: the website, portal and admin panel use the same components.',
        'Neon Postgres': 'Serverless PostgreSQL shared by the website, portal and admin panel.',
      },
      brand: {
        concept: 'Two roofs shaped like arrows, cut out of a rounded square: the buildings and the idea of moving forward together. A single, sober shade of petrol blue, and the name in a geometric sans that works from the app icon on the phone to the top of the portal.',
        intro: "A brand created for the platform's public demo. The name, logo and contacts live in a single file, swapped for each management company.",
        colors: [
          { name: 'Petrol blue', usage: 'Logo and icon' },
          { name: 'Site petrol', usage: 'Site: buttons and accents' },
          { name: 'Dark petrol', usage: 'Site: footer' },
          { name: 'Ice', usage: 'Site: light backgrounds' },
          { name: 'Gold', usage: 'Site: details' },
        ],
        fonts: [
          { role: 'Headings', usage: 'Headings and calls to action on the website, portal and admin panel.' },
          { role: 'Body', usage: 'Body text, forms and tables.', sample: 'Condominium management' },
        ],
        logo: { alt: 'Condomira Gestão Condominial logo' },
        variants: [{ label: 'Horizontal' }, { label: 'Symbol' }],
        applications: [
          { label: 'App icon and favicon', detail: "The symbol alone in the browser tab and on the phone's home screen, where the portal is installed as an app." },
          { label: 'Website, portal and admin panel', detail: "Horizontal logo at the top of the management company's website, in the portal sidebar and in the admin panel." },
          { label: 'White footer and sign-in', detail: 'On the petrol blue of the footer and the portal sign-in screen, the logo appears all in white.' },
        ],
      },
    },
  },

  limpoai: {
    category: 'Upholstery cleaning',
    tagline: 'AI quotes from a photo and a calendar with real availability',
    description:
      "Website and booking system for an upholstery cleaning business: AI builds the order from a photo right on the customer's phone, the price is agreed on WhatsApp and the calendar only offers slots that are actually free.",
    role: 'Senior Design Engineer (UI/UX, Front-end & Full-Stack)',
    status: 'Live',
    challengeText:
      'Upholstery cleaning is usually sold over WhatsApp, with a lot of back-and-forth to send photos, explain what needs cleaning and find a time. The challenge was to shorten that path, with the order arriving ready in the chat and real availability right on the website, and to give the location a management system with no fixed costs, since it was just starting out.',
    solutionText:
      "We built a website where customers handle everything in a few steps: they take a photo and the AI builds the order, they adjust the items if needed and pick a free time slot. The order arrives ready on the owner's WhatsApp, and the price is agreed in the chat. Behind it, an admin panel with calendar, customers, pricing, promotions and marketing runs only on services with free plans.",
    highlights: {
      'IA sem servidor e sem custo': {
        title: 'Serverless AI at no cost',
        body: 'The roughly 7.8 MB model is only downloaded when the section comes into view and runs in a Web Worker: the page never freezes and there is no AI API bill.',
      },
      'Vaga garantida sem conflito': {
        title: 'Guaranteed slots, no double booking',
        body: 'Each booking checks the slot in a serializable database transaction, so two customers never get the same time.',
      },
      'Origem de cada pedido': {
        title: 'Where every order comes from',
        body: 'UTM, gclid and fbclid are kept for 30 days and travel with the booking. The admin panel groups orders by channel and campaign.',
      },
      'Privacidade e LGPD': {
        title: 'Privacy and LGPD (data protection)',
        body: "GA4, Google Ads and Meta Pixel only load after cookie consent, and a customer's data can be deleted from the admin panel.",
      },
    },
    caseContent: {
      ogEyebrow: 'Case study',
      notice: "Project built for LIMPO.AI's Águas Claras location (Federal District, Brazil).",
      heroPrimaryLabel: 'Visit the live site',
      heroSecondaryLabel: 'What was delivered',
      cta: {
        eyebrow: 'Next step',
        title: 'Want to sell',
        highlight: 'while the customer is still on your site?',
        text: 'We build websites that put the order together and show availability on the spot, with an admin panel for your team to manage orders.',
        whatsappText: "Hi! I saw the LIMPO.AI case study and I'd like something like it for my business.",
      },
      admin: {
        eyebrow: 'Team admin panel',
        title: 'From first order to loyal customer,',
        highlight: 'in one place',
        intro: 'What appears on the website is edited in the admin panel and updates instantly, with no redeploy. Each person only sees the areas their access level allows.',
        modules: [
          { title: 'Overview', description: 'Orders, revenue earned, average ticket, customer sources and the schedule for the next 7 days.' },
          { title: 'Calendar', description: 'List or weekly view, with confirm, complete and cancel, the amount charged and blocked days.' },
          { title: 'Customers', description: 'A CRM built from bookings, with history, tags, referrals and ready-made WhatsApp messages.' },
          { title: 'Pricing and promotions', description: 'The quote calculator table, installments, coupons, referrals and a pet plan, all editable.' },
          { title: 'Marketing', description: 'Orders by channel and campaign, a UTM link builder, and GA4, Google Ads and Meta Pixel IDs.' },
          { title: 'Access', description: 'Administrator and Agent levels, lockout after wrong passwords, email recovery and a change history.' },
        ],
      },
      brand: {
        intro: 'Colors and fonts checked on the live site, not just in the code.',
        colors: [
          { name: 'Navy', usage: 'Background and headings' },
          { name: 'Dark navy', usage: 'Sections and button text' },
          { name: 'Cyan', usage: 'Buttons and highlights' },
          { name: 'Sun', usage: 'Glows and details' },
          { name: 'Cream', usage: 'Light backgrounds' },
          { name: 'Stain', usage: 'Stains on the cushion' },
        ],
        fonts: [
          { role: 'Headings', usage: 'Headings and highlight numbers.' },
          { role: 'Accents', usage: 'Italic words inside headings.' },
          { role: 'Body', usage: 'Body text and forms.' },
          { role: 'Labels', usage: 'Tags, counters and the quote receipt.' },
        ],
      },
      facts: { period: 'Oct 2026', team: TEAM, numbers: [{ label: 'pages' }, { label: 'components' }, { label: 'database tables' }, { label: 'API routes' }] },
      figma: {
        ...FIGMA_HEAD,
        text: 'The website is also in Figma: variables with the same tokens as the code, components with variants and interactive states, and a clickable prototype from the photo quote to the booking. The Brand collection has two modes, and switching modes changes the whole identity.',
        previewAlt: 'Prototype flow in Figma: choosing the photo, the AI analyzing it, the order put together and the booking, connected by interaction arrows',
        stats: [{ label: 'variables' }, { label: 'components' }, { label: 'screens' }, { label: 'prototype flow' }],
      },
      listing: {
        summary: "AI quotes from a photo right on the customer's phone, and a calendar that only offers slots that are really free.",
        coverAlt: 'The Limpo.AI website on desktop and mobile',
      },
      features: {
        eyebrow: 'What was delivered',
        title: 'From the first click',
        highlight: 'to the booked appointment',
        intro: 'Four steps of the website, as they are live.',
        items: [
          {
            title: 'A cushion to clean',
            description: 'Right at the top, visitors move the mouse (or a finger) over a stained cushion and watch the dirt disappear while a counter goes from 0% to 100% clean.',
            bullets: ['Shows the result of the service before any text', 'Location and next free slot right at the top of the page'],
            screenAlt: 'The LIMPO.AI website opening with the stained cushion',
          },
          {
            title: 'Photo quotes, with on-device AI',
            description:
              'The customer sends a photo and the AI recognizes a sofa, armchair, chair or bed and builds the order. The analysis runs in the browser itself: the photo only leaves the device when the customer taps “Veja o preço” (“See the price”), and then it goes to the team along with the message.',
            bullets: ['MediaPipe with the EfficientDet-Lite0 model, in a Web Worker', 'The customer corrects the items if the AI gets them wrong', 'Rugs, cars and stains go to the team for assessment'],
            screenAlt: 'The LIMPO.AI photo quote section',
          },
          {
            title: 'Order built, price on WhatsApp',
            description: 'The customer builds the order item by item and sees the on-site time and the drying time. The price comes from LIMPO.AI itself, on WhatsApp, with the order already written in the message.',
            bullets: [
              'Price table set up in the admin panel and hidden on the site, ready to come back if the location wants it',
              'Items, times and payment methods defined in the admin panel',
              'Order ready to book or send on WhatsApp',
            ],
            screenAlt: 'The LIMPO.AI quote calculator with the order receipt and the “Veja o preço” button',
          },
          {
            title: 'A calendar with real availability',
            description: "Only free slots appear, Monday to Saturday, morning and afternoon. When the form is sent, the slot is checked again and the order arrives ready on the owner's WhatsApp.",
            bullets: ['Postal code lookup for the service area and a fee by neighborhood', 'Coupon, referral code and pet plan right in the form'],
            screenAlt: 'The LIMPO.AI booking form with the free days',
          },
        ],
      },
      stackNotes: {
        GSAP: 'Page animations and smooth scrolling with Lenis.',
        React: 'Version 19. Interactive components: the cushion, the quote calculator, the photo quote and the calendar.',
        Prisma: "Bookings, customers, settings and history in Neon's serverless Postgres.",
        Vercel: 'Deployed in São Paulo, with a daily Cron job for service follow-up reminders.',
        'Next.js': 'Version 16. Website, admin panel and API routes in the same app, with a daily reminder job.',
        MediaPipe: 'Object detection in the browser, in a Web Worker, with no AI server.',
        TypeScript: 'Pricing, scheduling and permission rules typed and validated with zod.',
        'Tailwind CSS': "Tokens for the brand and the website's visual language.",
      },
    },
  },

  veritas: {
    category: 'Auditing & Accounting',
    tagline: 'Company website and admin panel for an accounting audit firm',
    description:
      "Website for an auditing and accounting firm in Brasília, built around the brand's symbol, with its own admin panel so the team can edit copy, photos and contacts without relying on a developer.",
    role: 'Senior Design Engineer (UI/UX, Front-end & Full-Stack)',
    status: 'Live',
    challengeText:
      'Accounting firm websites tend to look alike, and Veritas needed to show technical rigor from the very first contact, both to companies and to condominiums. The team also needed to run the website on their own: change copy and photos, update contacts and follow up on proposal requests.',
    solutionText:
      "We started from the brand's own symbol. On the opening screen, a photo of Brasília appears inside the stripes of the “V”. The four services become four stripes, each in the color of a stripe in the symbol. Details from an auditor's working papers (ruled lines, monospaced numerals and check marks) tie the identity together. Behind it, a custom admin panel edits every section of the website and organizes incoming contacts.",
    highlights: {
      'Conteúdo com rede de segurança': {
        title: 'Content with a safety net',
        body: 'Each section has a validated schema (zod) with text limits. If the database fails, the website shows the default content instead of breaking.',
      },
      'Imagens leves por padrão': {
        title: 'Lightweight images by default',
        body: 'Resizing in the browser, conversion to WebP with sharp, and automatic cleanup of photos that no section uses.',
      },
      'LGPD desde o início': {
        title: 'Data protection (LGPD) from the start',
        body: "A privacy policy generated from the admin panel's data, and a 12-month retention period applied automatically to incoming contacts.",
      },
      'Acesso em dois níveis': { title: 'Two access levels', body: 'Administrator and Editor with separate permissions, password recovery and a change history.' },
    },
    caseContent: {
      ogEyebrow: 'Case study',
      heroPrimaryLabel: 'Visit the live site',
      heroSecondaryLabel: 'What was delivered',
      cta: {
        eyebrow: 'Next step',
        title: 'Want a website like this',
        highlight: 'for your firm?',
        text: 'We build websites with their own identity and an admin panel so your team can update the content without depending on anyone.',
        whatsappText: "Hi! I saw the Veritas case study and I'd like a website like this for my business.",
      },
      admin: {
        eyebrow: 'Custom admin panel',
        title: 'The team runs the website',
        highlight: 'without a developer',
        intro: 'Copy, photos and contacts are edited in the admin panel. If the database fails, the website stays up with the default content.',
        modules: [
          {
            title: 'Website content',
            description: 'Every section is editable: hero, services, condominiums, steps, FAQ and contact. Saving updates the website instantly, and an “Original text” button undoes the change.',
          },
          {
            title: 'Optimized photos',
            description: 'Photos are resized in the browser before upload and converted to WebP on the server. Those no section uses anymore are deleted after a day.',
          },
          { title: 'Contacts', description: 'Every form submission is saved as new, handled or archived, with an optional email notification.' },
          { title: 'Privacy (LGPD)', description: "A privacy page built from the Contact section's details. Incoming contacts are deleted automatically after 12 months." },
          { title: 'Users and history', description: 'Administrator and Editor with different permissions, and a history of the changes made in the admin panel.' },
          { title: 'Protected form', description: 'A limit of 5 submissions per hour per address and a honeypot for bots, with no captcha for visitors.' },
        ],
      },
      brand: {
        intro: 'Colors and fonts checked on the live site. The colors come from the original brand file.',
        colors: [
          { name: 'Navy', usage: 'Backgrounds and headings' },
          { name: 'Green', usage: 'V stripe and highlights' },
          { name: 'Light green', usage: 'V stripe' },
          { name: 'Blue', usage: 'V stripe' },
          { name: 'Paper', usage: 'Light section backgrounds' },
          { name: 'Graphite', usage: 'Supporting text' },
        ],
        fonts: [
          { role: 'Headings and body', usage: 'All the typography on the site, from headings to body text.' },
          { role: 'Numbers and labels', usage: 'Figures, steps and labels, like an audit working paper.' },
        ],
      },
      facts: { period: 'Oct 2026', team: TEAM, numbers: [{ label: 'pages' }, { label: 'components' }, { label: 'database tables' }, { label: 'Lighthouse accessibility' }] },
      figma: {
        ...FIGMA_HEAD,
        text: "The website is also in Figma: variables with the same tokens as the code, components with variants and a clickable mobile prototype, from the home screen to the message sent on WhatsApp, including the site's own select list. The Brand collection has two modes, and switching modes changes the whole identity, including the symbol.",
        previewAlt: 'Prototype flow in Figma: the contact form filled in, the services list open, the form ready, WhatsApp with the message and the message sent, connected by arrows',
        stats: [{ label: 'variables' }, { label: 'components' }, { label: 'screens' }, { label: 'prototype flow' }],
      },
      listing: {
        summary: "An accounting audit firm's website built around the brand symbol, with an admin panel for the team to edit everything.",
        coverAlt: 'The Veritas website on desktop and mobile',
      },
      features: {
        eyebrow: 'What was delivered',
        title: 'A website that speaks',
        highlight: "the auditor's language",
        intro: 'Three moments of the website, as they are live.',
        items: [
          {
            title: 'A V-shaped opening',
            description: 'A photo of Brasília appears inside the stripes of the brand symbol. As the visitor scrolls, the V grows until the photo fills the whole screen.',
            bullets: ['Symbol converted from the original EPS file to SVG', 'Scroll-driven animation with GSAP and Lenis'],
            screenAlt: 'The Veritas website opening with the V symbol',
          },
          {
            title: 'Four services, four stripes',
            description: 'Each service is a stripe with its own photo, in the color of the matching stripe of the V. On hover, the stripe opens to show what is included, with the proposal button.',
            bullets: ['Auditing and accounting advisory', 'Accounting for micro and small businesses', 'Condominium audits', 'Tax services and ancillary obligations'],
            screenAlt: 'The Veritas services section in four stripes with photos',
          },
          {
            title: 'A magnifying glass over the accounts',
            description: 'For building managers and audit committees, a sample statement of accounts with a magnifying glass: as the cursor moves, the visitor sees each entry being checked, with checked and pending marks.',
            bullets: ['Numerals in IBM Plex Mono, like an audit working paper', 'A list of what is checked and of good times to audit'],
            screenAlt: 'The Veritas condominiums section with the magnifying glass over the statement of accounts',
          },
        ],
      },
      stackNotes: {
        GSAP: 'Animations for the opening and the stripes, with smooth scrolling by Lenis.',
        React: 'Version 19. One component per section, in page order, easy to rearrange.',
        Prisma: 'Content, contacts, users and history in the same schema.',
        Vercel: 'Deployed in São Paulo; the build applies the database schema before publishing.',
        'Next.js': 'Version 16, with the App Router; sitemap, structured data and the share image generated by the site itself.',
        TypeScript: 'A typed content schema: every editable field has a type and a length limit.',
        'Tailwind CSS': 'Brand tokens in the theme: navy, greens, blue and the paper tone.',
        'Neon Postgres': "The project's own database, in the São Paulo region.",
      },
    },
  },

  'cm-imoveis': {
    category: 'Real estate platform',
    tagline: 'Full-Stack & CRM',
    description:
      'A complete real estate portal with smart search, a private CMS/CRM admin panel, dynamic SEO through Open Graph and native dark mode, all serverless and fully owned by the client.',
    role: 'Senior Design Engineer (UI/UX, Front-end & Back-end)',
    status: 'Live',
    challengeText:
      'Realtor Cassia Marques needed more than a virtual storefront; she needed a self-running sales machine. The challenge was to create a high-end experience for buyers (focused on performance and SEO) while building a robust, secure management system (CMS/CRM) so she could manage her listings and leads without relying on third parties or paying monthly fees for generic platforms.',
    solutionText:
      'I built a complete real estate portal with a modern stack. The interface was designed for conversion and accessibility, and the back end was built on a serverless architecture for top speed and data security.',
    impactText: 'CM Imóveis now has its own scalable, Google-optimized platform, giving the realtor full operational autonomy and her clients an immersive experience.',
    highlights: {
      'Engenharia de Busca Inteligente': {
        title: 'Smart search engineering',
        body: 'A dynamic autocomplete connected to the database, so users only filter by locations with listings actually available, which reduces the bounce rate.',
      },
      'Painel Administrativo Privado': {
        title: 'Private admin panel',
        body: 'A custom CMS protected by Google sign-in, for adding listings, uploading photos (via Google Cloud) and managing contacts (CRM) in real time.',
      },
      'Performance & SEO Dinâmico': {
        title: 'Performance & dynamic SEO',
        body: 'Open Graph tags generated automatically from server data. Every listing shared on WhatsApp shows a rich, instant preview card.',
      },
      'UI/UX Premium': {
        title: 'Premium UI/UX',
        body: 'Native dark mode (next-themes) with smooth transitions, and glassmorphism to highlight forms without hiding the photos of high-end properties.',
      },
    },
    caseContent: {
      ogEyebrow: 'Case study',
      heroPrimaryLabel: 'Visit the live site',
      heroSecondaryLabel: 'What was delivered',
      facts: { period: 'Apr–Aug 2026', team: TEAM, numbers: [{ label: 'pages' }, { label: 'components' }, { label: 'API routes' }, { label: 'commits' }] },
      figma: {
        ...FIGMA_HEAD,
        text: 'The portal is also in Figma: variables with the same tokens as the code, components with variants and a clickable mobile prototype, from the search to a visit booked with the realtor. The Brand collection has two modes, and switching modes changes the whole identity.',
        previewAlt: 'Prototype flow in Figma: the search, the results, the listing details, the visit booking and the visit booked, connected by interaction arrows',
        stats: [{ label: 'variables' }, { label: 'components' }, { label: 'screens' }, { label: 'prototype flow' }],
      },
      listing: {
        summary: 'Real estate portal whose search only shows neighborhoods with listings, plus a custom CRM for the realtor.',
        coverAlt: 'The CM Imóveis portal on desktop and mobile',
      },
      brand: {
        concept: 'The initials CM in heavy, geometric letters: the C carries an amber-to-violet gradient that gives the brand warmth, and the M stays solid graphite. Below, IMÓVEIS in widely spaced capitals. The same gradient fills the house in the favicon.',
        intro: "Logo, palette and typography for CM Imóveis, created alongside the portal. The logo's letters are Helvetica Neue Bold converted to outlines.",
        colors: [
          { name: 'Amber', usage: 'Start of the gradient in the C and the house' },
          { name: 'Pink', usage: 'Middle of the gradient' },
          { name: 'Violet', usage: "End of the gradient and the site's accent color" },
          { name: 'Graphite', usage: 'The M, IMÓVEIS and the icon background' },
          { name: 'Off-white', usage: 'Site background' },
        ],
        logo: { alt: 'CM Imóveis logo' },
        variants: [{ label: 'Color' }, { label: 'White' }, { label: 'Icon (house)' }],
        applications: [
          { label: 'Favicon and app icon', detail: "The house in the brand gradient, on graphite, in the browser tab and on the phone's home screen." },
          { label: 'Site header and admin sign-in', detail: "Color logo in the portal header and on the realtor's admin sign-in page." },
          { label: 'Watermark on photos', detail: 'The admin panel applies the logo to listing photos.' },
          { label: 'Listing videos', detail: 'The white version signs the videos assembled by the admin panel.' },
        ],
        fonts: [
          { role: 'Headings', usage: 'Display and headings, with italics for accents.' },
          { role: 'Interface and body', usage: 'Buttons, filters, listing cards and body text.' },
        ],
        rules: {
          do: [
            'Use the color version on white and light backgrounds',
            'Use the white version on dark backgrounds and photos',
            'Keep the clear space around the logo',
            'Use the gradient only on the defined elements',
            'Respect the minimum height of 24px',
            'Use Playfair Display for headings and Montserrat for UI',
          ],
          dont: [
            "Don't change the logo's original colors",
            "Don't distort, rotate or add effects",
            "Don't use it on low-contrast backgrounds",
            "Don't use the color version on colored backgrounds",
            "Don't add shadows or borders to the logo",
          ],
        },
      },
      cta: {
        eyebrow: 'Next step',
        title: 'Want a portal like this',
        highlight: 'for your real estate business?',
        text: 'We build portals with search, a custom admin panel and a CRM, without relying on generic platforms.',
        whatsappText: "Hi! I saw the CM Imóveis case study and I'd like a portal like this for my business.",
      },
    },
  },

  'fino-trato': {
    category: 'Professional cleaning',
    tagline: 'Website with online booking, CRM and a brand system',
    description:
      'Website for an upholstery cleaning company in Brasília: a landing page with an interactive before-and-after, quote requests and online booking, and an admin panel with Google sign-in where the team follows leads and bookings and edits services, testimonials, photos and SEO. The brand was also created from scratch.',
    role: 'Senior Design Engineer (UI/UX & Front-end)',
    status: 'Live',
    challengeText:
      "Fino Trato needed a website that would earn the trust of families in Brasília, show the results of the service and turn visits into requests. The team also needed to track quotes and bookings without relying on scattered WhatsApp conversations, and the brand didn't exist yet.",
    solutionText:
      'I created the brand from scratch (logo, palette, typography and usage guide) and built the website in Next.js: an interactive before-and-after, quote requests and online booking with date and time of day, with an email notification for every request. In the admin panel, with Google sign-in, the team follows leads and bookings in a CRM and edits services, testimonials, photos and SEO without a developer.',
    impactText:
      'Fino Trato now has a consistent brand across every channel and a website that takes requests and bookings at any time, with everything recorded in an admin panel the team runs on its own.',
    highlights: {
      'Antes e depois interativo': { title: 'Interactive before-and-after', body: 'Visitors drag the handle and see the same piece of upholstery before and after cleaning.' },
      'Agendamento online': {
        title: 'Online booking',
        body: 'Service, preferred date and time of day (morning, afternoon or evening) chosen on the website, with confirmation on WhatsApp and an email to the team for every request.',
      },
      'CRM de leads e agendamentos': { title: 'Lead and booking CRM', body: 'Every request enters the admin panel with a status, from first contact to service completed.' },
      'Painel com login Google': { title: 'Admin panel with Google sign-in', body: 'Access restricted to the team, with no new password to remember.' },
      'Conteúdo editável': { title: 'Editable content', body: 'Services, testimonials, hero photos and SEO change through the admin panel, without a developer.' },
      'Marca criada do zero': { title: 'Brand created from scratch', body: 'Logo, palette, typography, tokens and usage guide documented and applied to the website.' },
    },
    caseContent: {
      ogEyebrow: 'Case study',
      heroPrimaryLabel: 'Visit the live site',
      heroSecondaryLabel: 'What was delivered',
      facts: { period: 'Apr–Oct 2026', team: TEAM, numbers: [{ label: 'pages' }, { label: 'database tables' }, { label: 'API routes' }, { label: 'commits' }] },
      figma: {
        ...FIGMA_HEAD,
        text: 'The website is also in Figma: variables with the same colors and fonts as the code, components with variants and interactive states (the before-and-after slider moves with a tap) and a clickable prototype from the top of the page to the request on WhatsApp. The Brand collection has two modes, and switching modes changes the whole identity.',
        previewAlt: 'Prototype flow in Figma: the top of the page, the before-and-after, the empty and completed booking form and the request on WhatsApp, connected by arrows',
        stats: [{ label: 'variables' }, { label: 'components' }, { label: 'screens' }, { label: 'prototype flow' }],
      },
      listing: {
        summary: 'Landing page with before-and-after, online booking and a CRM admin panel, with a brand created from scratch.',
        coverAlt: 'The Fino Trato website on desktop and mobile',
      },
      brand: {
        concept: 'A hexagon in two halves, blue and purple, frames a sofa with water drops: the service explained in the symbol itself. The name in a classic serif sets the careful tone of “fino trato” (fine care), and the line of services in spaced capitals closes the set in the same two colors.',
        intro: 'Logo created in 2020. With the new website, the brand gained a digital palette, typography, voice and usage rules, documented in a guide.',
        colors: [
          { name: 'Blue', usage: 'Logo: half of the hexagon and the services' },
          { name: 'Purple', usage: 'Logo: half of the hexagon, the sofa and the name' },
          { name: 'Light blue', usage: 'Logo: water drops' },
          { name: 'Royal blue', usage: 'Site: buttons and links' },
          { name: 'Bright purple', usage: 'Site: brand gradient' },
          { name: 'Night', usage: 'Site: dark backgrounds' },
        ],
        logo: { alt: 'Fino Trato logo' },
        variants: [{ label: 'Horizontal' }, { label: 'Vertical' }, { label: 'Symbol' }],
        applications: [
          { label: 'Favicon', detail: 'The hexagon alone, in the browser tab.' },
          { label: 'Site header, admin panel and sign-in', detail: 'Horizontal logo in the landing page header and on the admin sign-in page.' },
          { label: 'Brand guidelines', detail: 'A page with the logo, palette, typography, voice and usage rules, published with the website.' },
        ],
        fonts: [
          { role: 'Headings', usage: 'Display and headings, with italics for accents.' },
          { role: 'Interface and body', usage: 'Buttons, forms and body text.' },
        ],
        rules: {
          do: [
            'Use blue #1565C0 as the accent color for CTAs',
            'Pair Playfair Display (headings) with Inter (body)',
            'Use the blue→purple gradient on banners and highlights',
            'Keep the clear space around the logo',
            'Respect the minimum size of 120px / 32mm',
            'Use real photos of the service with before/after',
          ],
          dont: [
            "Don't distort the logo or apply unapproved effects",
            "Don't use it on low-contrast backgrounds",
            "Don't mix in other fonts without approval",
            "Don't use generic stock images",
            "Don't overuse ALL CAPS",
          ],
        },
        voice: {
          intro: 'Fino Trato communicates care, expertise and closeness. The language blends professionalism and warmth, like a specialist the family trusts.',
          traits: ['Trustworthy', 'Professional', 'Sophisticated', 'Careful', 'Welcoming', 'Transparent'],
          tone: ['Direct and clear', 'Educational', 'Close, not intimate', 'Aspirational', 'No technical jargon'],
        },
      },
      cta: {
        eyebrow: 'Next step',
        title: 'Want a brand and a website',
        highlight: 'that bring in requests?',
        text: 'We create the brand, the website and the admin panel so your team can follow every request.',
        whatsappText: "Hi! I saw the Fino Trato case study and I'd like something like it for my business.",
      },
    },
  },

  cejb: {
    category: 'Institutional website',
    tagline: 'Digital presence for the most complete condominium in Jardim Botânico',
    description:
      'A one-page institutional website with professional aerial photography and a green identity, conveying security, sustainability and quality of life at a 488-unit condominium in Brasília, Brazil.',
    role: 'Senior Design Engineer (UI/UX, Front-end & Digital Strategy)',
    status: 'Live',
    challengeText:
      'CEJB, one of the first and most traditional condominiums in Jardim Botânico, with 488 units and almost 40 years of history, needed a digital presence that matched its standard. It had to convey a unique lifestyle (safe, sustainable and full of leisure) in a modern web experience, without losing its institutional essence and the warmth of the community.',
    solutionText:
      "We built a one-page institutional website with an immersive design, with professional aerial photography and video at center stage. The information architecture guides visitors through the condominium's pillars: security (24/7 video monitoring, 3 gatehouses), sustainability (4 solar plants, 27,000 kWh/month) and quality of life (full leisure facilities, a soccer school, a party hall). A WordPress CMS gives the client full autonomy.",
    impactText:
      "An institutional website that works as a digital showcase for residents, future residents and partner businesses, strengthening CEJB's image as a reference for high-end living in Brasília's Jardim Botânico. A single form for contact and partnerships, location shortcuts to Google Maps and Waze, and a gallery of 27 professional photos in the Leisure section.",
    highlights: {
      'Design Imersivo com Identidade Verde': {
        title: 'Immersive design with a green identity',
        body: 'A palette and visual hierarchy inspired by nature and the privileged location, close to the Brasília Botanical Garden. Professional aerial photography (drone) takes center stage in the user experience.',
      },
      'Sustentabilidade em Destaque': {
        title: 'Sustainability in the spotlight',
        body: 'A section dedicated to the 4 solar power plants (27,000 kWh/month, installed in 2023), positioning CEJB as an environmental reference and directly lowering the energy bills of the common areas.',
      },
      'Comunicação de Segurança': {
        title: 'Communicating security',
        body: 'A section built to convey institutional trust: 24/7 video monitoring of common areas, access control with gates and turnstiles at 3 gatehouses, and a continuously trained team.',
      },
      'Estratégia One-Page de Alto Impacto': {
        title: 'A high-impact one-page strategy',
        body: 'Single-page UX architecture with smooth scrolling, a leisure gallery with 27+ professional photos, a mail section and a single contact form for residents and partner businesses.',
      },
    },
    caseContent: {
      ogEyebrow: 'Case study',
      heroPrimaryLabel: 'Visit the live site',
      heroSecondaryLabel: 'What was delivered',
      facts: { period: '2025', team: TEAM, numbers: [{ label: 'units in the condominium' }] },
      figma: {
        ...FIGMA_HEAD,
        text: 'The website is also in Figma: variables with the colors and fonts of the live theme (olive green, sand, Lato and Lora), components with variants and a clickable mobile prototype, from the menu to the leisure gallery and the contact with the management office. The Brand collection has two modes, and switching modes changes the whole identity.',
        previewAlt: 'Prototype flow in Figma: home, menu, leisure gallery, contact form and message sent, connected by interaction arrows',
        stats: [{ label: 'variables' }, { label: 'components' }, { label: 'screens' }, { label: 'prototype flow' }],
      },
      listing: {
        summary: 'Website for a 488-unit condominium, with aerial photos and video and content updated by the management office.',
        coverAlt: 'The Condomínio Estância Jardim Botânico website on desktop and mobile',
      },
      brand: {
        concept: 'Three leaves that are also trees, with white trunks, grow under a sand-colored arch. The middle leaf, in green, is the tallest. Below, “Condomínio” in spaced capitals and the name in green italics: a calm brand, close to the nature of the Jardim Botânico.',
        intro: "The condominium's logo, used on the website, on social media and in notices to residents. The colors come from the original logo file and the website theme.",
        colors: [
          { name: 'Green', usage: 'Logo: the name and the middle leaf' },
          { name: 'Sand', usage: 'Logo: arch' },
          { name: 'Gold', usage: 'Logo: left leaf' },
          { name: 'Khaki', usage: 'Logo: right leaf' },
          { name: 'Olive green', usage: 'Site: headings and buttons' },
          { name: 'Graphite', usage: 'Site: body text' },
        ],
        logo: { alt: 'Condomínio Estância Jardim Botânico logo' },
        variants: [{ label: 'Full' }, { label: 'Symbol' }],
        applications: [
          { label: 'Website favicon', detail: 'The arch with the three leaves, without the name, in the browser tab.' },
          { label: 'Website header', detail: 'Full logo in the cejbonline.com.br header.' },
          { label: 'Instagram posts', detail: "The logo signs the condominium's posts, at the bottom of each design." },
          { label: 'WhatsApp notices', detail: 'Designs sent to residents, such as the one about the bylaws update, with the logo.' },
        ],
        fonts: [
          { role: 'Headings', usage: 'Website headings.' },
          { role: 'Body', usage: 'Website body text.' },
        ],
        voice: {
          intro: 'CEJB communicates security, belonging and quality of life. The language blends institutional solidity with human warmth, like a condominium that is also a community.',
          traits: ['Safe', 'Welcoming', 'Sustainable', 'Exclusive', 'Community-minded', 'Transparent'],
          tone: ['Institutional and calm', 'Inclusive and family-friendly', 'Positive and proud', 'Trustworthy, not formal', 'Close to nature'],
        },
      },
      cta: {
        eyebrow: 'Next step',
        title: 'Want a website like this',
        highlight: 'for your condominium?',
        text: 'We build institutional websites that showcase the place and that the management office updates on its own.',
        whatsappText: "Hi! I saw the CEJB case study and I'd like a website like this for my condominium.",
      },
    },
  },
}

/* ─── Home ──────────────────────────────────────────────── */

const HERO = {
  badge: 'EM Soluções Digitais',
  titlePrefix: 'Specialists in',
  rotatingWords: 'Digital Authority,Premium Websites,Design & Branding,AI Automation,Paid Ads,Landing Pages,Social Media',
  description: 'Strategy, design and modern technology that make your business the go-to name in its market. Measurable results, polished design.',
  ctaPrimaryText: 'Start a project',
  ctaSecondaryText: 'See our work',
  socialClients: '27+ clients',
}

const FEATURES_CONFIG = {
  tagline: 'Services',
  title1: 'From the first wireframe',
  titleHighlight: 'to a live product',
  description: 'Figma design and development by the same person, from start to finish.',
}

// Pelo título em português
const FEATURES = {
  'Aplicativos e sistemas': {
    title: 'Apps and platforms',
    description: 'Apps for iOS, Android and the web, with sign-in for your customers and an admin panel for your team.',
    deliverables: 'Figma prototype\nIn the app stores or installable\nAdmin panel',
  },
  'Sites institucionais': {
    title: 'Business websites',
    description: 'Fast websites that are easy to find on Google and that your team updates without depending on a developer.',
    deliverables: 'Content admin panel\nTechnical SEO\nMobile-ready',
  },
  'Landing pages': {
    title: 'Landing pages',
    description: 'A single page with a single goal: turning visits into a WhatsApp conversation or a booking.',
    deliverables: 'Copy and design\nWhatsApp and booking\nGoogle Analytics',
  },
  'UX/UI, design system e marca': {
    title: 'UX/UI, design systems and branding',
    description: 'Research, wireframes, clickable prototypes, components and visual identity, documented in Figma and ready for development.',
    deliverables: 'Figma prototype\nDesign system with variables\nVisual identity',
  },
  'Atendimento com IA no WhatsApp': {
    title: 'AI customer service on WhatsApp',
    description: 'An assistant that answers, qualifies and books on WhatsApp, at any time of day.',
  },
  'Tráfego pago': { title: 'Paid ads', description: 'Google and Instagram campaigns, tracked all the way to the contact.' },
  'Redes sociais': { title: 'Social media', description: 'Content and design for Instagram, with a calendar and a strategy.' },
}

const TESTIMONIALS_CONFIG = {
  tagline: 'Testimonials',
  title1: 'Our clients ',
  titleHighlight: 'recommend us',
  description: 'In the words of clients whose projects are live, with the case study alongside so you can check.',
}

// Pelo nome do autor. Tradução fiel: o site mostra "Translated from Portuguese".
const TESTIMONIALS = {
  'Cássia Marques': {
    authorRole: 'CEO, CM Imóveis',
    content:
      "The real estate market doesn't forgive slowness or amateurism. We needed a flawless storefront and a sales engine that could keep up with our pace. EM Soluções Digitais delivered a high-performance platform that exceeded all our expectations. The exclusive control panel they built made managing our leads and updating our listings dramatically easier. With a structure focused on dynamic SEO and sophisticated web design, our properties gained the premium visibility they deserve. It's fast, elegant technology entirely focused on conversion.",
    highlight: 'A high-performance platform that exceeded all our expectations.',
    deliverables: 'Real estate portal\nAdmin panel with CRM\nDynamic SEO',
  },
  'LIMPO.AI': {
    authorRole: 'Águas Claras location',
    content:
      'Before, every quote started with a long exchange of photos and messages on WhatsApp. With the new website, the customer sends a photo of the sofa, the AI builds the order right away, and they pick a time slot that is actually free. We agree on the price on WhatsApp, with everything already in hand. The calendar organized our routine, and the admin panel shows where each order comes from. EM understood our business and delivered fast.',
    highlight: 'The customer sends a photo of the sofa, the AI builds the order right away, and they pick a time slot that is actually free.',
    deliverables: 'AI photo quotes\nCalendar with free slots\nOrders admin panel',
  },
  'Fino Trato': {
    authorRole: 'Management',
    content:
      "In our field, the experience of cleanliness, care and sophistication has to start long before the service itself: it starts on our website. EM Soluções Digitais translated our technical rigor into a flawless digital presence. The new landing page and the premium web design they developed not only raised our brand's status, but created an extremely fast and intuitive booking funnel for our customers. The perceived value of our work changed completely, attracting exactly the high-end audience we wanted. It's a design that builds trust at first sight and brings direct profit to the bottom line.",
    highlight: 'A design that builds trust at first sight and brings direct profit to the bottom line.',
    deliverables: 'Brand from scratch\nLanding page\nOnline booking',
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
    else if (pt.length !== en.length) problems.push(`${slug}: ${at} tem ${en.length} itens em inglês e ${pt.length} em português`)
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
const withEn = (row, en) => ({ ...(row.i18n && typeof row.i18n === 'object' ? row.i18n : {}), [LOCALE]: en })
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
    writes.push({ table: 'clientProject', id: p.id, label: `case ${slug}`, before: p.i18n, after: withEn(p, en) })
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
    if (ptLines !== enLines) problems.push(`serviço "${f.title}": ${enLines} entregas em inglês e ${ptLines} em português`)
    if ((en.deliverables || '').split('\n').some((l) => l.length > 60)) problems.push(`serviço "${f.title}": entrega com mais de 60 caracteres`)
    writes.push({ table: 'feature', id: f.id, label: `serviço ${f.title}`, before: f.i18n, after: withEn(f, en) })
  }
  for (const title of Object.keys(FEATURES)) if (!features.some((f) => f.title === title)) problems.push(`serviço "${title}" não existe em português`)

  for (const t of testimonials) {
    const en = TESTIMONIALS[t.authorName]
    if (!en) {
      problems.push(`depoimento de ${t.authorName} sem tradução`)
      continue
    }
    if (!norm(en.content).includes(norm(en.highlight))) problems.push(`depoimento de ${t.authorName}: a frase em destaque não é trecho do texto`)
    writes.push({ table: 'testimonial', id: t.id, label: `depoimento ${t.authorName}`, before: t.i18n, after: withEn(t, en) })
  }

  if (featuresCfg) writes.push({ table: 'sectionFeaturesConfig', id: featuresCfg.id, label: 'seção Serviços', before: featuresCfg.i18n, after: withEn(featuresCfg, FEATURES_CONFIG) })
  if (testimonialsCfg) writes.push({ table: 'sectionTestimonialsConfig', id: testimonialsCfg.id, label: 'seção Depoimentos', before: testimonialsCfg.i18n, after: withEn(testimonialsCfg, TESTIMONIALS_CONFIG) })
  if (hero) writes.push({ table: 'sectionHeroConfig', id: hero.id, label: 'Hero', before: hero.i18n, after: withEn(hero, HERO) })

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
  const backupFile = path.join(backupDir, `i18n-en-${new Date().toISOString().replace(/[:.]/g, '-')}.json`)
  fs.writeFileSync(backupFile, JSON.stringify(changed.map(({ table, id, label, before }) => ({ table, id, label, i18n: before ?? null })), null, 2))
  console.log(`Backup: ${backupFile}`)
  for (const w of changed) await prisma[w.table].update({ where: { id: w.id }, data: { i18n: w.after } })
  console.log('✅ Versão em inglês gravada.')
  await revalidateSite(['/', '/cases', ...Object.keys(PROJECTS).map((s) => `/cases/${s}`)])
}

main()
  .catch((err) => {
    console.error('❌', err.message || err)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())

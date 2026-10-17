/* ─────────────────────────────────────────────────────────────
   Stack Library — shared between admin and public pages
   Each entry: name (stored value), category, brand color,
   foreground color, and short abbreviation shown inside badge.
──────────────────────────────────────────────────────────────*/

export interface StackDef {
  name: string
  category: string
  color: string   // brand background color
  fg: string      // text/icon color on that background
  abbr: string    // short code shown in the badge (1–3 chars)
  description?: string // Persuasive text explaining the architectural benefit
}

export const STACK_LIBRARY: StackDef[] = [
  // ── Frameworks ───────────────────────────────────────────
  { name: "Next.js",      category: "Framework",      color: "#000000", fg: "#ffffff", abbr: "N↑", description: "Framework de alta performance que garante URLs indexáveis pelo Google (SEO), renderização SSR e tempos de carregamento instantâneos." },
  { name: "React",        category: "Framework",      color: "#61DAFB", fg: "#000000", abbr: "⚛", description: "Arquitetura baseada em componentes reativos, proporcionando uma experiência de usuário (UX) fluida e interativa, sem recarregamentos de página." },
  { name: "Vue.js",       category: "Framework",      color: "#42b883", fg: "#ffffff", abbr: "V"   },
  { name: "Nuxt.js",      category: "Framework",      color: "#00DC82", fg: "#000000", abbr: "Nu"  },
  { name: "Svelte",       category: "Framework",      color: "#FF3E00", fg: "#ffffff", abbr: "Sv"  },
  { name: "SvelteKit",    category: "Framework",      color: "#FF3E00", fg: "#ffffff", abbr: "SK"  },
  { name: "Angular",      category: "Framework",      color: "#DD0031", fg: "#ffffff", abbr: "A"   },
  { name: "Remix",        category: "Framework",      color: "#121212", fg: "#ffffff", abbr: "Rm"  },
  { name: "Astro",        category: "Framework",      color: "#FF5D01", fg: "#ffffff", abbr: "As"  },
  { name: "Gatsby",       category: "Framework",      color: "#663399", fg: "#ffffff", abbr: "Gs"  },
  { name: "Expo",         category: "Framework",      color: "#000020", fg: "#ffffff", abbr: "Ex"  },
  { name: "React Native", category: "Framework",      color: "#61DAFB", fg: "#000000", abbr: "RN"  },

  // ── Linguagens ───────────────────────────────────────────
  { name: "TypeScript",   category: "Linguagem",      color: "#3178C6", fg: "#ffffff", abbr: "TS", description: "Adiciona tipagem estática rigorosa ao código, prevenindo erros em tempo de execução e garantindo estabilidade corporativa à aplicação." },
  { name: "JavaScript",   category: "Linguagem",      color: "#F7DF1E", fg: "#000000", abbr: "JS"  },
  { name: "Python",       category: "Linguagem",      color: "#3776AB", fg: "#ffffff", abbr: "Py"  },
  { name: "Go",           category: "Linguagem",      color: "#00ADD8", fg: "#ffffff", abbr: "Go"  },
  { name: "Rust",         category: "Linguagem",      color: "#CE4A22", fg: "#ffffff", abbr: "Rs"  },
  { name: "PHP",          category: "Linguagem",      color: "#777BB4", fg: "#ffffff", abbr: "PHP" },
  { name: "Ruby",         category: "Linguagem",      color: "#CC342D", fg: "#ffffff", abbr: "Rb"  },
  { name: "Swift",        category: "Linguagem",      color: "#F05138", fg: "#ffffff", abbr: "Sw"  },
  { name: "Kotlin",       category: "Linguagem",      color: "#7F52FF", fg: "#ffffff", abbr: "Kt"  },

  // ── Banco de Dados ───────────────────────────────────────
  { name: "PostgreSQL",   category: "Banco de Dados", color: "#4169E1", fg: "#ffffff", abbr: "PG"  },
  { name: "Neon Postgres",category: "Banco de Dados", color: "#00E699", fg: "#000000", abbr: "Ne"  },
  { name: "MySQL",        category: "Banco de Dados", color: "#4479A1", fg: "#ffffff", abbr: "My"  },
  { name: "SQLite",       category: "Banco de Dados", color: "#003B57", fg: "#ffffff", abbr: "Sq"  },
  { name: "MongoDB",      category: "Banco de Dados", color: "#47A248", fg: "#ffffff", abbr: "Mo"  },
  { name: "Redis",        category: "Banco de Dados", color: "#DC382D", fg: "#ffffff", abbr: "Rd"  },
  { name: "Supabase",     category: "Banco de Dados", color: "#3ECF8E", fg: "#000000", abbr: "Su"  },
  { name: "Firebase",     category: "Banco de Dados", color: "#FFCA28", fg: "#000000", abbr: "Fb"  },
  { name: "PlanetScale",  category: "Banco de Dados", color: "#000000", fg: "#ffffff", abbr: "PS"  },
  { name: "Turso",        category: "Banco de Dados", color: "#4FF8D2", fg: "#000000", abbr: "Tu"  },

  // ── ORM & Runtime ────────────────────────────────────────
  { name: "Prisma",       category: "ORM / Runtime",  color: "#2D3748", fg: "#ffffff", abbr: "Pri", description: "Comunicação com o banco de dados ultrarrápida e segura. Previne vulnerabilidades de injeção e garante integridade dos dados do negócio." },
  { name: "Drizzle",      category: "ORM / Runtime",  color: "#C5F74F", fg: "#000000", abbr: "Dr"  },
  { name: "Node.js",      category: "ORM / Runtime",  color: "#339933", fg: "#ffffff", abbr: "No", description: "Ambiente de execução backend assíncrono e escalável, capaz de lidar com milhares de acessos simultâneos sem gargalos." },
  { name: "Bun",          category: "ORM / Runtime",  color: "#FBF0DF", fg: "#000000", abbr: "Bn"  },
  { name: "Deno",         category: "ORM / Runtime",  color: "#000000", fg: "#ffffff", abbr: "De"  },
  { name: "Express.js",   category: "ORM / Runtime",  color: "#000000", fg: "#ffffff", abbr: "Ep"  },
  { name: "Fastify",      category: "ORM / Runtime",  color: "#000000", fg: "#ffffff", abbr: "Fa"  },
  { name: "Hono",         category: "ORM / Runtime",  color: "#E36002", fg: "#ffffff", abbr: "Ho"  },

  // ── API ──────────────────────────────────────────────────
  { name: "GraphQL",      category: "API",            color: "#E10098", fg: "#ffffff", abbr: "GQ"  },
  { name: "tRPC",         category: "API",            color: "#2596BE", fg: "#ffffff", abbr: "tR"  },
  { name: "REST API",     category: "API",            color: "#6E6E6E", fg: "#ffffff", abbr: "Re"  },
  { name: "Webhook",      category: "API",            color: "#5A5A5A", fg: "#ffffff", abbr: "Wh"  },

  // ── Auth ─────────────────────────────────────────────────
  { name: "Google Auth",  category: "Auth",           color: "#4285F4", fg: "#ffffff", abbr: "GA"  },
  { name: "NextAuth",     category: "Auth",           color: "#7B68EE", fg: "#ffffff", abbr: "NA"  },
  { name: "Auth.js",      category: "Auth",           color: "#7B68EE", fg: "#ffffff", abbr: "Au"  },
  { name: "Clerk",        category: "Auth",           color: "#6C47FF", fg: "#ffffff", abbr: "Cl"  },
  { name: "Lucia",        category: "Auth",           color: "#5C6BC0", fg: "#ffffff", abbr: "Lu"  },
  { name: "JWT",          category: "Auth",           color: "#000000", fg: "#ffffff", abbr: "JWT" },

  // ── Hosting & DevOps ─────────────────────────────────────
  { name: "Vercel",       category: "Hosting",        color: "#000000", fg: "#ffffff", abbr: "▲", description: "Infraestrutura em nuvem global na borda (Edge Network). Garante que o site carregue em milissegundos para o usuário, independente da localização." },
  { name: "AWS",          category: "Hosting",        color: "#FF9900", fg: "#000000", abbr: "AWS" },
  { name: "Google Cloud", category: "Hosting",        color: "#4285F4", fg: "#ffffff", abbr: "GC"  },
  { name: "Railway",      category: "Hosting",        color: "#0B0D0E", fg: "#ffffff", abbr: "Rw"  },
  { name: "Render",       category: "Hosting",        color: "#46E3B7", fg: "#000000", abbr: "Rn"  },
  { name: "Fly.io",       category: "Hosting",        color: "#7C3AED", fg: "#ffffff", abbr: "Fly" },
  { name: "Netlify",      category: "Hosting",        color: "#00C7B7", fg: "#ffffff", abbr: "Nl"  },
  { name: "Docker",       category: "DevOps",         color: "#2496ED", fg: "#ffffff", abbr: "Dk"  },
  { name: "Kubernetes",   category: "DevOps",         color: "#326CE5", fg: "#ffffff", abbr: "K8"  },
  { name: "GitHub Actions",category:"DevOps",         color: "#2088FF", fg: "#ffffff", abbr: "GA"  },

  // ── UI & Styling ─────────────────────────────────────────
  { name: "Tailwind CSS", category: "UI / CSS",       color: "#06B6D4", fg: "#ffffff", abbr: "TW", description: "Design system construído sob medida. Garante exclusividade visual, consistência na interface e tamanho de arquivo otimizado para velocidade." },
  { name: "Framer Motion",category: "UI / CSS",       color: "#0055FF", fg: "#ffffff", abbr: "FM", description: "Motor de micro-animações avançado que adiciona fluidez, dinamicidade e um toque premium a cada interação do usuário." },
  { name: "GSAP",         category: "UI / CSS",       color: "#0AE448", fg: "#000000", abbr: "GS"  },
  { name: "Shadcn/ui",    category: "UI / CSS",       color: "#000000", fg: "#ffffff", abbr: "Sh"  },
  { name: "Radix UI",     category: "UI / CSS",       color: "#8E4EC6", fg: "#ffffff", abbr: "Rx"  },
  { name: "Styled Comp.", category: "UI / CSS",       color: "#DB7093", fg: "#ffffff", abbr: "SC"  },
  { name: "Chakra UI",    category: "UI / CSS",       color: "#319795", fg: "#ffffff", abbr: "Ch"  },
  { name: "Material UI",  category: "UI / CSS",       color: "#007FFF", fg: "#ffffff", abbr: "MUI" },
  { name: "Lucide",       category: "UI / CSS",       color: "#F97316", fg: "#ffffff", abbr: "Lc"  },
  { name: "Figma",        category: "UI / CSS",       color: "#F24E1E", fg: "#ffffff", abbr: "Fg"  },

  // ── Pagamentos & Serviços ────────────────────────────────
  { name: "Stripe",       category: "Pagamento",      color: "#635BFF", fg: "#ffffff", abbr: "💳"  },
  { name: "Mercado Pago", category: "Pagamento",      color: "#009EE3", fg: "#ffffff", abbr: "MP"  },
  { name: "Pix",          category: "Pagamento",      color: "#32BCAD", fg: "#ffffff", abbr: "PIX" },

  // ── Mídia & Comunicação ──────────────────────────────────
  { name: "Cloudinary",   category: "Mídia / Email",  color: "#3448C5", fg: "#ffffff", abbr: "Cy"  },
  { name: "Uploadthing",  category: "Mídia / Email",  color: "#D00000", fg: "#ffffff", abbr: "Ut"  },
  { name: "AWS S3",       category: "Mídia / Email",  color: "#FF9900", fg: "#000000", abbr: "S3"  },
  { name: "Resend",       category: "Mídia / Email",  color: "#000000", fg: "#ffffff", abbr: "Rs"  },
  { name: "SendGrid",     category: "Mídia / Email",  color: "#1A82E2", fg: "#ffffff", abbr: "SG"  },
  { name: "Twilio",       category: "Mídia / Email",  color: "#F22F46", fg: "#ffffff", abbr: "Tw"  },

  // ── IA & ML ──────────────────────────────────────────────
  { name: "OpenAI",       category: "IA / ML",        color: "#000000", fg: "#ffffff", abbr: "⚙"   },
  { name: "LangChain",    category: "IA / ML",        color: "#1C3C3C", fg: "#ffffff", abbr: "LC"  },
  { name: "Vercel AI SDK",category: "IA / ML",        color: "#000000", fg: "#ffffff", abbr: "AI"  },
  { name: "Hugging Face", category: "IA / ML",        color: "#FFD21E", fg: "#000000", abbr: "HF"  },
  { name: "Anthropic",    category: "IA / ML",        color: "#CC785C", fg: "#ffffff", abbr: "An"  },
  { name: "MediaPipe",    category: "IA / ML",        color: "#0097A7", fg: "#ffffff", abbr: "MP"  },

  // ── CMS & Conteúdo ───────────────────────────────────────
  { name: "Sanity",       category: "CMS",            color: "#F03E2F", fg: "#ffffff", abbr: "Sa"  },
  { name: "Contentful",   category: "CMS",            color: "#2478CC", fg: "#ffffff", abbr: "Co"  },
  { name: "Strapi",       category: "CMS",            color: "#4945FF", fg: "#ffffff", abbr: "St"  },
  { name: "Payload CMS",  category: "CMS",            color: "#000000", fg: "#ffffff", abbr: "Pl"  },
]

/** Retorna a definição de uma stack pelo nome (case-insensitive + partial match) */
export function findStack(name: string): StackDef | undefined {
  const n = name.trim().toLowerCase()
  return (
    STACK_LIBRARY.find(s => s.name.toLowerCase() === n) ||
    STACK_LIBRARY.find(s => n.includes(s.name.toLowerCase()) || s.name.toLowerCase().includes(n))
  )
}

/** Retorna categorias únicas na ordem original */
export function getCategories(): string[] {
  const seen = new Set<string>()
  const cats: string[] = []
  for (const s of STACK_LIBRARY) {
    if (!seen.has(s.category)) { seen.add(s.category); cats.push(s.category) }
  }
  return cats
}

/* Textos da biblioteca em inglês (/en). Valem quando o case não tem uma nota própria para a tecnologia. */
const CATEGORY_EN: Record<string, string> = {
  Linguagem: 'Language',
  'Banco de Dados': 'Database',
  'Mídia / Email': 'Media / Email',
  'IA / ML': 'AI / ML',
  Pagamento: 'Payments',
}
const DESCRIPTION_EN: Record<string, string> = {
  'Next.js': 'High-performance framework with URLs that Google can index (SEO), server-side rendering and near-instant load times.',
  React: 'Component-based architecture for a smooth, interactive user experience without page reloads.',
  TypeScript: 'Strict static typing that catches errors before they reach production and keeps the application stable.',
  Prisma: 'Fast, safe database access that prevents injection vulnerabilities and protects the integrity of business data.',
  'Node.js': 'Asynchronous, scalable back-end runtime that handles thousands of simultaneous requests without bottlenecks.',
  Vercel: 'Global edge cloud infrastructure, so the site loads in milliseconds wherever the visitor is.',
  'Tailwind CSS': 'A custom-built design system: a distinctive look, a consistent interface and small files for speed.',
  'Framer Motion': 'Micro-interaction engine that adds fluid, polished motion to every user interaction.',
}

/* Os mesmos textos em espanhol (/es). */
const CATEGORY_ES: Record<string, string> = {
  Linguagem: 'Lenguaje',
  'Banco de Dados': 'Base de datos',
  'Mídia / Email': 'Medios / Correo',
  'IA / ML': 'IA / ML',
  Pagamento: 'Pagos',
}
const DESCRIPTION_ES: Record<string, string> = {
  'Next.js': 'Framework de alto rendimiento con URLs que Google puede indexar (SEO), renderizado en el servidor y cargas casi instantáneas.',
  React: 'Arquitectura de componentes para una experiencia de usuario fluida e interactiva, sin recargar la página.',
  TypeScript: 'Tipado estático estricto que detecta errores antes de que lleguen a producción y mantiene estable la aplicación.',
  Prisma: 'Acceso rápido y seguro a la base de datos, que evita vulnerabilidades de inyección y protege la integridad de los datos del negocio.',
  'Node.js': 'Entorno de back-end asíncrono y escalable, capaz de atender miles de accesos simultáneos sin cuellos de botella.',
  Vercel: 'Infraestructura en la nube global, en el edge: el sitio carga en milisegundos esté donde esté el visitante.',
  'Tailwind CSS': 'Un design system a medida: identidad visual propia, una interfaz coherente y archivos livianos para ganar velocidad.',
  'Framer Motion': 'Motor de microinteracciones que agrega movimiento fluido y cuidado a cada interacción del usuario.',
}

const STACK_TEXTS: Record<string, { category: Record<string, string>; description: Record<string, string> }> = {
  en: { category: CATEGORY_EN, description: DESCRIPTION_EN },
  es: { category: CATEGORY_ES, description: DESCRIPTION_ES },
}

/** Frase padrão da tecnologia no idioma: a descrição ou, sem ela, a categoria. */
export function stackSummary(def: StackDef | undefined, locale: string): string {
  if (!def) return ''
  const texts = STACK_TEXTS[locale]
  if (!texts) return def.description || def.category
  return texts.description[def.name] || texts.category[def.category] || def.category
}

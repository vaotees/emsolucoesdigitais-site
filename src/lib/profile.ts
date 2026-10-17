import type { Locale } from '@/lib/i18n'

/* Dados pessoais do Estevão usados no portfólio (/cases) e no SEO (schema Person).
   Os mesmos do currículo dele, que não fica disponível para download no site (pedido do Estevão). */
export const PROFILE = {
  name: 'Estevão Marques',
  role: 'Design Engineer',
  // Mesma linha do LinkedIn: o cargo (role) vem antes, em destaque
  focus: 'Senior Software Engineer | Front-end React · React Native · Node.js · Next.js · TypeScript | UX/UI e Design Systems | Claude · Codex | Do Figma ao deploy',
  pitch: 'Desenho e construo produtos digitais, do Figma ao deploy.',
  bio: 'Fundador da EM Soluções Digitais. Desenho as interfaces no Figma e entrego em produção com React, Next.js e TypeScript, incluindo design system, painel, banco de dados e deploy.',
  availability: 'Disponível para projetos e vagas',
  location: 'Em Brasília, para trabalho remoto, híbrido ou presencial. Disponível para mudar de estado ou de país.',
  yearsInTech: 26,
  photo: '/estevao/estevao-marques.webp',
  // Mesmo e-mail do rodapé do site
  email: 'estevao.marques@gmail.com',
  linkedin: 'https://www.linkedin.com/in/estevaomarquesux/',
  github: 'https://github.com/vaotees',
} as const

/** Os mesmos dados em inglês (/en). Fatos: 26 anos em tecnologia, estúdio próprio desde dez/2015, em Brasília. */
const PROFILE_EN: Partial<Record<keyof typeof PROFILE, string>> = {
  focus: 'Senior Software Engineer | Front-end React · React Native · Node.js · Next.js · TypeScript | UX/UI & Design Systems | Claude · Codex | From Figma to deploy',
  pitch: 'I design and build digital products, from Figma to deploy.',
  bio: 'Founder of EM Soluções Digitais. I design interfaces in Figma and ship them to production with React, Next.js and TypeScript, including the design system, admin panel, database and deployment.',
  availability: 'Open to projects and roles',
  location: 'Based in Brasília, Brazil. Open to remote, hybrid or on-site work, and to relocating to another state or country.',
}

/** Os mesmos dados em espanhol (/es). */
const PROFILE_ES: Partial<Record<keyof typeof PROFILE, string>> = {
  focus: 'Senior Software Engineer | Front-end React · React Native · Node.js · Next.js · TypeScript | UX/UI y Design Systems | Claude · Codex | De Figma al deploy',
  pitch: 'Diseño y construyo productos digitales, de Figma al deploy.',
  bio: 'Fundador de EM Soluções Digitais. Diseño las interfaces en Figma y las llevo a producción con React, Next.js y TypeScript, incluidos el design system, el panel, la base de datos y el deploy.',
  availability: 'Disponible para proyectos y puestos',
  location: 'En Brasilia, Brasil. Disponible para trabajo remoto, híbrido o presencial, y para mudarme a otro estado o país.',
}

const PROFILES: Partial<Record<Locale, Partial<Record<keyof typeof PROFILE, string>>>> = { en: PROFILE_EN, es: PROFILE_ES }

export const profileFor = (locale: Locale): typeof PROFILE => ({ ...PROFILE, ...PROFILES[locale] }) as typeof PROFILE

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  // Upsert the CEJB project (safe to run multiple times)
  const project = await prisma.clientProject.upsert({
    where: { slug: 'cejb' },
    update: {},
    create: {
      slug: 'cejb',
      order: 3,
      category: 'Institucional',
      clientName: 'Condomínio Estância Jardim Botânico',
      tagline: 'Presença Digital para o Condomínio Mais Completo do Jardim Botânico',
      description:
        'Site institucional one-page com fotografia aérea profissional e identidade verde, comunicando segurança, sustentabilidade e qualidade de vida para 488 famílias em Brasília-DF.',
      role: 'Senior Design Engineer (UI/UX, Front-end & Estratégia Digital)',
      status: 'Em Produção',
      year: '2024',
      liveUrl: 'https://cejbonline.com.br',
      caseUrl: '/cases/cejb',
      mockupHeroUrl: '/mockups/cejb-desktop.webp',
      mockupCardUrl: '/mockups/cejb-mobile.webp',
      stackTags: 'WordPress,Enfold Theme,PHP,MySQL,Google Maps API,JavaScript',
      challengeText:
        'O CEJB, um dos primeiros e mais tradicionais condomínios do Jardim Botânico — com 488 unidades e quase 40 anos de história — precisava de uma presença digital à altura do seu padrão. Era necessário comunicar um estilo de vida único (seguro, sustentável e repleto de lazer) em uma experiência web moderna, sem perder a essência institucional e o calor humano da comunidade.',
      solutionText:
        'Desenvolvemos um site institucional One-Page com design imersivo, utilizando fotografia e vídeo aéreo profissional como protagonistas. A arquitetura de informação foi estruturada para guiar o visitante pelos pilares do condomínio: segurança (videomonitoramento 24h, 3 portarias), sustentabilidade (4 usinas solares — 27.000 kWh/mês) e qualidade de vida (lazer completo, escola de futebol, salão de festas). CMS WordPress para autonomia total do cliente.',
      impactText:
        'Site institucional que serve como vitrine digital para moradores, futuros condôminos e empresas parceiras, consolidando a imagem do CEJB como referência em moradia de alto padrão no Jardim Botânico de Brasília. Formulário unificado para contato e parcerias, com mapa interativo e galeria de 27+ fotos profissionais.',
      brandGuidelinesUrl: '',
      logoUrl: '',
      logoDownloadUrl: 'https://cejbonline.com.br',
      brandColors: JSON.stringify([
        { name: 'Verde Primário', hex: '#2E7D32', fg: '#ffffff' },
        { name: 'Verde Médio',   hex: '#4CAF50', fg: '#ffffff' },
        { name: 'Verde Claro',   hex: '#A5D6A7', fg: '#000000' },
        { name: 'Dourado',       hex: '#C8A84B', fg: '#000000' },
        { name: 'Branco Suave',  hex: '#F5F5F0', fg: '#000000' },
        { name: 'Cinza Escuro',  hex: '#2C2C2C', fg: '#ffffff' },
      ]),
      brandFontHeading: 'Playfair Display',
      brandFontBody: 'Open Sans',
      published: true,
    },
  })

  console.log(`✅ Projeto CEJB criado/atualizado: ${project.id}`)

  // Remove existing highlights before re-creating
  await prisma.clientProjectHighlight.deleteMany({ where: { projectId: project.id } })

  // Seed highlights
  const highlights = [
    {
      iconName: 'Leaf',
      title: 'Design Imersivo com Identidade Verde',
      body: 'Paleta e hierarquia visual inspiradas na natureza e na localização privilegiada — próxima ao Jardim Botânico de Brasília. Fotografia aérea profissional (drone) como protagonista absoluto da experiência do usuário.',
      order: 1,
    },
    {
      iconName: 'Sun',
      title: 'Sustentabilidade em Destaque',
      body: 'Seção dedicada às 4 usinas de energia solar (27.000 kWh/mês instaladas em 2023), posicionando o CEJB como referência ambiental e gerando economia direta nas contas das áreas comuns.',
      order: 2,
    },
    {
      iconName: 'ShieldCheck',
      title: 'Comunicação de Segurança',
      body: 'Seção estruturada para transmitir confiança institucional: videomonitoramento 24h nas áreas comuns, controle de acesso com cancelas e catracas em 3 portarias, e equipe treinada continuamente.',
      order: 3,
    },
    {
      iconName: 'Target',
      title: 'Estratégia One-Page de Alto Impacto',
      body: 'Arquitetura de UX de página única com smooth scroll, galeria de lazer com 27+ fotos profissionais, seção de correspondência e formulário unificado de contato para moradores e empresas parceiras.',
      order: 4,
    },
  ]

  for (const h of highlights) {
    await prisma.clientProjectHighlight.create({
      data: { projectId: project.id, ...h },
    })
  }

  console.log(`✅ ${highlights.length} highlights criados para o CEJB`)
  console.log('🌿 Seed do CEJB concluído com sucesso!')
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

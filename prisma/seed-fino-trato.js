const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  // Upsert Fino Trato project
  const project = await prisma.clientProject.upsert({
    where: { slug: 'fino-trato' },
    update: {
      published: true,
    },
    create: {
      slug: 'fino-trato',
      clientName: 'Fino Trato',
      tagline: 'Landing Page & Brand System Completo',
      category: 'Higienização Profissional',
      description:
        'Landing page de alta conversão com brand system completo para empresa de higienização profissional de estofados em Brasília. Design premium, SEO local e CTA direto ao WhatsApp.',
      role: 'Design Engineer (UI/UX & Front-end)',
      status: 'Em Produção',
      year: '2025',
      liveUrl: 'https://finotrato-higienizacao.vercel.app/',
      caseUrl: '/cases/fino-trato',
      brandGuidelinesUrl: 'https://finotrato-higienizacao.vercel.app/brand-guidelines.html',
      stackTags: 'HTML5,CSS3,JavaScript,Vercel,Google Fonts',
      mockupCardUrl: null,
      published: true,
      order: 2,
      brandFontHeading: 'Playfair Display',
      brandFontBody: 'Inter',
      brandColors: JSON.stringify([
        { name: 'Azul Royal', hex: '#1565C0', fg: '#ffffff' },
        { name: 'Azul Escuro', hex: '#0D47A1', fg: '#ffffff' },
        { name: 'Roxo', hex: '#7B1FA2', fg: '#ffffff' },
        { name: 'Azul Claro', hex: '#4FACF0', fg: '#000000' },
        { name: 'Âmbar', hex: '#FFC107', fg: '#000000' },
        { name: 'Dark Deep', hex: '#1A0A2E', fg: '#ffffff' },
        { name: 'Off White', hex: '#F5F5F5', fg: '#000000' },
      ]),
      highlights: {
        create: [
          {
            iconName: 'BookOpen',
            title: 'Brand System do Zero',
            body: 'Design system completo com tokens, tipografia e componentes documentados.',
            order: 1,
          },
          {
            iconName: 'MessageSquare',
            title: 'Conversão via WhatsApp',
            body: 'CTA com link direto e mensagem pré-formatada para máxima conversão.',
            order: 2,
          },
          {
            iconName: 'Globe',
            title: 'SEO Local Otimizado',
            body: 'Meta tags e estrutura semântica para captura orgânica em Brasília.',
            order: 3,
          },
          {
            iconName: 'Star',
            title: 'Brand Guidelines Documentadas',
            body: 'Documento interativo com paleta, tipografia, logo e Do\'s & Don\'ts.',
            order: 4,
          },
        ],
      },
    },
    include: { highlights: true },
  })

  console.log('✅ Fino Trato inserido com sucesso:', project.slug)
  console.log('   Highlights:', project.highlights.length)
}

main()
  .catch((e) => {
    console.error('❌ Erro:', e.message)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

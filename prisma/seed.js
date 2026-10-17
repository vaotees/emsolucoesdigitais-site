const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  await prisma.feature.createMany({
    data: [
      {
        title: 'Websites de Alta Performance',
        description: 'O seu negócio merece mais do que um simples cartão de visita digital. Desenvolvemos websites com design premium, navegação intuitiva e arquitetura focada na conversão. Estruturas robustas, otimizadas para velocidade e desenhadas para transmitir autoridade imediata a quem acede ao seu ecrã. Transforme visitantes em clientes com uma presença digital de elite.',
        icon: 'Globe'
      },
      {
        title: 'Design Gráfico & Posicionamento',
        description: 'A primeira impressão dita o valor do seu serviço. Criamos materiais gráficos que comunicam confiança, sofisticação e profissionalismo. Desde criativos de alta conversão para as suas campanhas até à identidade visual que acompanha a sua marca, o nosso design é a engenharia invisível que eleva a perceção de valor da sua empresa no mercado.',
        icon: 'Palette'
      },
      {
        title: 'Automatização de Atendimento com IA (WhatsApp)',
        description: 'Não perca mais negócios por demorar a responder. Implementamos assistentes de Inteligência Artificial no seu telemóvel corporativo, capazes de atender, qualificar leads e conduzir negociações 24 horas por dia, 7 dias por semana. Um atendimento fluido, inteligente e focado em vendas, garantindo que o seu funil de captação nunca pare de funcionar.',
        icon: 'Zap'
      },
      {
        title: 'Tráfego Pago (Google Ads & Redes Sociais)',
        description: 'O melhor design do mundo precisa de ser visto pelas pessoas certas. Gerimos as suas campanhas de anúncios no Google, Instagram e Facebook com precisão cirúrgica. Analisamos métricas e otimizamos o seu orçamento para colocar a sua oferta de alto valor diretamente à frente de quem já está pronto para fechar negócio.',
        icon: 'Target'
      },
      {
        title: 'Landing Pages de Alta Conversão',
        description: 'Páginas de vendas desenhadas milimetricamente para um único objetivo: transformar o seu tráfego em lucro. Aplicamos engenharia de conversão, copywriting persuasivo e um design de interface (UI) premium para que a sua oferta seja percebida com o mais alto valor de mercado. Uma estrutura veloz e sofisticada, ideal para lançamentos, infoprodutos e captação de clientes que não hesitam em comprar.',
        icon: 'Code2'
      },
      {
        title: 'Gestão de Redes Sociais Premium',
        description: 'Transformamos o seu Instagram de uma vitrine passiva em uma máquina ativa de prospecção e autoridade. Unimos design gráfico de elite à estratégia de conteúdo intencional. Não fazemos apenas \'postagens\'; construímos uma narrativa visual e textual que retém a atenção, gera desejo e conduz o seu seguidor pelo caminho da confiança até a assinatura de um novo contrato.',
        icon: 'Share2'
      }
    ]
  })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

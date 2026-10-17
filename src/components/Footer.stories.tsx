import type { Meta, StoryObj } from '@storybook/react';
import Footer from './Footer';

const meta = {
  title: 'Design System/Footer',
  component: Footer,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    ctaPrefix: 'Vamos construir sua ',
    ctaHighlight: 'Autoridade Digital',
    ctaSubtitle: 'Fale com um especialista e descubra como podemos transformar sua presença digital.',
    copyrightText: '© 2026 EM Soluções Digitais. Todos os direitos reservados.',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Footer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

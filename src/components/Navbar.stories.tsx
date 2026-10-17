import type { Meta, StoryObj } from '@storybook/react';
import Navbar from './Navbar';

const meta = {
  title: 'Design System/Navbar',
  component: Navbar,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    ctaText: 'Iniciar Projeto',
    links: [
      { href: '#services', label: 'Serviços' },
      { href: '#testimonials', label: 'Cases' },
      { href: '#contact', label: 'Contato' },
    ],
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Navbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

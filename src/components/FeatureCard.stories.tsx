import type { Meta, StoryObj } from '@storybook/react';
import { FeatureCard } from './FeatureCard';
import { Code2, Palette, Globe, Smartphone, Megaphone } from 'lucide-react';

const iconMapping = {
  Code2: Code2,
  Palette: Palette,
  Globe: Globe,
  Smartphone: Smartphone,
  Megaphone: Megaphone,
};

const meta = {
  title: 'Design System/FeatureCard',
  component: FeatureCard,
  parameters: {
    layout: 'centered',
  },
  args: {
    title: 'Desenvolvimento Web',
    description: 'Sites e aplicações de alta performance, com design impecável e experiência de usuário.',
    icon: 'Code2' as any,
    highlight: false,
  },
  argTypes: {
    title: { control: 'text' },
    description: { control: 'text' },
    highlight: { control: 'boolean' },
    icon: {
      options: Object.keys(iconMapping),
      mapping: iconMapping,
      control: { type: 'select' },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof FeatureCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Highlighted: Story = {
  args: {
    title: 'Branding Estratégico',
    description: 'Identidade visual que comunica autoridade, gera reconhecimento imediato.',
    icon: 'Palette' as any,
    highlight: true,
  },
};

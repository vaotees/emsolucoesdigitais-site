import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';
import { ArrowRight, Play, Check, X, Bell } from 'lucide-react';

const iconMapping = {
  None: undefined,
  ArrowRight: ArrowRight,
  Play: Play,
  Check: Check,
  X: X,
  Bell: Bell,
};

const meta = {
  title: 'Design System/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'outline'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    children: { control: 'text' },
    icon: {
      options: Object.keys(iconMapping),
      mapping: iconMapping,
      control: {
        type: 'select',
        labels: {
          None: 'Sem ícone',
        },
      },
    },
  },
  args: {
    children: 'Iniciar Projeto',
    variant: 'primary',
    size: 'md',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    icon: 'ArrowRight' as any,
  },
};

export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'Ver nossos casos',
    icon: 'Play' as any,
  },
};

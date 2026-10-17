import type { Meta, StoryObj } from '@storybook/react';
import Logo from './Logo';

const meta = {
  title: 'Design System/Logo',
  component: Logo,
  parameters: {
    layout: 'centered',
  },
  args: {
    className: 'h-24 w-auto',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Logo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Large: Story = {
  args: {
    className: 'h-40 w-auto',
  },
};

export const Small: Story = {
  args: {
    className: 'h-10 w-auto',
  },
};

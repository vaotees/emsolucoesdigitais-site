import type { Meta, StoryObj } from '@storybook/react';
import Typography from './Typography';

const meta = {
  title: 'Design System/Typography',
  component: Typography,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Typography>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {};

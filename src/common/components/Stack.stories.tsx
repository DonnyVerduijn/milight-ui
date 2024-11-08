import type { Meta, StoryObj } from '@storybook/react';
import { ColorSchemeDecorator } from '.storybook/decorators/ColorSchemeDecorator';
import { RuntimeDecorator } from '.storybook/decorators/RuntimeDecorator';
import { ThemeDecorator } from '.storybook/decorators/ThemeDecorator';
import { AppRuntime } from 'modules/App/context';
import { Stack } from './Stack';

const meta: Meta<typeof Stack> = {
  component: Stack,
  decorators: [RuntimeDecorator(AppRuntime)],
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  title: 'Common/Stack',
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Default Stack',
  },
  decorators: [
    ColorSchemeDecorator,
    ThemeDecorator({ defaultColorScheme: 'light' }),
  ],
  globals: { backgrounds: { disabled: true } },
};

export const WithCustomStyle: Story = {
  args: {
    children: 'Stack with Custom Style',
    getStyle: () => ({ backgroundColor: 'lightgray', padding: '20px' }),
  },
  decorators: [
    ColorSchemeDecorator,
    ThemeDecorator({ defaultColorScheme: 'light' }),
  ],
  globals: { backgrounds: { disabled: true } },
};

export const WithRenderProp: Story = {
  args: {
    render: () => <div>Rendered Content</div>,
  },
  decorators: [
    ColorSchemeDecorator,
    ThemeDecorator({ defaultColorScheme: 'light' }),
  ],
  globals: { backgrounds: { disabled: true } },
};

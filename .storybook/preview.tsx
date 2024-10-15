import * as React from 'react';
import createCache from '@emotion/cache';
import type { Decorator, Preview } from '@storybook/react';
import { initialize, mswLoader } from 'msw-storybook-addon';
import { I18nextProvider } from 'react-i18next';
import { ThemeProvider } from 'common/providers/ThemeProvider';
import { prefix } from 'config/constants';
import { getEmotionCacheConfig } from 'config/emotion';
import { theme } from 'config/theme';
import { initializeI18N } from '../src/i18n';
import { ColorSchemeWrapper } from './components/ColorSchemeWrapper';
import '@mantine/core/styles.css';
import 'index.css';

const i18n = initializeI18N();
// Initialize MSW
initialize({ quiet: true });
const emotionCache = createCache(getEmotionCacheConfig(prefix));

const decorators: Decorator[] = [
  (render) => <ColorSchemeWrapper>{render()}</ColorSchemeWrapper>,
  (render) => (
    <ThemeProvider
      emotionCache={emotionCache}
      prefix={prefix}
      theme={theme}
    >
      {render()}
    </ThemeProvider>
  ),
  (render, context) => {
    const { locale } = context.globals as { locale: string };
    React.useEffect(() => {
      void i18n.changeLanguage(locale);
    }, [locale]);
    return <I18nextProvider i18n={i18n}>{render()}</I18nextProvider>;
  },
];

const preview: Preview = {
  decorators,
  globalTypes: {
    locale: {
      defaultValue: 'en',
      description: 'Internationalization locale',
      name: 'Locale',
      toolbar: {
        icon: 'globe',
        items: [
          { right: '🇺🇸', title: 'English', value: 'en' },
          { right: '🇳🇱', title: 'Dutch', value: 'nl' },
        ],
      },
    },
  },
  // initialGlobals: {
  //   backgrounds: {},
  // },
  loaders: [mswLoader],
  parameters: {
    backgrounds: {
      values: [
        { name: 'Dark', value: '#333' },
        { name: 'Light', value: '#F7F9F2' },
        { name: 'Hotpink', value: 'hotpink' },
      ],
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
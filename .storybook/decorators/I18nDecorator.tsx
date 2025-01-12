import * as React from 'react';
import type { Decorator } from '@storybook/react';
import type { i18n } from 'i18next';
import { I18nextProvider } from 'react-i18next';
import { initializeI18N } from 'i18n';

console.log('initI18N')
const i18n = initializeI18N();

export const I18nDecorator: Decorator = (Story, context) => {
  const { locale } = context.globals as { locale: string };
  // const [i18n] = React.useState<i18n>(initializeI18N);

  React.useEffect(() => {
    void i18n.changeLanguage(locale);
  }, [i18n, locale]);

  const Children = React.memo(Story);
  return (
    <I18nextProvider i18n={i18n}>
      <Children />
    </I18nextProvider>
  );
};

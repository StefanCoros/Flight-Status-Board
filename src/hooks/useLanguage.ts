import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  DEFAULT_LANGUAGE,
  LANGUAGE_STORAGE_KEY,
  SUPPORTED_LANGUAGES,
  type AppLanguage,
} from '../i18n';

const isAppLanguage = (value: unknown): value is AppLanguage =>
  typeof value === 'string' &&
  (SUPPORTED_LANGUAGES as readonly string[]).includes(value);

const readStoredLanguage = (): AppLanguage => {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE;
  try {
    const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return isAppLanguage(stored) ? stored : DEFAULT_LANGUAGE;
  } catch {
    return DEFAULT_LANGUAGE;
  }
};

export const useLanguage = (): readonly [
  AppLanguage,
  (next: AppLanguage) => void,
] => {
  const { i18n } = useTranslation();
  const [language, setLanguageState] = useState<AppLanguage>(() => {
    const current = i18n.language;
    return isAppLanguage(current) ? current : readStoredLanguage();
  });

  useEffect(() => {
    if (i18n.language !== language) {
      void i18n.changeLanguage(language);
    }
    document.documentElement.setAttribute('lang', language);
    try {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    } catch {
      // ignore storage errors
    }
  }, [i18n, language]);

  const setLanguage = useCallback((next: AppLanguage) => {
    setLanguageState(next);
  }, []);

  return [language, setLanguage];
};

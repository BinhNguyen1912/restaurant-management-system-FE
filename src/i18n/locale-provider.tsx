'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  DEFAULT_LOCALE,
  Locale,
  readLocaleCookie,
  writeLocaleCookie,
} from '@/i18n/locale';
import { format, getDictionary, Messages, translate } from '@/i18n/messages';

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({
  locale: initialLocale,
  messages,
  children,
}: {
  locale: Locale;
  messages: Messages;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [locale, setLocaleState] = useState<Locale>(() => initialLocale ?? DEFAULT_LOCALE);

  // Luôn lấy từ điển theo locale đang chọn. Trước đây ưu tiên prop `messages` (luôn có 503 key
  // tiếng Việt) nên bấm EN xong vẫn hiện tiếng Việt.
  const dictionary = useMemo(() => {
    if (locale === initialLocale && messages && Object.keys(messages).length) return messages;
    return getDictionary(locale);
  }, [initialLocale, messages, locale]);

  const setLocale = useCallback(
    (next: Locale) => {
      writeLocaleCookie(next);
      setLocaleState(next);
      // server component (layout, metadata) cần đọc lại cookie
      router.refresh();
    },
    [router],
  );

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => {
      // ưu tiên bộ từ điển của provider, thiếu thì tra theo locale hiện tại, cuối cùng trả key (tiếng Việt)
      const value = translate(dictionary, key) ?? translate(getDictionary(locale), key) ?? key;
      return format(value, vars);
    },
    [dictionary, locale],
  );

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

/** Dùng trong client component: `const { t, locale, setLocale } = useI18n()` */
export function useI18n() {
  const context = useContext(LocaleContext);
  if (!context) {
    // fallback để component dùng ngoài provider (test, storybook) không nổ
    const locale = readLocaleCookie();
    return {
      locale,
      setLocale: () => undefined,
      t: (key: string, vars?: Record<string, string | number>) => format(getDictionary(locale)[key] ?? key, vars),
    } satisfies LocaleContextValue;
  }
  return context;
}

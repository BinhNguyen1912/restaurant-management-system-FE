import { cookies } from 'next/headers';
import { DEFAULT_LOCALE, LOCALE_COOKIE, Locale, normalizeLocale } from '@/i18n/locale';
import { getDictionary, Messages } from '@/i18n/messages';

/** Server component / layout: đọc locale từ cookie rồi lấy bộ từ điển tương ứng */
export function getLocaleFromCookies(): Locale {
  const value = cookies().get(LOCALE_COOKIE)?.value;
  return value ? normalizeLocale(value) : DEFAULT_LOCALE;
}

export function getMessagesFor(locale: Locale): Messages {
  return getDictionary(locale);
}

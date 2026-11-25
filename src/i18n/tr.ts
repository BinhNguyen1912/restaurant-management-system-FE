import { DEFAULT_LOCALE, readLocaleCookie } from '@/i18n/locale';
import { format, getDictionary, translate } from '@/i18n/messages';

/**
 * `tr('câu tiếng Việt')` — dịch **không cần hook**, dùng được ở:
 *  - helper/column definition ngoài component (nơi không được gọi hook),
 *  - thuộc tính JSX (`placeholder={tr('...')}`),
 *  - component con nằm ngoài default export.
 *
 * Đọc cookie mỗi lần gọi nên khi đổi ngôn ngữ (router.refresh) là câu chữ đổi theo.
 * Trong component thì vẫn ưu tiên `useI18n()` để có thêm `setLocale`.
 */
export function tr(key: string, vars?: Record<string, string | number>): string {
  const locale = readLocaleCookie();
  const dictionary = getDictionary(locale);
  return format(translate(dictionary, key) ?? translate(getDictionary(DEFAULT_LOCALE), key) ?? key, vars);
}

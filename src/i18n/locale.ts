/**
 * Ngôn ngữ hiển thị: cookie `locale` (một nguồn duy nhất), mặc định `vi`.
 * KHÔNG đánh dấu 'use client': `lib/http.ts` (server route handler) và `i18n/server.ts`
 * (server component) cũng import module này — thêm 'use client' sẽ biến các export thành
 * client reference và gọi từ server sẽ nổ "is not a function" (đã xảy ra với /api/auth/login).
 * Đổi ngôn ngữ = ghi cookie + `router.refresh()`; không đụng token, không mất giỏ hàng.
 */
export const SUPPORTED_LOCALES = ['vi', 'en'] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'vi';
export const LOCALE_COOKIE = 'locale';

export function normalizeLocale(raw: unknown): Locale {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (typeof value !== 'string') return DEFAULT_LOCALE;
  const base = value.trim().toLowerCase().replace('_', '-').split('-')[0];
  return (SUPPORTED_LOCALES as readonly string[]).includes(base) ? (base as Locale) : DEFAULT_LOCALE;
}

/** Đọc cookie trên client (provider dùng; server component dùng `getLocaleFromCookies`) */
export function readLocaleCookie(): Locale {
  if (typeof document === 'undefined') return DEFAULT_LOCALE;
  const match = document.cookie.split('; ').find((item) => item.startsWith(`${LOCALE_COOKIE}=`));
  return normalizeLocale(match?.split('=')[1]);
}

export function writeLocaleCookie(locale: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
}

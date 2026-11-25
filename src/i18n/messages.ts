import vi from '../../messages/vi.json';
import en from '../../messages/en.json';
import { Locale } from '@/i18n/locale';

/**
 * Key của từ điển **chính là câu tiếng Việt** (flat, không lồng nhau).
 * Lý do: câu tiếng Việt đã tồn tại trong code, dùng làm key thì codemod không phải
 * đặt tên 551 key, không sợ trùng, và thiếu bản dịch thì tự rơi về tiếng Việt.
 * `messages/vi.json` giữ nguyên câu gốc (để đối chiếu), `messages/en.json` là bản dịch.
 */
export type Messages = Record<string, string>;

const dictionaries: Record<Locale, Messages> = {
  vi: vi as Messages,
  en: en as Messages,
};

export const getDictionary = (locale: Locale): Messages => dictionaries[locale] ?? dictionaries.vi;

/** thay `{ten}` bằng giá trị — đủ cho số nhiều đơn giản, không cần thư viện ICU */
/** bản dịch rỗng = chưa dịch -> coi như thiếu, rơi về tiếng Việt thay vì hiện ô trống */
export function translate(dictionary: Messages, key: string): string | undefined {
  const value = dictionary[key];
  return typeof value === 'string' && value.trim() ? value : undefined;
}

export function format(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, key) =>
    Object.prototype.hasOwnProperty.call(vars, key) ? String(vars[key]) : match,
  );
}

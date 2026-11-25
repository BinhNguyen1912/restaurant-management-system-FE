import { Locale, readLocaleCookie } from '@/i18n/locale';
import { getDictionary, translate } from '@/i18n/messages';

/**
 * BE trả `message` là KEY (`Error.InvalidEmail`), không phải câu để hiển thị — nhờ vậy cùng một
 * lỗi dịch được sang mọi ngôn ngữ. Từ điển `messages/*.json` vì thế có thêm các key `Error.*`.
 *
 * Dịch ở đây (một chỗ, ngay khi tạo HttpError) thay vì sửa ~200 call site `error.payload.message`.
 * Key lạ -> trả `undefined` để nơi hiển thị dùng câu dự phòng, KHÔNG bao giờ hiện `Error.XxxYyy`.
 */
const MESSAGE_KEY = /^Error\.[A-Za-z0-9_]+$/;

/**
 * Route handler của Next (`/api/*`) chạy trên server: không có cookie nên đã dịch sang tiếng Việt
 * trước khi trả về client. Client (đang ở EN) nhận câu tiếng Việt đó -> tra ngược về key rồi dịch
 * tiếp, nếu không người dùng EN vẫn thấy tiếng Việt.
 */
const VI_TO_KEY = new Map<string, string>(
  Object.entries(getDictionary('vi'))
    .filter(([key, value]) => isApiMessageKey(key) && typeof value === 'string')
    .map(([key, value]) => [value as string, key]),
);

export function isApiMessageKey(message: unknown): message is string {
  return typeof message === 'string' && MESSAGE_KEY.test(message);
}

export function translateApiMessage(message: unknown, locale: Locale): string | undefined {
  if (typeof message !== 'string' || !message.trim()) return undefined;
  const dictionary = getDictionary(locale);
  // key `Error.*` hoặc câu tiếng Việt đã có trong từ điển (message zod của BE) -> dịch được
  const translated = translate(dictionary, message);
  if (translated) return translated;
  // key lạ: hiện câu dự phòng còn hơn hiện `Error.XxxYyy` cho người dùng
  if (isApiMessageKey(message)) return undefined;
  // câu đã được dịch sẵn ở server (vd route handler Next) -> tra ngược key để dịch sang locale này
  const key = VI_TO_KEY.get(message);
  if (key) {
    const fromKey = translate(dictionary, key);
    if (fromKey) return fromKey;
  }
  return message;
}

/** Dùng ở client (đọc cookie); server component/route handler dùng `translateApiMessage(msg, locale)` */
export const translateApiMessageForCurrentLocale = (message: unknown): string | undefined =>
  translateApiMessage(message, readLocaleCookie());

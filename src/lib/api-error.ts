import { translateApiMessageForCurrentLocale } from '@/i18n/api-messages';
/**
 * Lấy thông điệp lỗi hiển thị được cho người dùng từ lỗi API.
 *
 * BE trả 400 (validation của nestjs-zod) dạng `{ message: 'Validation failed', errors: [{ path, message }] }`
 * và 422 dạng `{ message, errors: [{ path, message }] }`; `HttpError.payload` giữ nguyên body đó.
 * Trước đây các form chỉ hiện "Có lỗi xảy ra" nên người dùng không biết sai trường nào.
 */
export function getApiErrorMessage(
  error: unknown,
  fallback = 'Có lỗi xảy ra, vui lòng thử lại',
): string {
  const err = error as { payload?: any; message?: string } | undefined;
  const payload = err?.payload;

  if (payload && Array.isArray(payload.errors) && payload.errors.length > 0) {
    const messages = payload.errors
      .map((item: { message?: string }) => item?.message)
      .filter((message: string | undefined): message is string =>
        Boolean(message),
      );
    if (messages.length > 0) {
      const translated = messages.map(
        (item: string) => translateApiMessageForCurrentLocale(item) ?? item,
      );
      return Array.from(new Set<string>(translated)).join(' • ');
    }
  }

  // lỗi có thể do nơi khác tạo (không qua `http.ts`) nên dịch lại lần nữa; hàm này idempotent
  const message = translateApiMessageForCurrentLocale(payload?.message);
  if (message) return message;

  const own = translateApiMessageForCurrentLocale(err?.message);
  if (own) return own;
  return fallback;
}

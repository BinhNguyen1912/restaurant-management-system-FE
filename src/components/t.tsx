'use client';

import { useI18n } from '@/i18n/locale-provider';

/**
 * Dịch một câu trong JSX mà **không cần hook**: dùng được cả trong server component.
 * `<T>Danh sách đơn</T>` -> lấy câu làm key, tra từ điển theo locale hiện tại.
 * Dùng cho file không chèn được `const { t } = useI18n()` (component con, hàm ngoài).
 */
export function T({ children }: { children: string }) {
  const { t } = useI18n();
  return <>{t(children)}</>;
}

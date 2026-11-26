'use client';

import { useI18n } from '@/i18n/locale-provider';
import { SUPPORTED_LOCALES, Locale } from '@/i18n/locale';

const LABELS: Record<Locale, string> = { vi: 'VI', en: 'EN' };
const TITLES: Record<Locale, string> = { vi: 'Tiếng Việt', en: 'English' };

/**
 * Chuyển ngôn ngữ: một công tắc trượt (VI | EN) thay cho 2 nút rời.
 * Con trượt là 1 phần tử `absolute` dịch bằng `translate-x`, nên chuyển ngôn ngữ có animation
 * và người dùng thấy ngay "đang ở ngôn ngữ nào". Chỉ ghi cookie, không reload token, không mất giỏ hàng.
 */
export function LocaleSwitcher({ className }: { className?: string }) {
  const { locale, setLocale } = useI18n();
  const activeIndex = Math.max(0, SUPPORTED_LOCALES.indexOf(locale));

  return (
    <div className={`flex items-center ${className ?? ''}`} data-testid="locale-switcher">
      <div
        role="group"
        aria-label="Ngôn ngữ / Language"
        // h-9 cho bằng các nút icon cạnh nó; nền mờ + blur để đọc được cả trên header trong suốt
        className="relative flex h-9 w-[76px] items-center rounded-full border bg-muted p-0.5"
      >
        {/* con trượt: 1 ô bằng đúng nửa chiều rộng, dịch sang phải khi chọn EN */}
        <span
          aria-hidden
          className="absolute inset-y-0.5 left-0.5 w-[calc(50%-2px)] rounded-full bg-primary shadow-sm transition-transform duration-300 ease-out"
          style={{ transform: `translateX(${activeIndex * 100}%)` }}
        />
        {SUPPORTED_LOCALES.map((item) => (
          <button
            key={item}
            type="button"
            title={TITLES[item]}
            aria-pressed={locale === item}
            onClick={() => setLocale(item)}
            className={`relative z-10 h-full flex-1 rounded-full text-[11px] font-semibold uppercase leading-none transition-colors duration-300 ${
              locale === item ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {LABELS[item]}
          </button>
        ))}
      </div>
    </div>
  );
}

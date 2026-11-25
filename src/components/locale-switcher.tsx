'use client';

import { useI18n } from '@/i18n/locale-provider';
import { SUPPORTED_LOCALES, Locale } from '@/i18n/locale';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';

const LABELS: Record<Locale, string> = { vi: 'VI', en: 'EN' };
const TITLES: Record<Locale, string> = { vi: 'Tiếng Việt', en: 'English' };

/** Chuyển ngôn ngữ: chỉ ghi cookie, không reload token, không mất giỏ hàng */
export function LocaleSwitcher({ className }: { className?: string }) {
  const { locale, setLocale } = useI18n();

  return (
    <div className={`flex items-center gap-1 ${className ?? ''}`} data-testid="locale-switcher">
      <Globe className="h-4 w-4 text-muted-foreground" />
      {SUPPORTED_LOCALES.map((item) => (
        <Button
          key={item}
          type="button"
          size="sm"
          variant={locale === item ? 'default' : 'ghost'}
          className="h-7 px-2 text-xs"
          title={TITLES[item]}
          aria-pressed={locale === item}
          onClick={() => setLocale(item)}
        >
          {LABELS[item]}
        </Button>
      ))}
    </div>
  );
}

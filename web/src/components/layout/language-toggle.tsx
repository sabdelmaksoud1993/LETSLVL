'use client';

import { useLocale } from '@/lib/locale-context';

export function LanguageToggle() {
  const { locale, setLocale } = useLocale();

  function handleToggle() {
    setLocale(locale === 'en' ? 'ar' : 'en');
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      className="inline-flex items-center gap-1.5 rounded-full bg-lvl-slate px-3 py-1 text-xs font-body text-lvl-smoke hover:text-lvl-white transition-colors"
      aria-label={locale === 'en' ? 'Switch to Arabic' : 'Switch to English'}
    >
      <span className={locale === 'en' ? 'text-lvl-white font-medium' : ''}>
        EN
      </span>
      <span className="text-lvl-smoke/50">|</span>
      <span className={locale === 'ar' ? 'text-lvl-white font-medium' : ''}>
        {'\u0639\u0631\u0628\u064A'}
      </span>
    </button>
  );
}

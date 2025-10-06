type Locale = 'en' | 'es' | 'zh'

interface TranslationKeys {
  [key: string]: string | TranslationKeys
}

export type { Locale, TranslationKeys }

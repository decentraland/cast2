import { ReactNode, createContext, useContext, useState } from 'react'
import * as locales from './locales'
import { Locale, TranslationKeys } from './types'

interface TranslationContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string, values?: Record<string, string>) => string
}

const TranslationContext = createContext<TranslationContextValue | undefined>(undefined)

function TranslationProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>('en')

  const t = (key: string, values?: Record<string, string>): string => {
    const keys = key.split('.')
    let translation: string | TranslationKeys = (locales as Record<Locale, TranslationKeys>)[locale]

    for (const k of keys) {
      if (typeof translation === 'object' && k in translation) {
        translation = translation[k]
      } else {
        return key // Return key if translation not found
      }
    }

    let result = typeof translation === 'string' ? translation : key

    // Replace placeholders like {name} with values
    if (values) {
      Object.entries(values).forEach(([placeholder, value]) => {
        result = result.replace(new RegExp(`\\{${placeholder}\\}`, 'g'), value)
      })
    }

    return result
  }

  return <TranslationContext.Provider value={{ locale, setLocale, t }}>{children}</TranslationContext.Provider>
}

function useTranslation() {
  const context = useContext(TranslationContext)
  if (!context) {
    throw new Error('useTranslation must be used within TranslationProvider')
  }
  return context
}

// Export a standalone t function for use outside React components
let globalT: ((key: string, values?: Record<string, string>) => string) | null = null

function setGlobalT(tFunc: (key: string, values?: Record<string, string>) => string) {
  globalT = tFunc
}

function t(key: string, values?: Record<string, string>): string {
  if (globalT) {
    return globalT(key, values)
  }
  return key
}

export { TranslationProvider, setGlobalT, t, useTranslation }

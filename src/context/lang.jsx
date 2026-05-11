import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const LangContext = createContext({ lang: 'ar', setLang: () => {} })

export function LangProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('hisn_lang') || 'ar')

  useEffect(() => {
    localStorage.setItem('hisn_lang', lang)
    document.documentElement.setAttribute('lang', lang)
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr')
  }, [lang])

  const value = useMemo(() => ({ lang, setLang }), [lang])

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>
}

export function useLang() {
  return useContext(LangContext)
}

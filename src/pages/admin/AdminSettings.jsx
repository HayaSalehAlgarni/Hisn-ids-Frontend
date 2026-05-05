import { useEffect, useState } from 'react'
import { useOutletContext, useNavigate } from 'react-router-dom'
import { useLang } from '../../context/lang'
import { patchJsonAuth } from '../../api/client'
import s from './adminShared.module.css'

export default function AdminSettings() {
  const { lang, setLang } = useLang()
  const navigate = useNavigate()
  const { me, setMe } = useOutletContext() || {}
  const [name, setName] = useState(me?.name || '')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setName(me?.name || '')
  }, [me])

  const copy = {
    title: { ar: 'الإعدادات', en: 'Settings' },
    accountTitle: { ar: 'معلومات الحساب', en: 'Account' },
    hint: {
      ar: 'حدّث اسم العرض أو كلمة المرور لحسابك في لوحة الإدارة.',
      en: 'Update your display name or password for this admin account.',
    },
    nameHint: {
      ar: 'هذا الاسم سيظهر في لوحة الإدارة',
      en: 'This name is shown across the admin panel.',
    },
    langTitle: { ar: 'اللغة', en: 'Language' },
    ar: { ar: 'العربية', en: 'Arabic' },
    en: { ar: 'English', en: 'English' },
    name: { ar: 'الاسم', en: 'Name' },
    email: { ar: 'البريد الإلكتروني', en: 'Email' },
    password: { ar: 'كلمة مرور جديدة (اختياري)', en: 'New password (optional)' },
    save: { ar: 'حفظ', en: 'Save' },
    logout: { ar: 'تسجيل خروج', en: 'Logout' },
    ok: { ar: 'تم الحفظ', en: 'Saved' },
    short: { ar: '8 أحرف على الأقل', en: 'At least 8 characters' },
  }

  const submit = async (e) => {
    e.preventDefault()
    setErr('')
    setMsg('')
    if (password && password.length < 8) {
      setErr(copy.short[lang])
      return
    }
    setLoading(true)
    try {
      const body = {}
      if (name.trim() !== (me?.name || '')) body.name = name.trim()
      if (password) body.new_password = password
      if (Object.keys(body).length === 0) {
        setMsg(lang === 'ar' ? 'لا تغييرات' : 'No changes')
        setLoading(false)
        return
      }
      const data = await patchJsonAuth('/api/admin/profile', body)
      if (data.user && setMe) setMe(data.user)
      setPassword('')
      setMsg(copy.ok[lang])
    } catch (e) {
      setErr(lang === 'ar' ? 'فشل الحفظ' : 'Save failed')
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('hisn_token')
    localStorage.removeItem('hisn_user')
    navigate('/admin/login', { replace: true })
  }

  return (
    <div>
      <h1 className={s.pageTitle}>{copy.title[lang]}</h1>

      <h2 className={s.sectionHeading}>{copy.accountTitle[lang]}</h2>
      <p className={s.muted} style={{ marginBottom: '1rem' }}>
        {copy.hint[lang]}
      </p>
      <div className={s.card} style={{ maxWidth: 440 }}>
        {err && <p className={s.error}>{err}</p>}
        {msg && <p className={s.success}>{msg}</p>}
        <form className={s.formGrid} onSubmit={submit}>
          <div className={s.field}>
            <label htmlFor="settings-name">{copy.name[lang]}</label>
            <div className={s.inputWithIcon}>
              <span className={s.inputIcon} aria-hidden>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </span>
              <input
                id="settings-name"
                className={s.nameInput}
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
            </div>
            <p className={s.fieldHint}>{copy.nameHint[lang]}</p>
          </div>
          <div className={s.field}>
            <label htmlFor="settings-email-ro">{copy.email[lang]}</label>
            <div id="settings-email-ro" className={s.readOnlyEmail} aria-readonly="true">
              {me?.email || '—'}
            </div>
          </div>
          <div className={s.field}>
            <label>{copy.password[lang]}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>
          <button type="submit" className={s.btn} disabled={loading}>
            {copy.save[lang]}
          </button>
        </form>
        <button
          type="button"
          className={`${s.btn} ${s.btnGhost}`}
          style={{ marginTop: '1rem' }}
          onClick={logout}
        >
          {copy.logout[lang]}
        </button>
      </div>

      <h2 className={s.sectionHeading} style={{ marginTop: '1.75rem' }}>
        {copy.langTitle[lang]}
      </h2>
      <div className={s.card} style={{ maxWidth: 480 }}>
        <div className={s.toolbar}>
          <button
            type="button"
            className={`${s.chartToggle} ${lang === 'ar' ? s.chartToggleActive : ''}`}
            onClick={() => setLang('ar')}
          >
            {copy.ar[lang]}
          </button>
          <button
            type="button"
            className={`${s.chartToggle} ${lang === 'en' ? s.chartToggleActive : ''}`}
            onClick={() => setLang('en')}
          >
            {copy.en[lang]}
          </button>
        </div>
      </div>
    </div>
  )
}

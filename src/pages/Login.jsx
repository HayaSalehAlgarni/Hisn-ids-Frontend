import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import styles from '../components/AuthForm.module.css'
import { useLang } from '../context/lang'
import { postJson, API_BASE_URL } from '../api/client'
import { loginErrorMessage } from '../api/loginErrors'

export default function Login() {
  const navigate = useNavigate()
  const { lang } = useLang()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const t = {
    email:    { ar: 'البريد الإلكتروني', en: 'Email' },
    password: { ar: 'كلمة المرور',       en: 'Password' },
    submit:   { ar: 'تسجيل الدخول',      en: 'Login' },
    loading:  { ar: 'جاري الدخول...',    en: 'Signing in...' },
    error:    { ar: 'يرجى إدخال البريد الإلكتروني وكلمة المرور',
                en: 'Please enter your email and password' },
    invalid:  { ar: 'بيانات الدخول غير صحيحة',
                en: 'Invalid email or password' },
    suspended: { ar: 'الحساب موقوف',
                en: 'Account is suspended' },
    failed:   { ar: 'تعذر تسجيل الدخول، حاول مرة أخرى',
                en: 'Login failed, please try again' },
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!email.trim() || !password) {
      setError(t.error[lang])
      return
    }
    setLoading(true)
    try {
      const data = await postJson('/api/auth/login', { email: email.trim(), password })
      const userEmail = data?.user?.email || email.trim()
      if (data?.token) localStorage.setItem('hisn_token', data.token)
      localStorage.setItem('hisn_user', JSON.stringify(data?.user || { email: userEmail }))
      navigate('/app', { replace: true })
    } catch (err) {
      const msg = String(err?.message || '')
      const mapped = loginErrorMessage(msg, lang)
      if (mapped) {
        setError(mapped)
      } else if (msg.includes('invalid_credentials')) {
        setError(t.invalid[lang])
      } else if (msg.includes('account_suspended')) {
        setError(t.suspended[lang])
      } else {
        setError(
          lang === 'ar'
            ? `${t.failed[lang]} (${msg}). الخادم: ${API_BASE_URL}`
            : `${t.failed[lang]} (${msg}). API: ${API_BASE_URL}`,
        )
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title="تسجيل الدخول" backTo="/">
      <form className={styles.form} onSubmit={handleSubmit}>
        {error && <p className={styles.error}>{error}</p>}
        <div className={styles.field}>
          <label className={styles.label} htmlFor="email">{t.email[lang]}</label>
          <input
            id="email"
            type="email"
            className={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@domain.com"
            autoComplete="email"
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="password">{t.password[lang]}</label>
          <input
            id="password"
            type="password"
            className={styles.input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
          />
        </div>
        <button type="submit" className={styles.submit} disabled={loading}>
          {loading ? t.loading[lang] : t.submit[lang]}
        </button>
      </form>
    </AuthLayout>
  )
}

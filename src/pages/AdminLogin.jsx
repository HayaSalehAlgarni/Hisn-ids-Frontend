import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import styles from '../components/AuthForm.module.css'
import { useLang } from '../context/lang'
import { postJson, API_BASE_URL } from '../api/client'
import { loginErrorMessage } from '../api/loginErrors'

export default function AdminLogin() {
  const navigate = useNavigate()
  const { lang } = useLang()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const t = {
    title: { ar: 'لوحة الإدارة', en: 'Administration' },
    email: { ar: 'البريد الإلكتروني', en: 'Email' },
    password: { ar: 'كلمة المرور', en: 'Password' },
    submit: { ar: 'دخول المدير', en: 'Admin sign in' },
    loading: { ar: 'جاري الدخول...', en: 'Signing in...' },
    need: { ar: 'يرجى إدخال البريد وكلمة المرور', en: 'Please enter email and password' },
    invalid: { ar: 'بيانات الدخول غير صحيحة', en: 'Invalid email or password' },
    forbidden: {
      ar: 'هذا الحساب ليس لديه صلاحية لوحة الإدارة',
      en: 'This account does not have admin access',
    },
    suspended: {
      ar: 'الحساب موقوف',
      en: 'Account is suspended',
    },
    failed: { ar: 'تعذر تسجيل الدخول', en: 'Login failed' },
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!email.trim() || !password) {
      setError(t.need[lang])
      return
    }
    setLoading(true)
    try {
      const data = await postJson('/api/auth/login', { email: email.trim(), password })
      const role = data?.user?.role
      if (role !== 'admin' && role !== 'super_admin') {
        setError(t.forbidden[lang])
        return
      }
      if (data?.token) localStorage.setItem('hisn_token', data.token)
      localStorage.setItem('hisn_user', JSON.stringify(data.user || { email: email.trim() }))
      navigate('/admin/app', { replace: true })
    } catch (err) {
      const msg = String(err?.message || '')
      const mapped = loginErrorMessage(msg, lang)
      if (mapped) setError(mapped)
      else if (msg.includes('invalid_credentials')) setError(t.invalid[lang])
      else if (msg.includes('account_suspended')) setError(t.suspended[lang])
      else
        setError(
          lang === 'ar'
            ? `${t.failed[lang]} — ${msg}. الخادم: ${API_BASE_URL}`
            : `${t.failed[lang]} — ${msg}. API: ${API_BASE_URL}`,
        )
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title={t.title[lang]}>
      <form className={styles.form} onSubmit={handleSubmit}>
        {error && <p className={styles.error}>{error}</p>}
        <div className={styles.field}>
          <label className={styles.label} htmlFor="admin-email">
            {t.email[lang]}
          </label>
          <input
            id="admin-email"
            type="email"
            className={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@domain.com"
            autoComplete="email"
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="admin-password">
            {t.password[lang]}
          </label>
          <input
            id="admin-password"
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

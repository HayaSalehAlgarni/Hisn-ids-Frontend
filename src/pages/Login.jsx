import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import styles from '../components/AuthForm.module.css'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    if (!email.trim() || !password) {
      setError('يرجى إدخال البريد الإلكتروني وكلمة المرور')
      return
    }
    localStorage.setItem('hisn_user', JSON.stringify({ email: email.trim() }))
    navigate('/', { replace: true })
  }

  return (
    <AuthLayout title="تسجيل الدخول">
      <form className={styles.form} onSubmit={handleSubmit}>
        {error && <p className={styles.error}>{error}</p>}
        <div className={styles.field}>
          <label className={styles.label} htmlFor="email">البريد الإلكتروني</label>
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
          <label className={styles.label} htmlFor="password">كلمة المرور</label>
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
        <button type="submit" className={styles.submit}>
          تسجيل الدخول
        </button>
        <p className={styles.footer}>
          ليس لديك حساب؟{' '}
          <Link to="/create-account">إنشاء حساب</Link>
        </p>
      </form>
    </AuthLayout>
  )
}

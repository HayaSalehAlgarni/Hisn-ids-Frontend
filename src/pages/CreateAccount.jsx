import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import styles from '../components/AuthForm.module.css'

export default function CreateAccount() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  })
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    const { firstName, lastName, email, password } = form
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password) {
      setError('يرجى تعبئة جميع الحقول')
      return
    }
    if (password.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل')
      return
    }
    localStorage.setItem('hisn_user', JSON.stringify({
      email: email.trim(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
    }))
    navigate('/', { replace: true })
  }

  return (
    <AuthLayout title="Create Account">
      <form className={styles.form} onSubmit={handleSubmit}>
        {error && <p className={styles.error}>{error}</p>}
        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="firstName">First Name</label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              className={styles.input}
              value={form.firstName}
              onChange={handleChange}
              placeholder="First Name"
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="lastName">Last Name</label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              className={styles.input}
              value={form.lastName}
              onChange={handleChange}
              placeholder="Last Name"
            />
          </div>
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            className={styles.input}
            value={form.email}
            onChange={handleChange}
            placeholder="email@example.com"
            autoComplete="email"
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            className={styles.input}
            value={form.password}
            onChange={handleChange}
            placeholder="••••••••"
            autoComplete="new-password"
          />
        </div>
        <button type="submit" className={styles.submit}>
          Create Account
        </button>
        <p className={styles.footer}>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </AuthLayout>
  )
}

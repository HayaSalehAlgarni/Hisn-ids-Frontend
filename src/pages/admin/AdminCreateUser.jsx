import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { useLang } from '../../context/lang'
import { postJsonAuth } from '../../api/client'
import s from './adminShared.module.css'

export default function AdminCreateUser() {
  const { lang } = useLang()
  const { me } = useOutletContext() || {}
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState('member')
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  const isSuper = me?.role === 'super_admin'

  const copy = {
    title: { ar: 'إنشاء مستخدم', en: 'Create user' },
    name: { ar: 'الاسم', en: 'Name' },
    email: { ar: 'البريد الإلكتروني', en: 'Email' },
    password: { ar: 'كلمة المرور', en: 'Password' },
    role: { ar: 'الصلاحية', en: 'Role' },
    member: { ar: 'عضو', en: 'Member' },
    admin: { ar: 'مدير', en: 'Admin' },
    submit: { ar: 'إنشاء', en: 'Create' },
    created: { ar: 'تم إنشاء المستخدم بنجاح', en: 'User created successfully' },
    pwdShort: { ar: 'كلمة المرور 8 أحرف على الأقل', en: 'Password must be at least 8 characters' },
    confirmL: { ar: 'تأكيد كلمة المرور', en: 'Confirm password' },
    pwdMismatch: { ar: 'كلمتا المرور غير متطابقتين', en: 'Passwords do not match' },
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErr('')
    setMsg('')
    if (!email.trim()) {
      setErr(lang === 'ar' ? 'البريد مطلوب' : 'Email is required')
      return
    }
    if (!password.trim()) {
      setErr(lang === 'ar' ? 'كلمة المرور مطلوبة' : 'Password is required')
      return
    }
    if (password.trim().length < 8) {
      setErr(copy.pwdShort[lang])
      return
    }
    if (password.trim() !== confirmPassword.trim()) {
      setErr(copy.pwdMismatch[lang])
      return
    }
    setLoading(true)
    try {
      const body = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: password.trim(),
        role: isSuper ? role : 'member',
      }
      await postJsonAuth('/api/admin/users', body)
      setMsg(copy.created[lang])
      setName('')
      setEmail('')
      setPassword('')
      setConfirmPassword('')
    } catch (e) {
      const m = String(e?.message || '')
      if (m.includes('email_exists')) setErr(lang === 'ar' ? 'البريد مستخدم' : 'Email already exists')
      else if (m.includes('invalid_role')) setErr(lang === 'ar' ? 'صلاحية غير مسموحة' : 'Role not allowed')
      else if (m.includes('password_too_short')) setErr(copy.pwdShort[lang])
      else if (m.includes('password is required')) setErr(lang === 'ar' ? 'كلمة المرور مطلوبة' : 'Password is required')
      else setErr(lang === 'ar' ? 'فشل الإنشاء' : 'Create failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className={s.pageTitle}>{copy.title[lang]}</h1>
      {err && <p className={s.error}>{err}</p>}
      {msg && <p className={s.success}>{msg}</p>}
      <div className={s.card}>
        <form className={s.formGrid} onSubmit={handleSubmit}>
          <div className={s.field}>
            <label>{copy.name[lang]}</label>
            <input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className={s.field}>
            <label>{copy.email[lang]}</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          {isSuper && (
            <div className={s.field}>
              <label>{copy.role[lang]}</label>
              <select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="member">{copy.member[lang]}</option>
                <option value="admin">{copy.admin[lang]}</option>
              </select>
            </div>
          )}
          <div className={s.field}>
            <label>{copy.password[lang]}</label>
            <input
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className={s.field}>
            <label>{copy.confirmL[lang]}</label>
            <input
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <button type="submit" className={s.btn} disabled={loading}>
            {copy.submit[lang]}
          </button>
        </form>
      </div>
    </div>
  )
}

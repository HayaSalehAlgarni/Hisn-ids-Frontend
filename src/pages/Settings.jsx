import { useMemo, useState } from 'react'
import styles from './Settings.module.css'
import { useLang } from '../context/lang'

// Backend endpoints (current repo backend is Flask on :5000)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000'
const OTP_SEND_ENDPOINT = `${API_BASE_URL}/api/auth/password-reset/send-otp`
const OTP_VERIFY_ENDPOINT = `${API_BASE_URL}/api/auth/password-reset/verify-otp`
const PASSWORD_RESET_ENDPOINT = `${API_BASE_URL}/api/auth/password-reset/confirm`

const ALERT_OPTIONS = [
  { id: 'critical', label: 'CRITICAL فقط' },
  { id: 'high', label: 'HIGH فأعلى' },
  { id: 'medium', label: 'MEDIUM فأعلى' },
  { id: 'low', label: 'الكل' },
]

const REFRESH_OPTIONS = [
  { id: '5', label: '5 ثوانٍ' },
  { id: '10', label: '10 ثوانٍ' },
  { id: '30', label: '30 ثانية' },
]

export default function Settings() {
  const { lang, setLang } = useLang()
  const [activeTab, setActiveTab] = useState('account') // 'account' | 'system'

  const [alertThreshold, setAlertThreshold] = useState('high')
  const [ipRange, setIpRange] = useState('192.168.1.0/24')
  const [refreshRate, setRefreshRate] = useState('10')
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [notificationLevel, setNotificationLevel] = useState('critical')

  const userEmail = JSON.parse(localStorage.getItem('hisn_user') || '{}').email || ''
  const maskedEmail = useMemo(() => {
    const email = String(userEmail || '').trim()
    if (!email.includes('@')) return email
    const [name, domain] = email.split('@')
    if (!name) return `***@${domain}`
    const visible = name.slice(0, 2)
    return `${visible}${'*'.repeat(Math.max(1, name.length - 2))}@${domain}`
  }, [userEmail])

  // Password reset (OTP) modal state
  const [resetOpen, setResetOpen] = useState(false)
  const [resetStep, setResetStep] = useState(1) // 1 | 2 | 3
  const [otpCode, setOtpCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [resetLoading, setResetLoading] = useState(false)
  const [resetError, setResetError] = useState('')
  const [resetSuccess, setResetSuccess] = useState('')

  const t = lang === 'ar' ? {
    title: 'الإعدادات',
    tabs: { account: 'الحساب', system: 'إعدادات النظام' },
    resetTab: 'إعادة تعيين كلمة المرور',
    sections: { account: 'الحساب', system: 'إعدادات النظام', notifications: 'الإشعارات' },
    email: 'البريد الإلكتروني',
    language: 'اللغة',
    system: {
      alertThreshold: 'حد التنبيه',
      monitoredIpRange: 'نطاق الـ IP المراقب',
      ipPlaceholder: 'مثال: 192.168.1.0/24',
      refreshRate: 'معدل تحديث البيانات',
    },
    notifications: {
      email: 'إشعارات البريد الإلكتروني',
      level: 'مستوى الإشعارات',
      criticalOnly: 'CRITICAL فقط',
      all: 'الكل',
    },
    save: 'حفظ التغييرات',
    reset: {
      title: 'إعادة تعيين كلمة المرور',
      step1: 'تأكيد الإرسال',
      step2: 'إدخال الرمز',
      step3: 'تعيين كلمة المرور',
      willSend: 'سيتم إرسال رمز تحقق إلى البريد الإلكتروني المسجل في الحساب:',
      confirmAndSend: 'تأكيد وإرسال الرمز',
      cancel: 'إلغاء',
      back: 'رجوع',
      otpLabel: 'رمز التحقق (6 أرقام)',
      otpPlaceholder: 'مثال: 123456',
      verify: 'إرسال',
      newPassword: 'كلمة المرور الجديدة',
      confirmPassword: 'تأكيد كلمة المرور',
      confirm: 'تأكيد',
      success: 'تمت إعادة تعيين كلمة المرور بنجاح.',
      missingEmail: 'لا يوجد بريد إلكتروني مسجل لهذا الحساب.',
      otpInvalid: 'يرجى إدخال رمز مكون من 6 أرقام.',
      passwordMismatch: 'كلمة المرور وتأكيدها غير متطابقين.',
      passwordTooShort: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل.',
    },
  } : {
    title: 'Settings',
    tabs: { account: 'Account', system: 'System' },
    resetTab: 'Reset password',
    sections: { account: 'Account', system: 'System settings', notifications: 'Notifications' },
    email: 'Email',
    language: 'Language',
    system: {
      alertThreshold: 'Alert threshold',
      monitoredIpRange: 'Monitored IP range',
      ipPlaceholder: 'e.g. 192.168.1.0/24',
      refreshRate: 'Data refresh rate',
    },
    notifications: {
      email: 'Email notifications',
      level: 'Notification level',
      criticalOnly: 'CRITICAL only',
      all: 'All',
    },
    save: 'Save changes',
    reset: {
      title: 'Reset password',
      step1: 'Confirm send',
      step2: 'Enter code',
      step3: 'Set password',
      willSend: 'An OTP will be sent to the email on this account:',
      confirmAndSend: 'Confirm & send code',
      cancel: 'Cancel',
      back: 'Back',
      otpLabel: 'OTP code (6 digits)',
      otpPlaceholder: 'e.g. 123456',
      verify: 'Submit',
      newPassword: 'New password',
      confirmPassword: 'Confirm password',
      confirm: 'Confirm',
      success: 'Password reset successfully.',
      missingEmail: 'No email is associated with this account.',
      otpInvalid: 'Please enter a 6-digit code.',
      passwordMismatch: 'Passwords do not match.',
      passwordTooShort: 'Password must be at least 6 characters.',
    },
  }

  const openResetModal = () => {
    setResetError('')
    setResetSuccess('')
    setResetLoading(false)
    setResetStep(1)
    setOtpCode('')
    setNewPassword('')
    setConfirmPassword('')
    setResetOpen(true)
  }

  const closeResetModal = () => {
    setResetOpen(false)
  }

  const apiPost = async (url, body) => {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body ?? {}),
    })
    let data = null
    try {
      data = await res.json()
    } catch {
      data = null
    }
    if (!res.ok) {
      const msg = (data && (data.detail || data.message)) || `Request failed (${res.status})`
      throw new Error(msg)
    }
    return data
  }

  const handleSendOtp = async () => {
    setResetError('')
    setResetSuccess('')
    if (!userEmail) {
      setResetError(t.reset.missingEmail)
      return
    }
    setResetLoading(true)
    try {
      await apiPost(OTP_SEND_ENDPOINT, { email: userEmail })
      setResetStep(2)
    } catch (e) {
      setResetError(e?.message || 'Failed to send OTP.')
    } finally {
      setResetLoading(false)
    }
  }

  const handleVerifyOtp = async () => {
    setResetError('')
    setResetSuccess('')
    const code = String(otpCode || '').replace(/\D/g, '').slice(0, 6)
    if (code.length !== 6) {
      setResetError(t.reset.otpInvalid)
      return
    }
    setResetLoading(true)
    try {
      await apiPost(OTP_VERIFY_ENDPOINT, { email: userEmail, code })
      setResetStep(3)
    } catch (e) {
      setResetError(e?.message || 'OTP verification failed.')
    } finally {
      setResetLoading(false)
    }
  }

  const handleResetPassword = async () => {
    setResetError('')
    setResetSuccess('')
    const code = String(otpCode || '').replace(/\D/g, '').slice(0, 6)
    if (code.length !== 6) {
      setResetError(t.reset.otpInvalid)
      return
    }
    if (!newPassword || !confirmPassword) {
      setResetError(t.reset.passwordTooShort) // minimal UX; keeps it simple
      return
    }
    if (newPassword !== confirmPassword) {
      setResetError(t.reset.passwordMismatch)
      return
    }
    if (String(newPassword).length < 6) {
      setResetError(t.reset.passwordTooShort)
      return
    }
    setResetLoading(true)
    try {
      await apiPost(PASSWORD_RESET_ENDPOINT, { email: userEmail, code, new_password: newPassword })
      setResetSuccess(t.reset.success)
      setTimeout(() => {
        closeResetModal()
      }, 900)
    } catch (e) {
      setResetError(e?.message || 'Password reset failed.')
    } finally {
      setResetLoading(false)
    }
  }

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.title}>{t.title}</h2>

      <div className={styles.tabs}>
        <div className={styles.tabGroup}>
          <button
            type="button"
            className={activeTab === 'account' ? `${styles.tab} ${styles.tabActive}` : styles.tab}
            onClick={() => setActiveTab('account')}
            aria-pressed={activeTab === 'account'}
          >
            <span className={styles.tabIcon} aria-hidden="true">👤</span>
            <span className={styles.tabText}>{t.tabs.account}</span>
          </button>
          <button
            type="button"
            className={activeTab === 'system' ? `${styles.tab} ${styles.tabActive}` : styles.tab}
            onClick={() => setActiveTab('system')}
            aria-pressed={activeTab === 'system'}
          >
            <span className={styles.tabIcon} aria-hidden="true">⚙️</span>
            <span className={styles.tabText}>{t.tabs.system}</span>
          </button>
          <button
            type="button"
            className={styles.resetTab}
            onClick={openResetModal}
          >
            <span className={styles.tabIcon} aria-hidden="true">🔐</span>
            <span className={styles.tabText}>{t.resetTab}</span>
          </button>
        </div>
      </div>

      <div className={styles.card}>
        {activeTab === 'account' && (
          <>
            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>{t.sections.account}</h3>
              <div className={styles.field}>
                <label className={styles.label}>{t.email}</label>
                <input type="email" className={styles.input} value={userEmail} readOnly />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>{t.language}</label>
                <div className={styles.radioGroup}>
                  <label className={styles.radio}>
                    <input type="radio" name="lang" value="ar" checked={lang === 'ar'} onChange={() => setLang('ar')} />
                    العربية
                  </label>
                  <label className={styles.radio}>
                    <input type="radio" name="lang" value="en" checked={lang === 'en'} onChange={() => setLang('en')} />
                    English
                  </label>
                </div>
              </div>
            </section>
          </>
        )}

        {activeTab === 'system' && (
          <>
            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>{t.sections.system}</h3>
              <div className={styles.field}>
                <label className={styles.label}>{t.system.alertThreshold}</label>
                <div className={styles.optionButtons}>
                  {ALERT_OPTIONS.map((o) => (
                    <button
                      key={o.id}
                      type="button"
                      className={alertThreshold === o.id ? `${styles.optionBtn} ${styles.optionBtnActive}` : styles.optionBtn}
                      onClick={() => setAlertThreshold(o.id)}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className={styles.field}>
                <label className={styles.label}>{t.system.monitoredIpRange}</label>
                <input type="text" className={styles.input} placeholder={t.system.ipPlaceholder} value={ipRange} onChange={(e) => setIpRange(e.target.value)} />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>{t.system.refreshRate}</label>
                <div className={styles.optionButtons}>
                  {REFRESH_OPTIONS.map((o) => (
                    <button
                      key={o.id}
                      type="button"
                      className={refreshRate === o.id ? `${styles.optionBtn} ${styles.optionBtnActive}` : styles.optionBtn}
                      onClick={() => setRefreshRate(o.id)}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>
            </section>
            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>{t.sections.notifications}</h3>
              <label className={styles.toggleRow}>
                <span>{t.notifications.email}</span>
                <input type="checkbox" checked={emailNotifications} onChange={(e) => setEmailNotifications(e.target.checked)} className={styles.checkbox} />
              </label>
              <div className={styles.field}>
                <label className={styles.label}>{t.notifications.level}</label>
                <div className={styles.optionButtons}>
                  <button type="button" className={notificationLevel === 'critical' ? `${styles.optionBtn} ${styles.optionBtnActive}` : styles.optionBtn} onClick={() => setNotificationLevel('critical')}>
                    {t.notifications.criticalOnly}
                  </button>
                  <button type="button" className={notificationLevel === 'all' ? `${styles.optionBtn} ${styles.optionBtnActive}` : styles.optionBtn} onClick={() => setNotificationLevel('all')}>
                    {t.notifications.all}
                  </button>
                </div>
              </div>
            </section>
          </>
        )}
      </div>

      <div className={styles.actions}>
        <button type="button" className={styles.saveBtn}>
          {t.save}
        </button>
      </div>

      {resetOpen && (
        <div
          className={styles.modalOverlay}
          role="dialog"
          aria-modal="true"
          aria-label={t.reset.title}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeResetModal()
          }}
        >
          <div className={styles.modal} onMouseDown={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>{t.reset.title}</h3>
              <button type="button" className={styles.modalClose} onClick={closeResetModal} aria-label="Close">
                ×
              </button>
            </div>

            <div className={styles.stepper} aria-label="Step indicator">
              <div className={resetStep === 1 ? `${styles.step} ${styles.stepActive}` : styles.step}>
                <span className={styles.stepDot}>1</span>
                <span className={styles.stepLabel}>{t.reset.step1}</span>
              </div>
              <div className={resetStep === 2 ? `${styles.step} ${styles.stepActive}` : styles.step}>
                <span className={styles.stepDot}>2</span>
                <span className={styles.stepLabel}>{t.reset.step2}</span>
              </div>
              <div className={resetStep === 3 ? `${styles.step} ${styles.stepActive}` : styles.step}>
                <span className={styles.stepDot}>3</span>
                <span className={styles.stepLabel}>{t.reset.step3}</span>
              </div>
            </div>

            {resetError && <div className={styles.errorMsg}>{resetError}</div>}
            {resetSuccess && <div className={styles.successMsg}>{resetSuccess}</div>}

            {resetStep === 1 && (
              <>
                <div className={styles.helpText}>
                  <div>{t.reset.willSend}</div>
                  <div className={styles.emailLine}>
                    <code>{maskedEmail || '-'}</code>
                  </div>
                </div>
                <div className={styles.modalFooter}>
                  <button type="button" className={styles.modalSecondary} onClick={closeResetModal} disabled={resetLoading}>
                    {t.reset.cancel}
                  </button>
                  <button type="button" className={styles.modalPrimary} onClick={handleSendOtp} disabled={resetLoading}>
                    {t.reset.confirmAndSend}
                  </button>
                </div>
              </>
            )}

            {resetStep === 2 && (
              <>
                <div className={styles.field}>
                  <label className={styles.label}>{t.reset.otpLabel}</label>
                  <input
                    type="text"
                    className={styles.input}
                    inputMode="numeric"
                    maxLength={6}
                    value={otpCode}
                    placeholder={t.reset.otpPlaceholder}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  />
                </div>
                <div className={styles.modalFooter}>
                  <button
                    type="button"
                    className={styles.modalSecondary}
                    onClick={() => {
                      setResetError('')
                      setResetSuccess('')
                      setResetStep(1)
                    }}
                    disabled={resetLoading}
                  >
                    {t.reset.back}
                  </button>
                  <button type="button" className={styles.modalPrimary} onClick={handleVerifyOtp} disabled={resetLoading}>
                    {t.reset.verify}
                  </button>
                </div>
              </>
            )}

            {resetStep === 3 && (
              <>
                <div className={styles.resetFields}>
                  <div className={styles.field}>
                    <label className={styles.label}>{t.reset.newPassword}</label>
                    <input
                      type="password"
                      className={styles.input}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder={t.reset.newPassword}
                      autoComplete="new-password"
                    />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>{t.reset.confirmPassword}</label>
                    <input
                      type="password"
                      className={styles.input}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder={t.reset.confirmPassword}
                      autoComplete="new-password"
                    />
                  </div>
                </div>
                <div className={styles.modalFooter}>
                  <button
                    type="button"
                    className={styles.modalSecondary}
                    onClick={() => {
                      setResetError('')
                      setResetSuccess('')
                      setResetStep(2)
                    }}
                    disabled={resetLoading}
                  >
                    {t.reset.back}
                  </button>
                  <button type="button" className={styles.modalPrimary} onClick={handleResetPassword} disabled={resetLoading}>
                    {t.reset.confirm}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

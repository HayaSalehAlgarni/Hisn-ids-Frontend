import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './Settings.module.css'
import { useLang } from '../context/lang'
import { postJson } from '../api/client'

export default function Settings() {
  const { lang, setLang } = useLang()
  const navigate = useNavigate()
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
  /** After send-otp: hint user where to find the code (email vs Flask console). */
  const [otpDeliveryHint, setOtpDeliveryHint] = useState('')

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
      criticalOnly: 'حرجة فقط',
      all: 'الكل',
    },
    alertOptions: [
      { id: 'critical', label: 'حرجة فقط' },
      { id: 'high', label: 'عالية فأعلى' },
      { id: 'medium', label: 'متوسطة فأعلى' },
      { id: 'low', label: 'جميع المستويات' },
    ],
    refreshOptions: [
      { id: '5', label: '5 ثوانٍ' },
      { id: '10', label: '10 ثوانٍ' },
      { id: '30', label: '30 ثانية' },
    ],
    emailReadOnly: 'للقراءة فقط - لا يمكن تعديل البريد الإلكتروني.',
    logout: 'تسجيل الخروج',
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
      emailDeliveryHint:
        'تحقق من بريدك الوارد ومجلد الرسائل غير المرغوب فيها (Spam). إن لم يصل شيء، راجع إعدادات SMTP في الخادم.',
      consoleDeliveryHint:
        'لم يُرسل بريد — غالباً لأن SMTP غير مضبوط أو وضع التطوير مفعّل. افتح نافذة الطرفية التي يعمل فيها خادم Flask؛ يُطبع فيها رمز التحقق.',
      smtpNotConfigured:
        'لم يُضبط إرسال البريد (SMTP). املأ SMTP_* في ملف .env أو فعّل OTP_ALLOW_WITHOUT_SMTP للتطوير واطلع على طرفية الخادم.',
      otpSendFailed: 'تعذّر إرسال البريد. تحقق من إعدادات SMTP أو اتصال الخادم.',
      verifyFailed: 'فشل التحقق من الرمز.',
      passwordResetFailed: 'فشلت إعادة تعيين كلمة المرور.',
      modalClose: 'إغلاق',
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
      criticalOnly: 'Critical only',
      all: 'All',
    },
    alertOptions: [
      { id: 'critical', label: 'Critical only' },
      { id: 'high', label: 'High & above' },
      { id: 'medium', label: 'Medium & above' },
      { id: 'low', label: 'All levels' },
    ],
    refreshOptions: [
      { id: '5', label: '5 seconds' },
      { id: '10', label: '10 seconds' },
      { id: '30', label: '30 seconds' },
    ],
    emailReadOnly: 'Read-only: email cannot be edited.',
    logout: 'Log out',
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
      emailDeliveryHint:
        'Check your inbox and spam folder. If nothing arrives, verify SMTP settings on the server.',
      consoleDeliveryHint:
        'No email was sent — SMTP is likely unset or dev mode is on. Open the Flask server terminal; the OTP is printed there.',
      smtpNotConfigured:
        'Email (SMTP) is not configured. Set SMTP_* in .env or enable OTP_ALLOW_WITHOUT_SMTP for dev and read the server log.',
      otpSendFailed: 'Could not send email. Check SMTP settings or server connectivity.',
      verifyFailed: 'OTP verification failed.',
      passwordResetFailed: 'Password reset failed.',
      modalClose: 'Close',
    },
  }

  const openResetModal = () => {
    setResetError('')
    setResetSuccess('')
    setOtpDeliveryHint('')
    setResetLoading(false)
    setResetStep(1)
    setOtpCode('')
    setNewPassword('')
    setConfirmPassword('')
    setResetOpen(true)
  }

  const closeResetModal = () => {
    setResetOpen(false)
    setOtpDeliveryHint('')
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
      const data = await postJson('/api/auth/password-reset/send-otp', { email: userEmail })
      setOtpDeliveryHint(
        data?.delivery === 'console' ? t.reset.consoleDeliveryHint : t.reset.emailDeliveryHint,
      )
      setResetStep(2)
    } catch (e) {
      const m = String(e?.message || '')
      if (m === 'smtp_not_configured') setResetError(t.reset.smtpNotConfigured)
      else if (m === 'otp_send_failed') setResetError(t.reset.otpSendFailed)
      else setResetError(m || (lang === 'ar' ? 'تعذّر إرسال الرمز.' : 'Failed to send OTP.'))
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
      await postJson('/api/auth/password-reset/verify-otp', { email: userEmail, code })
      setResetStep(3)
    } catch (e) {
      setResetError(e?.message || t.reset.verifyFailed)
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
      await postJson('/api/auth/password-reset/confirm', { email: userEmail, code, new_password: newPassword })
      setResetSuccess(t.reset.success)
      setTimeout(() => {
        closeResetModal()
      }, 900)
    } catch (e) {
      setResetError(e?.message || t.reset.passwordResetFailed)
    } finally {
      setResetLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('hisn_user')
    localStorage.removeItem('hisn_token')
    navigate('/', { replace: true })
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
                <input type="email" className={styles.input} value={userEmail} readOnly aria-readonly="true" />
                <small className={styles.readOnlyHint}>{t.emailReadOnly}</small>
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
                  {t.alertOptions.map((o) => (
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
                  {t.refreshOptions.map((o) => (
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

      {activeTab === 'account' && (
        <div className={styles.actions}>
          <button type="button" className={styles.logoutBtn} onClick={handleLogout}>
            {t.logout}
          </button>
        </div>
      )}

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
              <button type="button" className={styles.modalClose} onClick={closeResetModal} aria-label={t.reset.modalClose}>
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
            {resetStep === 2 && otpDeliveryHint && (
              <div className={styles.infoMsg}>{otpDeliveryHint}</div>
            )}

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
                      setOtpDeliveryHint('')
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

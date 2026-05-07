import { useEffect, useMemo, useState } from 'react'
import { useOutletContext, useNavigate } from 'react-router-dom'
import { useLang } from '../../context/lang'
import { getJsonAuth, patchJsonAuth, postJson, postJsonNoBodyAuth } from '../../api/client'
import styles from '../Settings.module.css'

export default function AdminSettings() {
  const { lang, setLang } = useLang()
  const navigate = useNavigate()
  const { me, setMe } = useOutletContext() || {}
  const [activeTab, setActiveTab] = useState('account')

  const [alertThreshold, setAlertThreshold] = useState('high')
  const [ipRange, setIpRange] = useState('192.168.1.0/24')
  const [refreshRate, setRefreshRate] = useState('10')
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [notificationLevel, setNotificationLevel] = useState('critical')

  const [systemLoading, setSystemLoading] = useState(true)
  const [systemSaving, setSystemSaving] = useState(false)
  const [systemErr, setSystemErr] = useState('')
  const [systemOk, setSystemOk] = useState('')
  const [langSaving, setLangSaving] = useState(false)

  const userEmail = me?.email || ''

  const maskedEmail = useMemo(() => {
    const email = String(userEmail || '').trim()
    if (!email.includes('@')) return email
    const [name, domain] = email.split('@')
    if (!name) return `***@${domain}`
    const visible = name.slice(0, 2)
    return `${visible}${'*'.repeat(Math.max(1, name.length - 2))}@${domain}`
  }, [userEmail])

  const [resetOpen, setResetOpen] = useState(false)
  const [resetStep, setResetStep] = useState(1)
  const [otpCode, setOtpCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [resetLoading, setResetLoading] = useState(false)
  const [resetError, setResetError] = useState('')
  const [resetSuccess, setResetSuccess] = useState('')
  const [otpDeliveryHint, setOtpDeliveryHint] = useState('')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setSystemLoading(true)
      setSystemErr('')
      try {
        const data = await getJsonAuth('/api/admin/system-settings')
        if (cancelled) return
        setAlertThreshold(String(data.alert_threshold || 'high').toLowerCase())
        setIpRange(data.monitored_ip_range || '192.168.1.0/24')
        setRefreshRate(String(data.refresh_rate_seconds ?? 10))
        setEmailNotifications(Boolean(data.email_notifications_enabled))
        setNotificationLevel(String(data.notification_level || 'critical').toLowerCase())
      } catch {
        if (!cancelled) setSystemErr(lang === 'ar' ? 'تعذّر تحميل إعدادات النظام.' : 'Could not load system settings.')
      } finally {
        if (!cancelled) setSystemLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const t =
    lang === 'ar'
      ? {
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
            { id: 'medium', label: 'متوسطة فأعلى' },
            { id: 'high', label: 'عالية فأعلى' },
            { id: 'low', label: 'جميع المستويات' },
          ],
          refreshOptions: [
            { id: '5', label: '5 ثوانٍ' },
            { id: '10', label: '10 ثوانٍ' },
            { id: '30', label: '30 ثانية' },
          ],
          emailReadOnly: 'للقراءة فقط - لا يمكن تعديل البريد الإلكتروني.',
          logout: 'تسجيل الخروج',
          saveSystem: 'حفظ إعدادات النظام',
          saving: 'جاري الحفظ…',
          loadError: 'تعذّر تحميل الإعدادات.',
          saveOk: 'تم حفظ إعدادات النظام.',
          saveFail: 'فشل حفظ إعدادات النظام.',
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
            passwordTooShort: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل.',
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
        }
      : {
          title: 'Settings',
          tabs: { account: 'Account', system: 'System settings' },
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
            { id: 'medium', label: 'Medium & above' },
            { id: 'high', label: 'High & above' },
            { id: 'low', label: 'All levels' },
          ],
          refreshOptions: [
            { id: '5', label: '5 seconds' },
            { id: '10', label: '10 seconds' },
            { id: '30', label: '30 seconds' },
          ],
          emailReadOnly: 'Read-only — email cannot be edited.',
          logout: 'Log out',
          saveSystem: 'Save system settings',
          saving: 'Saving…',
          loadError: 'Could not load settings.',
          saveOk: 'System settings saved.',
          saveFail: 'Failed to save system settings.',
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
            passwordTooShort: 'Password must be at least 8 characters.',
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

  const persistLanguage = async (next) => {
    if (!setMe || next === me?.preferred_language) {
      setLang(next)
      return
    }
    setLang(next)
    setLangSaving(true)
    try {
      const data = await patchJsonAuth('/api/admin/profile', { preferred_language: next })
      if (data.user) {
        setMe(data.user)
        try {
          localStorage.setItem('hisn_user', JSON.stringify(data.user))
        } catch {
          /* ignore */
        }
      }
    } catch {
      const revert = me?.preferred_language === 'en' ? 'en' : 'ar'
      setLang(revert)
    } finally {
      setLangSaving(false)
    }
  }

  const saveSystemSettings = async () => {
    setSystemErr('')
    setSystemOk('')
    setSystemSaving(true)
    try {
      await patchJsonAuth('/api/admin/system-settings', {
        alert_threshold: alertThreshold,
        monitored_ip_range: ipRange.trim(),
        refresh_rate_seconds: parseInt(refreshRate, 10),
        email_notifications_enabled: emailNotifications,
        notification_level: notificationLevel,
      })
      setSystemOk(t.saveOk)
    } catch (e) {
      const raw = String(e?.message || '').toLowerCase()
      if (raw.includes('invalid_ip_range')) {
        setSystemErr(lang === 'ar' ? 'صيغة نطاق IP غير صالحة (استخدم CIDR).' : 'Invalid IP range (use CIDR).')
      } else {
        setSystemErr(t.saveFail)
      }
    } finally {
      setSystemSaving(false)
    }
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
      setOtpDeliveryHint(data?.delivery === 'console' ? t.reset.consoleDeliveryHint : t.reset.emailDeliveryHint)
      setResetStep(2)
    } catch (e) {
      const m = String(e?.message || '')
      if (m.includes('smtp_not_configured')) setResetError(t.reset.smtpNotConfigured)
      else if (m.includes('otp_send_failed')) setResetError(t.reset.otpSendFailed)
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
      setResetError(t.reset.passwordTooShort)
      return
    }
    if (newPassword !== confirmPassword) {
      setResetError(t.reset.passwordMismatch)
      return
    }
    if (String(newPassword).length < 8) {
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

  const handleLogout = async () => {
    try {
      await postJsonNoBodyAuth('/api/auth/logout')
    } catch {
      /* ignore */
    }
    localStorage.removeItem('hisn_token')
    localStorage.removeItem('hisn_user')
    navigate('/admin/login', { replace: true })
  }

  return (
    <div className={styles.wrapper} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <h2 className={styles.title}>{t.title}</h2>

      <div className={styles.tabs}>
        <div className={styles.tabGroup}>
          <button
            type="button"
            className={activeTab === 'account' ? `${styles.tab} ${styles.tabActive}` : styles.tab}
            onClick={() => setActiveTab('account')}
            aria-pressed={activeTab === 'account'}
          >
            <span className={styles.tabIcon} aria-hidden="true">
              👤
            </span>
            <span className={styles.tabText}>{t.tabs.account}</span>
          </button>
          <button
            type="button"
            className={activeTab === 'system' ? `${styles.tab} ${styles.tabActive}` : styles.tab}
            onClick={() => setActiveTab('system')}
            aria-pressed={activeTab === 'system'}
          >
            <span className={styles.tabIcon} aria-hidden="true">
              ⚙️
            </span>
            <span className={styles.tabText}>{t.tabs.system}</span>
          </button>
          <button type="button" className={styles.resetTab} onClick={openResetModal}>
            <span className={styles.tabIcon} aria-hidden="true">
              🔐
            </span>
            <span className={styles.tabText}>{t.resetTab}</span>
          </button>
        </div>
      </div>

      <div className={styles.card}>
        {activeTab === 'account' && (
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
                  <input
                    type="radio"
                    name="admin-lang"
                    value="ar"
                    checked={lang === 'ar'}
                    disabled={langSaving}
                    onChange={() => persistLanguage('ar')}
                  />
                  العربية
                </label>
                <label className={styles.radio}>
                  <input
                    type="radio"
                    name="admin-lang"
                    value="en"
                    checked={lang === 'en'}
                    disabled={langSaving}
                    onChange={() => persistLanguage('en')}
                  />
                  English
                </label>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'system' && (
          <>
            {systemLoading ? (
              <p className={styles.readOnlyHint}>{lang === 'ar' ? 'جاري التحميل…' : 'Loading…'}</p>
            ) : (
              <>
                {systemErr && !systemOk && <div className={styles.errorMsg}>{systemErr}</div>}
                {systemOk && <div className={styles.successMsg}>{systemOk}</div>}
                <section className={styles.section}>
                  <h3 className={styles.sectionTitle}>{t.sections.system}</h3>
                  <div className={styles.field}>
                    <label className={styles.label}>{t.system.alertThreshold}</label>
                    <div className={styles.optionButtons}>
                      {t.alertOptions.map((o) => (
                        <button
                          key={o.id}
                          type="button"
                          className={
                            alertThreshold === o.id ? `${styles.optionBtn} ${styles.optionBtnActive}` : styles.optionBtn
                          }
                          onClick={() => {
                            setSystemOk('')
                            setAlertThreshold(o.id)
                          }}
                        >
                          {o.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>{t.system.monitoredIpRange}</label>
                    <input
                      type="text"
                      className={styles.input}
                      placeholder={t.system.ipPlaceholder}
                      value={ipRange}
                      onChange={(e) => {
                        setSystemOk('')
                        setIpRange(e.target.value)
                      }}
                      dir="ltr"
                      style={{ textAlign: lang === 'ar' ? 'right' : 'left' }}
                    />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>{t.system.refreshRate}</label>
                    <div className={styles.optionButtons}>
                      {t.refreshOptions.map((o) => (
                        <button
                          key={o.id}
                          type="button"
                          className={
                            refreshRate === o.id ? `${styles.optionBtn} ${styles.optionBtnActive}` : styles.optionBtn
                          }
                          onClick={() => {
                            setSystemOk('')
                            setRefreshRate(o.id)
                          }}
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
                    <input
                      type="checkbox"
                      checked={emailNotifications}
                      onChange={(e) => {
                        setSystemOk('')
                        setEmailNotifications(e.target.checked)
                      }}
                      className={styles.checkbox}
                    />
                  </label>
                  <div className={styles.field}>
                    <label className={styles.label}>{t.notifications.level}</label>
                    <div className={styles.optionButtons}>
                      <button
                        type="button"
                        className={
                          notificationLevel === 'critical'
                            ? `${styles.optionBtn} ${styles.optionBtnActive}`
                            : styles.optionBtn
                        }
                        onClick={() => {
                          setSystemOk('')
                          setNotificationLevel('critical')
                        }}
                      >
                        {t.notifications.criticalOnly}
                      </button>
                      <button
                        type="button"
                        className={
                          notificationLevel === 'all' ? `${styles.optionBtn} ${styles.optionBtnActive}` : styles.optionBtn
                        }
                        onClick={() => {
                          setSystemOk('')
                          setNotificationLevel('all')
                        }}
                      >
                        {t.notifications.all}
                      </button>
                    </div>
                  </div>
                </section>
                <div style={{ marginTop: '1rem' }}>
                  <button type="button" className={styles.modalPrimary} disabled={systemSaving} onClick={saveSystemSettings}>
                    {systemSaving ? t.saving : t.saveSystem}
                  </button>
                </div>
              </>
            )}
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
            {resetStep === 2 && otpDeliveryHint && <div className={styles.infoMsg}>{otpDeliveryHint}</div>}

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

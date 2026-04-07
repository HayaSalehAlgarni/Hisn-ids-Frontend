import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './Settings.module.css'

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
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('account') // 'account' | 'system'
  const [language, setLanguage] = useState('ar')
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' })

  const [alertThreshold, setAlertThreshold] = useState('high')
  const [ipRange, setIpRange] = useState('192.168.1.0/24')
  const [refreshRate, setRefreshRate] = useState('10')
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [notificationLevel, setNotificationLevel] = useState('critical')

  const userEmail = JSON.parse(localStorage.getItem('hisn_user') || '{}').email || ''

  const handleLogoutAll = () => {
    localStorage.removeItem('hisn_user')
    navigate('/login')
  }

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.title}>الإعدادات</h2>

      <div className={styles.tabs}>
        <button
          type="button"
          className={activeTab === 'account' ? `${styles.tab} ${styles.tabActive}` : styles.tab}
          onClick={() => setActiveTab('account')}
        >
          الحساب
        </button>
        <button
          type="button"
          className={activeTab === 'system' ? `${styles.tab} ${styles.tabActive}` : styles.tab}
          onClick={() => setActiveTab('system')}
        >
          إعدادات النظام
        </button>
      </div>

      <div className={styles.card}>
        {activeTab === 'account' && (
          <>
            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>الحساب</h3>
              <div className={styles.field}>
                <label className={styles.label}>البريد الإلكتروني</label>
                <input type="email" className={styles.input} value={userEmail} readOnly />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>اللغة</label>
                <div className={styles.radioGroup}>
                  <label className={styles.radio}>
                    <input type="radio" name="lang" value="ar" checked={language === 'ar'} onChange={() => setLanguage('ar')} />
                    العربية
                  </label>
                  <label className={styles.radio}>
                    <input type="radio" name="lang" value="en" checked={language === 'en'} onChange={() => setLanguage('en')} />
                    English
                  </label>
                </div>
              </div>
            </section>
            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>الأمان</h3>
              <div className={styles.field}>
                <label className={styles.label}>تغيير كلمة المرور</label>
                <div className={styles.passwordFields}>
                  <input type="password" className={styles.input} placeholder="كلمة المرور الحالية" value={passwordForm.current} onChange={(e) => setPasswordForm((p) => ({ ...p, current: e.target.value }))} />
                  <input type="password" className={styles.input} placeholder="كلمة المرور الجديدة" value={passwordForm.new} onChange={(e) => setPasswordForm((p) => ({ ...p, new: e.target.value }))} />
                  <input type="password" className={styles.input} placeholder="تأكيد كلمة المرور الجديدة" value={passwordForm.confirm} onChange={(e) => setPasswordForm((p) => ({ ...p, confirm: e.target.value }))} />
                </div>
                <button type="button" className={styles.secondaryBtn}>
                  تحديث كلمة المرور
                </button>
              </div>
              <div className={styles.field}>
                <button type="button" className={styles.dangerBtn} onClick={handleLogoutAll}>
                  تسجيل الخروج من كل الأجهزة
                </button>
              </div>
            </section>
          </>
        )}

        {activeTab === 'system' && (
          <>
            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>إعدادات النظام</h3>
              <div className={styles.field}>
                <label className={styles.label}>حد التنبيه</label>
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
                <label className={styles.label}>نطاق الـ IP المراقب</label>
                <input type="text" className={styles.input} placeholder="مثال: 192.168.1.0/24" value={ipRange} onChange={(e) => setIpRange(e.target.value)} />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>معدل تحديث البيانات</label>
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
              <h3 className={styles.sectionTitle}>الإشعارات</h3>
              <label className={styles.toggleRow}>
                <span>إشعارات البريد الإلكتروني</span>
                <input type="checkbox" checked={emailNotifications} onChange={(e) => setEmailNotifications(e.target.checked)} className={styles.checkbox} />
              </label>
              <div className={styles.field}>
                <label className={styles.label}>مستوى الإشعارات</label>
                <div className={styles.optionButtons}>
                  <button type="button" className={notificationLevel === 'critical' ? `${styles.optionBtn} ${styles.optionBtnActive}` : styles.optionBtn} onClick={() => setNotificationLevel('critical')}>
                    CRITICAL فقط
                  </button>
                  <button type="button" className={notificationLevel === 'all' ? `${styles.optionBtn} ${styles.optionBtnActive}` : styles.optionBtn} onClick={() => setNotificationLevel('all')}>
                    الكل
                  </button>
                </div>
              </div>
            </section>
          </>
        )}
      </div>

      <div className={styles.actions}>
        <button type="button" className={styles.saveBtn}>
          حفظ التغييرات
        </button>
      </div>
    </div>
  )
}

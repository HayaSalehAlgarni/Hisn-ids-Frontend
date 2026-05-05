import styles from './AuthLayout.module.css'
import { useLang } from '../context/lang'

export default function AuthLayout({ children, title }) {
  const { lang, setLang } = useLang()

  const titles = {
    'تسجيل الدخول': { ar: 'تسجيل الدخول', en: 'Login' },
    'اختيار الحساب': { ar: 'اختيار نوع الحساب', en: 'Choose account type' },
    'مدير النظام': { ar: 'مدير النظام', en: 'System administrator' },
  }

  const displayTitle = titles[title]?.[lang] ?? title

  return (
    <>
      {/* Keep the visual layout fixed (logo panel always on the left).
          Apply RTL only to the form content, not the outer flex container. */}
      <div className={styles.page} dir="ltr">
        <div className={styles.left}>
          <div className={styles.illustration}>
            <img src="/hisn-logo.png" alt="حصن HISN" className={styles.hisnLogo} />
          </div>
        </div>
        <div className={styles.right} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
          <div className={styles.formCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' }}>
              {title && <h1 className={styles.formTitle} style={{ margin: 0 }}>{displayTitle}</h1>}
              <button
                onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
                style={{
                  background: 'transparent',
                  color: '#6B3FA0',
                  border: '1.5px solid #6B3FA0',
                  borderRadius: '8px',
                  padding: '5px 14px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                {lang === 'en' ? 'عربي' : 'English'}
              </button>
            </div>
            {children}
          </div>
        </div>
      </div>
    </>
  )
}

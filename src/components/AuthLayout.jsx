import { useNavigate } from 'react-router-dom'
import styles from './AuthLayout.module.css'
import { useLang } from '../context/lang'

export default function AuthLayout({ children, title, backTo }) {
  const navigate = useNavigate()
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
            <div className={styles.headerRow}>
              {title && <h1 className={styles.headerTitle}>{displayTitle}</h1>}
              <div className={styles.headerActions}>
                <button
                  type="button"
                  className={styles.outlineBtn}
                  onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
                >
                  {lang === 'en' ? 'عربي' : 'English'}
                </button>
                {backTo ? (
                  <button
                    type="button"
                    className={styles.outlineBtn}
                    onClick={() => navigate(backTo)}
                  >
                    {lang === 'ar' ? 'رجوع' : 'Back'}
                  </button>
                ) : null}
              </div>
            </div>
            {children}
          </div>
        </div>
      </div>
    </>
  )
}

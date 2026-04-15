import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import styles from './Layout.module.css'
import { useLang } from '../context/lang'

const NAV_ITEMS = [
  { to: '/', icon: '🛡️', label: { ar: 'لوحة التحكم', en: 'Dashboard' } },
  { to: '/monitoring', icon: '📡', label: { ar: 'المراقبة المباشرة', en: 'Live Monitoring' } },
  { to: '/alerts', icon: '⚠️', label: { ar: 'التنبيهات', en: 'Alerts' } },
  { to: '/reports', icon: '🧾', label: { ar: 'التقارير', en: 'Reports' } },
  { to: '/analytics', icon: '📊', label: { ar: 'التحليلات', en: 'Analytics' } },
  { to: '/settings', icon: '⚙️', label: { ar: 'الإعدادات', en: 'Settings' } },
]

export default function Layout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { lang } = useLang()

  const handleLogout = () => {
    localStorage.removeItem('hisn_user')
    navigate('/login', { replace: true })
  }

  return (
    <div className={styles.wrapper} dir="ltr">
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <img src="/hisn-logo.png" alt="HISN IDS" className={styles.brandLogo} />
        </div>
        <nav className={styles.nav}>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
              }
            >
              {item.icon} {item.label[lang] ?? item.label.en}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className={styles.main} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <header className={styles.header}>
          <div className={styles.headerTitle}>
            {location.pathname === '/'
              ? (lang === 'ar' ? 'لوحة التحكم' : 'Dashboard')
              : location.pathname}
          </div>
          <div className={styles.headerActions}>
            <button type="button" className={styles.logoutBtn} onClick={handleLogout}>
              {lang === 'ar' ? 'تسجيل خروج' : 'Logout'}
            </button>
          </div>
        </header>
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}

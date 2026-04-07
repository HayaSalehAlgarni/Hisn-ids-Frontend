import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom'
import styles from './Layout.module.css'

const navItems = [
  { path: '/', label: 'نظرة عامة', labelEn: 'Dashboard' },
  { path: '/monitoring', label: 'المراقبة المباشرة', labelEn: 'Live Monitoring' },
  { path: '/alerts', label: 'التنبيهات', labelEn: 'Alerts' },
  { path: '/reports', label: 'التقارير', labelEn: 'Reports' },
  { path: '/analytics', label: 'التحليلات', labelEn: 'Analytics' },
  { path: '/settings', label: 'الإعدادات', labelEn: 'Settings' },
]

export default function Layout() {
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    localStorage.removeItem('hisn_user')
    navigate('/login')
  }

  return (
    <div className={styles.wrapper}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <img src="/hisn-logo.png" alt="حصن HISN" className={styles.brandLogo} />
        </div>
        <nav className={styles.nav}>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={
                location.pathname === item.path
                  ? `${styles.navLink} ${styles.navLinkActive}`
                  : styles.navLink
              }
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className={styles.main}>
        <header className={styles.header}>
          <span className={styles.headerTitle}>AI & ML Analytics · IDS</span>
          <div className={styles.headerActions}>
            <Link to="/settings" className={styles.iconBtn} title="الإعدادات">
              ⚙
            </Link>
            <button type="button" onClick={handleLogout} className={styles.logoutBtn}>
              تسجيل الخروج
            </button>
          </div>
        </header>
        <div className={styles.content}>
          <Outlet />
        </div>
      </main>
    </div>
  )
}

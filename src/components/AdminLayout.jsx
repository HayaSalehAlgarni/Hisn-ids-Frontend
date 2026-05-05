import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import styles from './AdminLayout.module.css'
import { useLang } from '../context/lang'
import { getJsonAuth, postJsonNoBodyAuth } from '../api/client'

const NAV_ITEMS = [
  { to: '/admin/app', icon: '📊', label: { ar: 'لوحة التحكم', en: 'Dashboard' }, end: true },
  { to: '/admin/app/users', icon: '👥', label: { ar: 'المستخدمين', en: 'Users' } },
  { to: '/admin/app/create-user', icon: '➕', label: { ar: 'إنشاء مستخدم', en: 'Create User' } },
  { to: '/admin/app/activity', icon: '📜', label: { ar: 'سجل النشاط', en: 'Activity Logs' } },
  { to: '/admin/app/notifications', icon: '🔔', label: { ar: 'الإشعارات', en: 'Notifications' }, badge: true },
  { to: '/admin/app/settings', icon: '⚙️', label: { ar: 'الإعدادات', en: 'Settings' } },
]

export default function AdminLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { lang } = useLang()
  const [ready, setReady] = useState(false)
  const [me, setMe] = useState(null)
  const [noteBadge, setNoteBadge] = useState(0)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const data = await getJsonAuth('/api/admin/me')
        if (!cancelled) {
          setMe(data.user)
          setReady(true)
        }
      } catch {
        localStorage.removeItem('hisn_token')
        localStorage.removeItem('hisn_user')
        navigate('/admin/login', { replace: true })
      }
    })()
    return () => {
      cancelled = true
    }
  }, [navigate])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const data = await getJsonAuth('/api/admin/notifications')
        if (!cancelled) setNoteBadge(Math.min(99, Number(data.badge_count) || 0))
      } catch {
        /* ignore */
      }
    })()
    return () => {
      cancelled = true
    }
  }, [location.pathname])

  const handleLogout = async () => {
    try {
      await postJsonNoBodyAuth('/api/auth/logout')
    } catch {
      /* ignore */
    }
    localStorage.removeItem('hisn_token')
    localStorage.removeItem('hisn_user')
    navigate('/', { replace: true })
  }

  if (!ready) {
    return (
      <div className={styles.loading} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        {lang === 'ar' ? 'جاري التحميل…' : 'Loading…'}
      </div>
    )
  }

  const roleLabel =
    me?.role === 'super_admin'
      ? lang === 'ar'
        ? 'مسؤول أعلى'
        : 'Super Admin'
      : me?.role === 'admin'
        ? lang === 'ar'
          ? 'مدير'
          : 'Admin'
        : ''

  const displayName = (me?.name || '').trim() || me?.email || ''

  return (
    <div className={styles.wrapper} dir="ltr">
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <img src="/hisn-logo.png" alt="HISN IDS" className={styles.brandLogo} />
          <div className={styles.brandSub}>
            {lang === 'ar' ? 'لوحة الإدارة' : 'Admin Panel'}
          </div>
          <div className={styles.brandUserName} title={me?.email}>
            {displayName}
          </div>
        </div>
        <nav className={styles.nav}>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
              }
            >
              {item.icon} {item.label[lang] ?? item.label.en}
              {item.badge && noteBadge > 0 ? (
                <span className={styles.navBadge}>{noteBadge >= 10 ? '9+' : noteBadge}</span>
              ) : null}
            </NavLink>
          ))}
        </nav>
        <div className={styles.sidebarFooter}>
          <NavLink to="/app" className={styles.memberLink}>
            {lang === 'ar' ? '→ واجهة المستخدم' : '→ Member app'}
          </NavLink>
        </div>
      </aside>

      <div className={styles.main} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <header className={styles.header}>
          <div className={styles.headerTitle}>
            {location.pathname === '/admin/app' || location.pathname === '/admin/app/'
              ? lang === 'ar'
                ? 'لوحة التحكم'
                : 'Dashboard'
              : location.pathname === '/admin/app/settings'
                ? lang === 'ar'
                  ? 'الإعدادات'
                  : 'Settings'
                : location.pathname.replace(/^\/admin\/app/, '') || '/'}
            {roleLabel ? (
              <span className={styles.roleBadge}>
                {lang === 'ar' ? ' — ' : ' — '}
                {roleLabel}
              </span>
            ) : null}
          </div>
          <div className={styles.headerActions}>
            <span className={styles.userEmail}>{me?.email}</span>
            <button type="button" className={styles.logoutBtn} onClick={handleLogout}>
              {lang === 'ar' ? 'تسجيل خروج' : 'Logout'}
            </button>
          </div>
        </header>
        <main className={styles.content}>
          <Outlet context={{ me, setMe }} />
        </main>
      </div>
    </div>
  )
}

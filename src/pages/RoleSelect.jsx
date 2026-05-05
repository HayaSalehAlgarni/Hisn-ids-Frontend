import { useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import { useLang } from '../context/lang'
import styles from './RoleSelect.module.css'

export default function RoleSelect() {
  const navigate = useNavigate()
  const { lang } = useLang()

  const copy =
    lang === 'ar'
      ? {
          intro: 'اختر نوع الدخول المناسب لك.',
          memberTitle: 'عضو',
          memberDesc: 'الدخول إلى لوحة التحكم والتنبيهات.',
          adminTitle: 'مدير النظام',
          adminDesc: 'إدارة المستخدمين والصلاحيات وسجل النشاط.',
        }
      : {
          intro: 'Choose how you want to continue.',
          memberTitle: 'Member',
          memberDesc: 'Sign in to dashboard and alerts.',
          adminTitle: 'System administrator',
          adminDesc: 'Manage users, roles, and activity logs.',
        }

  return (
    <AuthLayout title="اختيار الحساب">
      <p className={styles.intro}>{copy.intro}</p>
      <div className={styles.actions}>
        <button
          type="button"
          className={styles.choiceBtn}
          onClick={() => navigate('/login')}
        >
          <span className={styles.choiceIcon}>👤</span>
          <span className={styles.choiceText}>
            <span className={styles.choiceTitle}>{copy.memberTitle}</span>
            <span className={styles.choiceDesc}>{copy.memberDesc}</span>
          </span>
        </button>
        <button
          type="button"
          className={styles.choiceBtn}
          onClick={() => navigate('/admin/login')}
        >
          <span className={styles.choiceIcon}>🛡️</span>
          <span className={styles.choiceText}>
            <span className={styles.choiceTitle}>{copy.adminTitle}</span>
            <span className={styles.choiceDesc}>{copy.adminDesc}</span>
          </span>
        </button>
      </div>
    </AuthLayout>
  )
}

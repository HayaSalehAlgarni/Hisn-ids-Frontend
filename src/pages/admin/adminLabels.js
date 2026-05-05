/** ترجمة أسماء الأحداث في لوحة الأدمن */
export function activityActionLabel(action, lang) {
  const ar = {
    login: 'تسجيل دخول',
    user_create: 'إنشاء مستخدم',
    user_update: 'تحديث مستخدم',
    user_delete: 'حذف مستخدم',
    password_reset: 'إعادة تعيين كلمة المرور',
    profile_update: 'تحديث الملف الشخصي',
    alerts_summary: 'ملخص التنبيهات',
    alerts_24h: 'تنبيهات (24 ساعة)',
  }
  const en = {
    login: 'Login',
    user_create: 'User created',
    user_update: 'User updated',
    user_delete: 'User deleted',
    password_reset: 'Password reset',
    profile_update: 'Profile updated',
    alerts_summary: 'Alerts summary',
    alerts_24h: 'Alerts (24h)',
  }
  const L = lang === 'ar' ? ar : en
  return L[action] || action
}

export function activityRowClass(action) {
  switch (action) {
    case 'login':
      return 'actLogin'
    case 'user_create':
      return 'actCreate'
    case 'user_update':
    case 'profile_update':
      return 'actUpdate'
    case 'user_delete':
      return 'actDelete'
    case 'password_reset':
      return 'actWarn'
    default:
      return 'actDefault'
  }
}

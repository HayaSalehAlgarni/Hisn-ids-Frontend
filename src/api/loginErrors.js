/**
 * Maps backend / network error codes to user-facing strings (AR/EN).
 */
export function loginErrorMessage(rawMessage, lang) {
  const msg = String(rawMessage || '').toLowerCase()
  const ar = {
    network: 'لا يصل التطبيق للخادم. شغّل: python backend/app.py ثم جرّب مرة أخرى. (أو تحقق من VITE_API_BASE_URL في .env)',
    db_config: 'الخادم غير مهيأ: عرّف DB_HOST و DB_USER و DB_PASSWORD و DB_NAME في ملف .env',
    db_conn: 'فشل الاتصال بقاعدة البيانات. تأكد من تشغيل MySQL وصحة كلمة مرور المستخدم في .env',
    credentials: 'البريد أو كلمة المرور غير صحيحة',
    suspended: 'الحساب موقوف',
  }
  const en = {
    network: 'Cannot reach the API. Start the backend: python backend/app.py (check VITE_API_BASE_URL in .env)',
    db_config: 'Server misconfigured: set DB_HOST, DB_USER, DB_PASSWORD, DB_NAME in .env',
    db_conn: 'Database connection failed. Is MySQL running? Check DB_USER / DB_PASSWORD in .env',
    credentials: 'Invalid email or password',
    suspended: 'Account is suspended',
  }
  const L = lang === 'ar' ? ar : en
  if (
    msg.includes('failed to fetch') ||
    msg.includes('networkerror') ||
    msg.includes('network_error') ||
    msg.includes('load failed')
  ) {
    return L.network
  }
  if (msg.includes('db_not_configured')) return L.db_config
  if (msg.includes('db_connection_failed')) return L.db_conn
  if (msg.includes('invalid_credentials')) return L.credentials
  if (msg.includes('account_suspended')) return L.suspended
  return null
}

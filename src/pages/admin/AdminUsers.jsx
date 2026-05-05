import { useCallback, useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { useLang } from '../../context/lang'
import { deleteJsonAuth, getJsonAuth, patchJsonAuth, postJsonAuth } from '../../api/client'
import s from './adminShared.module.css'

function canManageUser(me, u) {
  if (!me || !u || u.id === me.id) return false
  if (me.role === 'super_admin') return true
  return u.role === 'member'
}

export default function AdminUsers() {
  const { lang } = useLang()
  const { me } = useOutletContext() || {}
  const [users, setUsers] = useState([])
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('all')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [editName, setEditName] = useState('')
  const [editRole, setEditRole] = useState('member')
  const [editLoading, setEditLoading] = useState(false)
  const [editErr, setEditErr] = useState('')

  const isSuper = me?.role === 'super_admin'

  const load = useCallback(async () => {
    setErr('')
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (q.trim()) params.set('q', q.trim())
      if (status !== 'all') params.set('status', status)
      const path = `/api/admin/users${params.toString() ? `?${params}` : ''}`
      const data = await getJsonAuth(path)
      setUsers(data.users || [])
    } catch {
      setErr(lang === 'ar' ? 'تعذر تحميل المستخدمين' : 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }, [q, status, lang])

  useEffect(() => {
    const t = setTimeout(load, 280)
    return () => clearTimeout(t)
  }, [load])

  const copy = {
    title: { ar: 'إدارة المستخدمين', en: 'User management' },
    search: { ar: 'بحث…', en: 'Search…' },
    all: { ar: 'الكل', en: 'All' },
    suspend: { ar: 'إيقاف', en: 'Suspend' },
    activate: { ar: 'تفعيل', en: 'Activate' },
    reset: { ar: 'إعادة كلمة مرور', en: 'Reset password' },
    delete: { ar: 'حذف', en: 'Delete' },
    edit: { ar: 'تعديل', en: 'Edit' },
    role: { ar: 'الدور', en: 'Role' },
    email: { ar: 'البريد', en: 'Email' },
    name: { ar: 'الاسم', en: 'Name' },
    save: { ar: 'حفظ', en: 'Save' },
    cancel: { ar: 'إلغاء', en: 'Cancel' },
    editTitle: { ar: 'تعديل المستخدم', en: 'Edit user' },
    cDelete: { ar: 'تأكيد حذف هذا المستخدم؟', en: 'Delete this user?' },
    cSuspend: { ar: 'تأكيد إيقاف هذا المستخدم؟', en: 'Suspend this user?' },
    cActivate: { ar: 'تأكيد تفعيل هذا المستخدم؟', en: 'Activate this user?' },
    cReset: { ar: 'توليد كلمة مرور جديدة وإظهارها؟', en: 'Generate and show a new password?' },
    empty: { ar: 'لا مستخدمين.', en: 'No users found.' },
  }

  const openEdit = (u) => {
    setEditing(u)
    setEditName(u.name || '')
    setEditRole(u.role || 'member')
    setEditErr('')
  }

  const saveEdit = async (e) => {
    e.preventDefault()
    if (!editing) return
    setEditErr('')
    setEditLoading(true)
    try {
      const body = { name: editName.trim() }
      if (
        isSuper &&
        editing.id !== me?.id &&
        editing.role !== 'super_admin'
      ) {
        body.role = editRole
      }
      await patchJsonAuth(`/api/admin/users/${editing.id}`, body)
      setEditing(null)
      await load()
    } catch (e) {
      setEditErr(String(e?.message || (lang === 'ar' ? 'فشل الحفظ' : 'Save failed')))
    } finally {
      setEditLoading(false)
    }
  }

  const toggleSuspend = async (u) => {
    const next = u.status === 'suspended' ? 'active' : 'suspended'
    const ok = window.confirm(
      next === 'suspended' ? copy.cSuspend[lang] : copy.cActivate[lang],
    )
    if (!ok) return
    try {
      await patchJsonAuth(`/api/admin/users/${u.id}`, { status: next })
      await load()
    } catch {
      setErr(lang === 'ar' ? 'فشل التحديث' : 'Update failed')
    }
  }

  const remove = async (u) => {
    if (!window.confirm(copy.cDelete[lang])) return
    try {
      await deleteJsonAuth(`/api/admin/users/${u.id}`)
      await load()
    } catch (e) {
      setErr(String(e?.message || (lang === 'ar' ? 'فشل الحذف' : 'Delete failed')))
    }
  }

  const resetPwd = async (u) => {
    if (!window.confirm(copy.cReset[lang])) return
    try {
      const data = await postJsonAuth(`/api/admin/users/${u.id}/reset-password`, {})
      window.alert(
        lang === 'ar'
          ? `كلمة المرور الجديدة: ${data.new_password}`
          : `New password: ${data.new_password}`,
      )
    } catch {
      setErr(lang === 'ar' ? 'فشل إعادة التعيين' : 'Reset failed')
    }
  }

  const roleLabel = (r) => {
    if (r === 'super_admin') return lang === 'ar' ? 'مسؤول أعلى' : 'Super Admin'
    if (r === 'admin') return lang === 'ar' ? 'مدير' : 'Admin'
    return lang === 'ar' ? 'عضو' : 'Member'
  }

  return (
    <div>
      <h1 className={s.pageTitle}>{copy.title[lang]}</h1>
      {err && <p className={s.error}>{err}</p>}
      <div className={s.toolbar}>
        <input
          className={s.input}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={copy.search[lang]}
        />
        <select className={s.select} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="all">{copy.all[lang]}</option>
          <option value="active">{lang === 'ar' ? 'نشط' : 'Active'}</option>
          <option value="suspended">{lang === 'ar' ? 'موقوف' : 'Suspended'}</option>
        </select>
      </div>
      {loading ? (
        <p className={s.muted}>…</p>
      ) : users.length === 0 ? (
        <p className={s.emptyState}>{copy.empty[lang]}</p>
      ) : (
        <div className={s.tableWrap}>
          <table className={s.table}>
            <thead>
              <tr>
                <th>{copy.name[lang]}</th>
                <th>{copy.email[lang]}</th>
                <th>{copy.role[lang]}</th>
                <th>{lang === 'ar' ? 'الحالة' : 'Status'}</th>
                <th>{lang === 'ar' ? 'إجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className={u.status === 'suspended' ? s.rowMuted : ''}>
                  <td>{u.name || '—'}</td>
                  <td>{u.email}</td>
                  <td>{roleLabel(u.role)}</td>
                  <td>
                    <span
                      className={`${s.badge} ${
                        u.status === 'suspended' ? s.badgeSuspended : s.badgeActive
                      }`}
                    >
                      {u.status === 'suspended'
                        ? lang === 'ar'
                          ? 'موقوف'
                          : 'Suspended'
                        : lang === 'ar'
                          ? 'نشط'
                          : 'Active'}
                    </span>
                  </td>
                  <td>
                    <div className={s.actions}>
                      {canManageUser(me, u) ? (
                        <>
                          <button
                            type="button"
                            className={`${s.btn} ${s.btnGhost}`}
                            onClick={() => openEdit(u)}
                          >
                            {copy.edit[lang]}
                          </button>
                          <button
                            type="button"
                            className={`${s.btn} ${s.btnGhost}`}
                            onClick={() => toggleSuspend(u)}
                          >
                            {u.status === 'suspended' ? copy.activate[lang] : copy.suspend[lang]}
                          </button>
                          <button
                            type="button"
                            className={`${s.btn} ${s.btnGhost}`}
                            onClick={() => resetPwd(u)}
                          >
                            {copy.reset[lang]}
                          </button>
                          <button
                            type="button"
                            className={`${s.btn} ${s.btnDanger}`}
                            onClick={() => remove(u)}
                          >
                            {copy.delete[lang]}
                          </button>
                        </>
                      ) : u.id === me?.id ? (
                        <span className={s.muted}>{lang === 'ar' ? '(أنت)' : '(you)'}</span>
                      ) : (
                        <span className={s.muted}>{lang === 'ar' ? 'لا صلاحية' : 'No access'}</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <div className={s.modalBackdrop} onClick={() => !editLoading && setEditing(null)}>
          <div className={s.modalCard} onClick={(e) => e.stopPropagation()}>
            <h2 className={s.pageTitle} style={{ fontSize: '1.1rem' }}>
              {copy.editTitle[lang]}
            </h2>
            <p className={s.muted}>{editing.email}</p>
            {editErr && <p className={s.error}>{editErr}</p>}
            <form className={s.formGrid} onSubmit={saveEdit}>
              <div className={s.field}>
                <label>{copy.name[lang]}</label>
                <input value={editName} onChange={(e) => setEditName(e.target.value)} />
              </div>
              {isSuper &&
                editing.id !== me?.id &&
                editing.role !== 'super_admin' && (
                  <div className={s.field}>
                    <label>{copy.role[lang]}</label>
                    <select value={editRole} onChange={(e) => setEditRole(e.target.value)}>
                      <option value="member">{lang === 'ar' ? 'عضو' : 'Member'}</option>
                      <option value="admin">{lang === 'ar' ? 'مدير' : 'Admin'}</option>
                    </select>
                  </div>
                )}
              {isSuper &&
                editing.id !== me?.id &&
                editing.role === 'super_admin' && (
                  <p className={s.muted}>
                    {lang === 'ar'
                      ? 'يمكن تعديل الاسم فقط لحساب مسؤول أعلى آخر.'
                      : 'Only the name can be edited for another Super Admin.'}
                  </p>
                )}
              <div className={s.modalActions}>
                <button
                  type="button"
                  className={`${s.btn} ${s.btnGhost}`}
                  onClick={() => setEditing(null)}
                  disabled={editLoading}
                >
                  {copy.cancel[lang]}
                </button>
                <button type="submit" className={s.btn} disabled={editLoading}>
                  {copy.save[lang]}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

import { useEffect, useMemo, useState } from 'react'
import { createTask, fetchTasks } from '../api/tasks'

export default function Tasks() {
  const [tasks, setTasks] = useState([])
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const canSubmit = useMemo(() => title.trim().length > 0 && !saving, [title, saving])

  async function load() {
    setLoading(true)
    setError('')
    try {
      const rows = await fetchTasks()
      setTasks(rows)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Request failed')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function onSubmit(e) {
    e.preventDefault()
    if (!canSubmit) return
    setSaving(true)
    setError('')
    try {
      const created = await createTask({ title: title.trim() })
      setTasks((prev) => [created, ...prev])
      setTitle('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Request failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ maxWidth: 720 }}>
      <h2 style={{ margin: '0 0 12px' }}>Tasks (example API integration)</h2>

      <form onSubmit={onSubmit} style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="New task title"
          style={{ flex: 1, padding: '10px 12px', borderRadius: 10, border: '1px solid #2a3341' }}
        />
        <button
          type="submit"
          disabled={!canSubmit}
          style={{ padding: '10px 14px', borderRadius: 10, cursor: canSubmit ? 'pointer' : 'not-allowed' }}
        >
          {saving ? 'Saving…' : 'Add'}
        </button>
      </form>

      {error ? (
        <div style={{ padding: 10, borderRadius: 10, background: '#3b1d1d', border: '1px solid #7a2f2f' }}>
          {error}
        </div>
      ) : null}

      {loading ? (
        <div style={{ opacity: 0.8 }}>Loading…</div>
      ) : (
        <ul style={{ marginTop: 12 }}>
          {tasks.map((t) => (
            <li key={t.id}>
              {t.title} {t.done ? '(done)' : ''}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}


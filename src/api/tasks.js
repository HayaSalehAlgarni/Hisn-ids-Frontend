import { getJsonAuth, postJsonAuth } from './client'

export async function fetchTasks() {
  const data = await getJsonAuth('/api/tasks')
  return Array.isArray(data) ? data : []
}

export async function createTask(payload) {
  return postJsonAuth('/api/tasks', payload)
}


import { Navigate, useLocation } from 'react-router-dom'
import { getStoredToken } from '../api/client'

export default function RequireAuth({ children, redirectTo = '/login' }) {
  const token = getStoredToken()
  const location = useLocation()
  if (!token) return <Navigate to={redirectTo} replace state={{ from: location.pathname }} />
  return children
}


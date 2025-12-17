import { useState, useEffect, useCallback, useMemo } from 'react'
import { apiService } from '../../services/api'
import './AdminUsers.css'

interface User {
  id: number
  email: string
  name: string
  role: string
  created_at: string
}

function AdminUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm])

  const loadUsers = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const response = await apiService.adminGetUsers(
        debouncedSearchTerm ? { search: debouncedSearchTerm } : undefined
      )
      if (response.error) {
        setError(response.error)
      } else {
        setUsers(response.data || [])
      }
    } catch (err) {
      setError('Ошибка загрузки пользователей')
    } finally {
      setLoading(false)
    }
  }, [debouncedSearchTerm])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  const handleToggleBlock = useCallback(async (userId: number) => {
    const response = await apiService.adminToggleUserBlock(userId)
    if (response.error) {
      setError(response.error)
    } else {
      loadUsers()
    }
  }, [loadUsers])

  const handleRoleChange = useCallback(async (userId: number, newRole: string) => {
    const response = await apiService.adminUpdateUser(userId, { role: newRole })
    if (response.error) {
      setError(response.error)
    } else {
      loadUsers()
    }
  }, [loadUsers])

  if (loading) {
    return <div className="admin-loading">Загрузка пользователей...</div>
  }

  return (
    <div className="admin-users">
      <div className="admin-section-header">
        <h2>Управление пользователями</h2>
        <input
          type="text"
          placeholder="Поиск по email или имени..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="admin-search-input"
        />
      </div>

      {error && <div className="admin-error-message">{error}</div>}

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Email</th>
              <th>Имя</th>
              <th>Роль</th>
              <th>Дата регистрации</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '20px' }}>
                  Пользователи не найдены
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.email}</td>
                  <td>{user.name || '-'}</td>
                  <td>
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      className="admin-role-select"
                    >
                      <option value="user">Пользователь</option>
                      <option value="admin">Администратор</option>
                      <option value="banned">Заблокирован</option>
                    </select>
                  </td>
                  <td>{new Date(user.created_at).toLocaleDateString('ru-RU')}</td>
                  <td>
                    <button
                      className="links admin-btn-small"
                      onClick={() => handleToggleBlock(user.id)}
                    >
                      {user.role === 'banned' ? 'Разблокировать' : 'Заблокировать'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default AdminUsers


import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import './AuthModal.css'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  initialMode?: 'login' | 'register'
}

function AuthModal({ isOpen, onClose, initialMode = 'login' }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { login, register } = useAuth()

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode)
      setError('')
    }
  }, [initialMode, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      let result
      if (mode === 'login') {
        result = await login(email, password)
      } else {
        result = await register(email, password, name)
      }

      if (result.success) {
        onClose()
        setEmail('')
        setPassword('')
        setName('')
      } else {
        setError(result.error || 'Произошла ошибка')
      }
    } catch (err) {
      setError('Произошла ошибка при выполнении запроса')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="auth-modal-close" onClick={onClose}>×</button>
        <h2>{mode === 'login' ? 'Вход' : 'Регистрация'}</h2>
        
        <form onSubmit={handleSubmit}>
          {mode === 'register' && (
            <div className="auth-form-group">
              <label htmlFor="name">Имя</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ваше имя"
              />
            </div>
          )}
          
          <div className="auth-form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@mail.com"
              required
            />
          </div>
          
          <div className="auth-form-group">
            <label htmlFor="password">Пароль</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Минимум 6 символов"
              required
              minLength={6}
            />
          </div>

          {error && <div className="auth-error">{error}</div>}

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? 'Загрузка...' : mode === 'login' ? 'Войти' : 'Зарегистрироваться'}
          </button>
        </form>

        <div className="auth-modal-footer">
          {mode === 'login' ? (
            <p>
              Нет аккаунта?{' '}
              <button type="button" onClick={() => setMode('register')} className="auth-link-btn">
                Зарегистрироваться
              </button>
            </p>
          ) : (
            <p>
              Уже есть аккаунт?{' '}
              <button type="button" onClick={() => setMode('login')} className="auth-link-btn">
                Войти
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default AuthModal


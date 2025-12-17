import { useState, useEffect } from 'react'
import { apiService } from '../services/api'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Blog.css'

interface Post {
  id: number
  title: string
  content: string
  category: string
  created_at: string
  user_id: number
  product_id?: number
  product_title?: string
}

function Blog() {
  const { isAuthenticated } = useAuth()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState({ title: '', content: '', category: 'blog' })

  useEffect(() => {
    loadPosts()
  }, [])

  const loadPosts = async () => {
    setLoading(true)
    setError('')
    const response = await apiService.getPosts()
    if (response.error) {
      setError(response.error)
    } else {
      setPosts(response.data || [])
    }
    setLoading(false)
  }

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.content) {
      setError('Заголовок и содержание обязательны')
      return
    }

    setError('')
    const response = await apiService.createPost(
      formData.title,
      formData.content,
      formData.category
    )

    if (response.error) {
      setError(response.error)
    } else {
      setFormData({ title: '', content: '', category: 'blog' })
      setShowCreateForm(false)
      loadPosts()
    }
  }

  if (loading) {
    return (
      <section className="blog-section">
        <div className="blog-loading">Загрузка блога...</div>
      </section>
    )
  }

  return (
    <section className="blog-section">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Блог</h2>
        {isAuthenticated && (
          <button className="links" onClick={() => setShowCreateForm(!showCreateForm)}>
            {showCreateForm ? 'Отмена' : '+ Создать запись'}
          </button>
        )}
      </div>

      {showCreateForm && isAuthenticated && (
        <form onSubmit={handleCreatePost} className="blog-create-form">
          <div className="blog-form-field">
            <label>Заголовок *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>
          <div className="blog-form-field">
            <label>Категория</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              <option value="blog">Блог</option>
              <option value="review">Обзор</option>
              <option value="news">Новости</option>
            </select>
          </div>
          <div className="blog-form-field">
            <label>Содержание *</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={6}
              required
            />
          </div>
          <button type="submit" className="links">Опубликовать</button>
        </form>
      )}

      {error && <div className="blog-error">{error}</div>}
      {posts.length === 0 ? (
        <div className="blog-empty">
          <p>Пока нет записей в блоге.</p>
        </div>
      ) : (
        <div className="blog-posts">
          {posts.map((post) => (
            <article key={post.id} className="blog-post">
              <h3>{post.title}</h3>
              <div className="blog-meta">
                <span className="blog-category">{post.category || 'Общее'}</span>
                <span className="blog-date">
                  {new Date(post.created_at).toLocaleDateString('ru-RU')}
                </span>
              </div>
              <div className="blog-content">{post.content}</div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

export default Blog


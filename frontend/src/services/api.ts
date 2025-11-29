const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

class ApiService {
  private getAuthToken(): string | null {
    return localStorage.getItem('token')
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const token = this.getAuthToken()
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      })

      let data
      const contentType = response.headers.get('content-type')
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json()
      } else {
        const text = await response.text()
        console.error('Неожиданный ответ от сервера (не JSON):', text.substring(0, 200))
        return {
          error: 'Сервер вернул неожиданный ответ. Проверьте консоль для деталей.',
        }
      }

      if (!response.ok) {
        return {
          error: data.error || data.message || 'Произошла ошибка',
        }
      }

      // Если ответ уже содержит data, возвращаем его как есть
      if (data.data) {
        return { data: data.data }
      }

      return { data }
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Ошибка сети',
      }
    }
  }

  // Auth endpoints
  async register(email: string, password: string, name?: string) {
    return this.request<{ token: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    })
  }

  async login(email: string, password: string) {
    return this.request<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  }

  // Posts endpoints
  async getPosts() {
    return this.request<any[]>('/posts')
  }

  async getPostById(id: number) {
    return this.request<any>(`/posts/${id}`)
  }

  // Products endpoints
  async getProducts() {
    return this.request<any[]>('/products')
  }

  async getProductById(id: number) {
    return this.request<any>(`/products/${id}`)
  }

  // Music endpoints
  async getMusic() {
    return this.request<any[]>('/music')
  }

  async getMusicById(id: number) {
    return this.request<any>(`/music/${id}`)
  }

  async createPost(title: string, content: string, category?: string) {
    return this.request<any>('/posts', {
      method: 'POST',
      body: JSON.stringify({ title, content, category }),
    })
  }

  async updatePost(id: number, title: string, content: string, category?: string) {
    return this.request<any>(`/posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ title, content, category }),
    })
  }

  async deletePost(id: number) {
    return this.request<{ message: string }>(`/posts/${id}`, {
      method: 'DELETE',
    })
  }

  // Orders endpoints
  async getOrders() {
    return this.request<any[]>('/orders')
  }

  async createOrder(productId: number, quantity: number = 1, address?: string, cardNumber?: string) {
    return this.request<any>('/orders', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity, address, cardNumber }),
    })
  }

  // Favorites endpoints
  async getFavorites() {
    return this.request<any[]>('/favorites')
  }

  async addToFavorites(productId: number) {
    return this.request<{ message: string }>('/favorites', {
      method: 'POST',
      body: JSON.stringify({ productId }),
    })
  }

  async removeFromFavorites(productId: number) {
    return this.request<{ message: string }>(`/favorites/${productId}`, {
      method: 'DELETE',
    })
  }

  async checkFavorite(productId: number) {
    return this.request<{ isFavorite: boolean }>(`/favorites/check/${productId}`)
  }
}

export const apiService = new ApiService()


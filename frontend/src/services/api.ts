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

      const data = await response.json()

      if (!response.ok) {
        return {
          error: data.error || data.message || 'Произошла ошибка',
        }
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
}

export const apiService = new ApiService()


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

      // Для auth endpoints (login/register) - ответ имеет структуру { message, token, user }
      if (data.token && data.user) {
        return { data: { token: data.token, user: data.user } }
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
  async getPosts(productId?: number) {
    const url = productId ? `/posts?product_id=${productId}` : '/posts'
    return this.request<any[]>(url)
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

  async getProductReviews(id: number) {
    return this.request<any[]>(`/products/${id}/reviews`)
  }

  // Music endpoints
  async getMusic() {
    return this.request<any[]>('/music')
  }

  async getMusicById(id: number) {
    return this.request<any>(`/music/${id}`)
  }

  async createPost(title: string, content: string, category?: string, productId?: number) {
    return this.request<any>('/posts', {
      method: 'POST',
      body: JSON.stringify({ title, content, category, product_id: productId }),
    })
  }

  // Reviews endpoints (for regular users)
  async createReview(productId: number, rating: number, text: string) {
    return this.request<any>('/reviews', {
      method: 'POST',
      body: JSON.stringify({ productId, rating, text }),
    })
  }

  async getProductReviews(productId: number) {
    return this.request<any[]>(`/reviews/product/${productId}`)
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

  async cancelOrder(orderId: number) {
    return this.request<any>(`/orders/${orderId}/cancel`, {
      method: 'PATCH',
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

  // Admin endpoints - Products
  async adminGetProducts() {
    return this.request<any[]>('/admin/products')
  }

  async adminGetProductById(id: number) {
    return this.request<any>(`/admin/products/${id}`)
  }

  async adminCreateProduct(product: any) {
    return this.request<any>('/admin/products', {
      method: 'POST',
      body: JSON.stringify(product),
    })
  }

  async adminUpdateProduct(id: number, product: any) {
    return this.request<any>(`/admin/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(product),
    })
  }

  async adminDeleteProduct(id: number) {
    return this.request<{ message: string }>(`/admin/products/${id}`, {
      method: 'DELETE',
    })
  }

  // Admin endpoints - Orders
  async adminGetOrders(filters?: { status?: string; userId?: number; productId?: number }) {
    const params = new URLSearchParams()
    if (filters?.status) params.append('status', filters.status)
    if (filters?.userId) params.append('userId', filters.userId.toString())
    if (filters?.productId) params.append('productId', filters.productId.toString())
    const query = params.toString()
    return this.request<any[]>(`/admin/orders${query ? `?${query}` : ''}`)
  }

  async adminGetOrderById(id: number) {
    return this.request<any>(`/admin/orders/${id}`)
  }

  async adminUpdateOrderStatus(id: number, status: string) {
    return this.request<any>(`/admin/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    })
  }

  // Admin endpoints - Users
  async adminGetUsers(filters?: { search?: string; role?: string }) {
    const params = new URLSearchParams()
    if (filters?.search) params.append('search', filters.search)
    if (filters?.role) params.append('role', filters.role)
    const query = params.toString()
    return this.request<any[]>(`/admin/users${query ? `?${query}` : ''}`)
  }

  async adminGetUserById(id: number) {
    return this.request<any>(`/admin/users/${id}`)
  }

  async adminUpdateUser(id: number, user: any) {
    return this.request<any>(`/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(user),
    })
  }

  async adminResetUserPassword(id: number, newPassword: string) {
    return this.request<{ message: string }>(`/admin/users/${id}/reset-password`, {
      method: 'POST',
      body: JSON.stringify({ newPassword }),
    })
  }

  async adminToggleUserBlock(id: number) {
    return this.request<any>(`/admin/users/${id}/block`, {
      method: 'PATCH',
    })
  }

  // Admin endpoints - Reviews
  async adminGetReviews(filters?: { productId?: number; userId?: number; approved?: boolean; rating?: number }) {
    const params = new URLSearchParams()
    if (filters?.productId) params.append('productId', filters.productId.toString())
    if (filters?.userId) params.append('userId', filters.userId.toString())
    if (filters?.approved !== undefined) params.append('approved', filters.approved.toString())
    if (filters?.rating) params.append('rating', filters.rating.toString())
    const query = params.toString()
    return this.request<any[]>(`/admin/reviews${query ? `?${query}` : ''}`)
  }

  async adminGetReviewById(id: number) {
    return this.request<any>(`/admin/reviews/${id}`)
  }

  async adminToggleReviewApproval(id: number, approved: boolean) {
    return this.request<any>(`/admin/reviews/${id}/approval`, {
      method: 'PATCH',
      body: JSON.stringify({ approved }),
    })
  }

  async adminAddReviewResponse(id: number, adminResponse: string) {
    return this.request<any>(`/admin/reviews/${id}/response`, {
      method: 'POST',
      body: JSON.stringify({ admin_response: adminResponse }),
    })
  }

  async adminDeleteReview(id: number) {
    return this.request<{ message: string }>(`/admin/reviews/${id}`, {
      method: 'DELETE',
    })
  }

  async adminGenerateReviews() {
    return this.request<any>('/admin/reviews/generate', {
      method: 'POST',
    })
  }

  async adminCreateReview(userId: number, productId: number, rating: number, text: string) {
    return this.request<any>('/admin/reviews', {
      method: 'POST',
      body: JSON.stringify({ userId, productId, rating, text }),
    })
  }

  // Admin endpoints - Analytics
  async adminGetAnalytics() {
    return this.request<any>('/admin/analytics')
  }

  async adminGetSalesChart(period?: 'day' | 'week' | 'month') {
    const params = new URLSearchParams()
    if (period) params.append('period', period)
    const query = params.toString()
    return this.request<any[]>(`/admin/analytics/sales-chart${query ? `?${query}` : ''}`)
  }
}

export const apiService = new ApiService()


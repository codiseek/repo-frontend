// Используем относительные пути благодаря proxy
const API_BASE = '/api/auth';

export class AuthService {
  static async makeRequest(url, options) {
    try {
      console.log('Sending request to:', url, 'with options:', options);
      
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      // Проверяем Content-Type перед парсингом
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Expected JSON but got:', contentType, 'Content:', text.substring(0, 200));
        throw new Error(`Server returned non-JSON response: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Response data:', data);
      
      if (!response.ok) {
        const error = new Error(data.error || `HTTP error! status: ${response.status}`);
        error.data = data;
        error.status = response.status;
        throw error;
      }
      
      return data;
      
    } catch (error) {
      console.error('Request error details:', error);
      
      if (error.name === 'TypeError') {
        throw new Error('Не удалось подключиться к серверу. Проверьте, запущен ли бэкенд.');
      }
      
      throw error;
    }
  }


  static async register(login) {
    return this.makeRequest(`${API_BASE}/register/`, {
      method: 'POST',
      body: JSON.stringify({ login }),
    });
  }

  static async checkLogin(login) {
    return this.makeRequest(`${API_BASE}/check-login/`, {
      method: 'POST',
      body: JSON.stringify({ login }),
    });
  }

  static async login(login, password) {
    return this.makeRequest(`${API_BASE}/login/`, {
      method: 'POST',
      body: JSON.stringify({ login, password }),
    });
  }

  static async verifyToken(token) {
    return this.makeRequest(`${API_BASE}/verify-token/`, {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

  static async changePassword(token, newPassword) {
    return this.makeRequest(`${API_BASE}/change-password/`, {
      method: 'POST',
      body: JSON.stringify({ token, new_password: newPassword }),
    });
  }

  static async getPosts() {
    return this.makeRequest(`${API_BASE}/posts/`, {
      method: 'GET',
    });
  }

  static async createPost(token, content) {
    return this.makeRequest(`${API_BASE}/posts/create/`, {
      method: 'POST',
      body: JSON.stringify({ token, content }),
    });
  }

  static async toggleLike(token, postId) {
    return this.makeRequest(`${API_BASE}/posts/like/`, {
      method: 'POST',
      body: JSON.stringify({ token, post_id: postId }),
    });
  }


  // Добавим метод для проверки пароля
static async verifyPassword(login, password) {
  return this.makeRequest(`${API_BASE}/login/`, {
    method: 'POST',
    body: JSON.stringify({ login, password }),
  });
}


  static async addComment(token, postId, content) {
    return this.makeRequest(`${API_BASE}/posts/comment/`, {
      method: 'POST',
      body: JSON.stringify({ token, post_id: postId, content }),
    });
  }

  static saveToken(token) {
    localStorage.setItem('auth_token', token);
  }

  static getToken() {
    return localStorage.getItem('auth_token');
  }

  static logout() {
    localStorage.removeItem('auth_token');
  }
}
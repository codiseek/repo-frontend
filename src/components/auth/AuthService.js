// Используем относительные пути благодаря proxy
const API_BASE = process.env.NODE_ENV === 'production' 
  ? 'https://repo-backend-kckq.onrender.com/api/auth'
  : '/api/auth';

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
      
      // Получаем текст ответа для анализа
      const responseText = await response.text();
      console.log('Response text:', responseText);
      
      // Если ответ пустой, но статус успешный (200 или 201), считаем это успехом
      if ((response.status === 200 || response.status === 201) && (!responseText || responseText.trim() === '')) {
        console.log('Empty response with success status, returning success');
        return { success: true };
      }
      
      // Пытаемся распарсить JSON
      let data;
      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        // Если не JSON, но статус успешный, возвращаем текст
        if (response.ok || response.status === 201) {
          return { text: responseText, success: true };
        } else {
          throw new Error(`Server returned non-JSON response: ${response.status} ${response.statusText}. Content: ${responseText.substring(0, 100)}`);
        }
      }
      
      console.log('Response data:', data);
      
      // Считаем успешными статусы 200 и 201
      if (!response.ok && response.status !== 201) {
        const error = new Error(data.error || data.message || `HTTP error! status: ${response.status}`);
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

  // ... остальные методы без изменений
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
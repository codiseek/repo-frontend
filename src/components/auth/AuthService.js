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
      
      // Проверяем, есть ли контент
      const contentLength = response.headers.get('content-length');
      const contentType = response.headers.get('content-type');
      
      // Если ответ пустой (статус 200 но нет контента), возвращаем пустой объект
      if (response.status === 200 && (!contentLength || contentLength === '0')) {
        console.log('Empty response received, returning empty object');
        return {};
      }
      
      // Если есть контент, но не JSON, обрабатываем как текст
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.log('Non-JSON response:', text.substring(0, 200));
        
        // Если текст пустой, возвращаем пустой объект
        if (!text.trim()) {
          return {};
        }
        
        // Пытаемся распарсить как JSON, если не получается - возвращаем текст
        try {
          const data = JSON.parse(text);
          return data;
        } catch (e) {
          return { text };
        }
      }
      
      // Стандартная обработка JSON
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
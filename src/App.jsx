import React, { useState, useEffect } from 'react';
import RegisterForm from './components/auth/RegisterForm';
import LoginForm from './components/auth/LoginForm';
import HomePage from './pages/HomePage';
import { AuthService } from './components/auth/AuthService';

function App() {
  const [registrationData, setRegistrationData] = useState(null);
  const [currentView, setCurrentView] = useState('register');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = AuthService.getToken();
    if (token) {
      try {
        const result = await AuthService.verifyToken(token);
        if (result.valid) {
          setUser(result.user);
        } else {
          AuthService.logout();
        }
      } catch (err) {
        AuthService.logout();
      }
    }
    setLoading(false);
  };

  // Обработчик успешной регистрации
  const handleRegistrationSuccess = (user, generatedPassword) => {
    setUser(user);
    setRegistrationData({
      user,
      generatedPassword
    });
  };

  // Обработчик успешного входа
  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    AuthService.logout();
    setUser(null);
    setRegistrationData(null); // Очищаем данные регистрации при выходе
    setCurrentView('register');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-gray-400">Проверяем авторизацию...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return (
      <HomePage 
        user={user} 
        onLogout={handleLogout}
        registrationData={registrationData}
      />
    );
  }

  return (
    <>
      {currentView === 'register' ? (
        <RegisterForm
          onSwitchToLogin={() => setCurrentView('login')}
          onSuccess={handleRegistrationSuccess} // Используем правильный обработчик
        />
      ) : (
        <LoginForm
          onSwitchToRegister={() => setCurrentView('register')}
          onSuccess={handleLoginSuccess}
        />
      )}
    </>
  );
}

export default App;
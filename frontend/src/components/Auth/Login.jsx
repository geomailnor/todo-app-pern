import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { loginUser } from '../../api';
import { useAuth } from '../../contexts/AuthContext';

const Login = ({ onSwitchToRegister }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState({});

  const { login } = useAuth();

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData(prev => ({ ...prev, [e.target.name]: value }));
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email.trim()) newErrors.email = 'Имейлът е задължителен';
    if (!formData.password) newErrors.password = 'Паролата е задължителна';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      const result = await loginUser({
        email: formData.email,
        password: formData.password,
        rememberMe: formData.rememberMe
      });

      login(result.user, result.token, formData.rememberMe);
      toast.success('Успешен вход!');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2 className="auth-title">Вход</h2>

      <form onSubmit={onSubmit} className="auth-form">
        <div className="auth-form-group">
          <label className="auth-label">Имейл</label>
          <input
            type="email"
            name="email"
            className="auth-input"
            value={formData.email}
            onChange={handleChange}
            placeholder="имейл тук"
          />
          {errors.email && <p className="auth-error">{errors.email}</p>}
        </div>

        <div className="auth-form-group">
          <label className="auth-label">Парола</label>
          <input
            type="password"
            name="password"
            className="auth-input"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
          />
          {errors.password && <p className="auth-error">{errors.password}</p>}
        </div>

        <div className="auth-remember">
          <label className="auth-checkbox-label">
            <input
              type="checkbox"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleChange}
              className="auth-checkbox"
            />
            Запомни ме
          </label>
        </div>

        <button
          type="submit"
          className="auth-submit-btn login-btn"
          disabled={isLoading}
        >
          {isLoading ? 'Вход...' : 'Вход'}
        </button>
      </form>

      <p className="auth-switch">
        Нямаш акаунт?{' '}
        <button
          type="button"
          className="auth-switch-btn"
          onClick={onSwitchToRegister}
        >
          Регистрация
        </button>
      </p>
    </div>
  );
};

export default Login;
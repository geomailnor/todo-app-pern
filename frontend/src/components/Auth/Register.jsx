import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { registerUser } from '../../api';

const Register = ({ onSwitchToLogin }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev, [e.target.name]: e.target.value
    }));
    // Изчистване на грешка при писане
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Името е задължително';
    if (!formData.email.trim()) newErrors.email = 'Имейлът е задължителен';
    if (!formData.password) newErrors.password = 'Паролата е задължителна';
    if (formData.password.length < 6) newErrors.password = 'Паролата трябва да е поне 6 символа';
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Паролите не съвпадат';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      await registerUser({
        name: formData.name,
        email: formData.email,
        password: formData.password
      });

      toast.success('Регистрацията е успешна! Моля, влезте.');
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
      });
      onSwitchToLogin();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2 className="auth-title">Регистрация</h2>

      <form onSubmit={onSubmit} className="auth-form">
        <div className="auth-form-group">
          <label className="auth-label">Име</label>
          <input
            type="text"
            name="name"
            className="auth-input"
            value={formData.name}
            onChange={handleChange}
          />
          {errors.name && <p className="auth-error">{errors.name}</p>}
        </div>

        <div className="auth-form-group">
          <label className="auth-label">Имейл</label>
          <input
            type="email"
            name="email"
            className="auth-input"
            value={formData.email}
            onChange={handleChange}
            placeholder=""
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
            autoComplete="new-password"
          />
          {errors.password && <p className="auth-error">{errors.password}</p>}
        </div>

        <div className="auth-form-group">
          <label className="auth-label">Потвърди парола</label>
          <input
            type="password"
            name="confirmPassword"
            className="auth-input"
            value={formData.confirmPassword}
            onChange={handleChange}
            autoComplete="new-password"
          />
          {errors.confirmPassword && <p className="auth-error">{errors.confirmPassword}</p>}
        </div>

        <button
          type="submit"
          className="auth-submit-btn register-btn"
          disabled={isLoading}
        >
          {isLoading ? 'Регистриране...' : 'Регистрация'}
        </button>
      </form>

      <p className="auth-switch">
        Вече имаш акаунт?{' '}
        <button
          type="button"
          className="auth-switch-btn"
          onClick={onSwitchToLogin}
        >
          Влез
        </button>
      </p>
    </div>
  );
};

export default Register;
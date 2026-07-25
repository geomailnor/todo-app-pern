import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const Profile = () => {
  const { user, token, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });
  // 👇 НОВО: отделно състояние за формата за редакция
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Зареждане на профила
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = {
          name: response.data.name,
          email: response.data.email
        };
        setFormData(data);
        setEditFormData(data);  // 👈 Инициализираме и двете
      } catch (error) {
        console.error('Грешка при зареждане на профила:', error);
        toast.error('Грешка при зареждане на профила');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [token]);

  // Отваряне на формата за редакция
  const startEditing = () => {
    setEditFormData(formData);  // 👈 Копираме текущите стойности
    setIsEditing(true);
  };

  // Отказ от редакция
  const cancelEditing = () => {
    setIsEditing(false);
    // НЕ променяме formData – запазваме оригиналните стойности
  };

  // Обновяване на профила
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(`${API_URL}/api/users/me`, editFormData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const updatedUser = response.data;
      setFormData(updatedUser);  // 👈 Обновяваме показваните данни
      localStorage.setItem('user', JSON.stringify(updatedUser));

      toast.success('Профилът е обновен успешно!');
      setIsEditing(false);
    } catch (error) {
      console.error('Грешка при обновяване:', error);
      toast.error(error.response?.data?.message || 'Грешка при обновяване на профила');
    }
  };

  // Промяна на парола
  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Новите пароли не съвпадат!');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Паролата трябва да е поне 6 символа');
      return;
    }

    try {
      await axios.put(`${API_URL}/api/users/password`, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Паролата е променена успешно!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Грешка при промяна на парола:', error);
      toast.error(error.response?.data?.message || 'Грешка при промяна на паролата');
    }
  };

  // Изтриване на профил
  const handleDeleteProfile = async () => {
    try {
      await axios.delete(`${API_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Профилът е изтрит успешно');
      logout();
    } catch (error) {
      console.error('Грешка при изтриване:', error);
      toast.error('Грешка при изтриване на профила');
    }
  };

  if (loading) {
    return <div className="profile-loading">⏳ Зареждане на профила...</div>;
  }

  return (
    <div className="profile-container">
      <h2 className="profile-title">👤 Моят профил</h2>

      {/* Информация за профила - само за показване */}
      <div className="profile-card">
        <div className="profile-info">
          <div className="profile-field">
            <label>Име</label>
            <p>{formData.name}</p>
          </div>
          <div className="profile-field">
            <label>Имейл</label>
            <p>{formData.email}</p>
          </div>
          <button
            className="profile-edit-btn"
            onClick={startEditing}
          >
            ✏️ Редактирай профил
          </button>
        </div>
      </div>

      {/* Форма за редактиране - със собствено състояние */}
      {isEditing && (
        <div className="profile-card">
          <h3>Редактиране на профил</h3>
          <form onSubmit={handleUpdateProfile} className="profile-form">
            <div className="form-group">
              <label>Име</label>
              <input
                type="text"
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Имейл</label>
              <input
                type="email"
                value={editFormData.email}
                onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                required
              />
            </div>
            <div className="profile-form-actions">
              <button type="submit" className="save-btn">💾 Запази</button>
              <button
                type="button"
                className="cancel-btn"
                onClick={cancelEditing}
              >
                ❌ Отказ
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Смяна на парола */}
      <div className="profile-card">
        <h3>🔑 Смяна на парола</h3>
        <form onSubmit={handleChangePassword} className="profile-form">
          <div className="form-group">
            <label>Текуща парола</label>
            <input
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Нова парола</label>
            <input
              type="password"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Потвърди нова парола</label>
            <input
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              required
            />
          </div>
          <button type="submit" className="password-btn">🔄 Промени парола</button>
        </form>
      </div>

      {/* Изтриване на профил */}
      <div className="profile-card danger-card">
        <h3>⚠️ Опасна зона</h3>
        <p className="danger-text">
          Изтриването на профила е необратимо! Всички ваши задачи ще бъдат загубени.
        </p>
        {!showDeleteConfirm ? (
          <button
            className="danger-btn"
            onClick={() => setShowDeleteConfirm(true)}
            title='Изтрива профила!'
          >
            🗑️ Изтрий профил
          </button>
        ) : (
          <div className="delete-confirm">
            <p className="confirm-text">Сигурни ли сте? Това действие е необратимо!</p>
            <div className="delete-confirm-actions">
              <button
                className="danger-btn confirm-yes"
                onClick={handleDeleteProfile}
              >
                ✅ Да, изтрий
              </button>
              <button
                className="cancel-btn"
                onClick={() => setShowDeleteConfirm(false)}
              >
                ❌ Отказ
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
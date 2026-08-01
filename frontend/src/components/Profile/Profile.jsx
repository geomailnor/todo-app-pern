import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const Profile = () => {
  const { user, token, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });
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
  const firstInputRef = useRef(null);
  // Затваряне на модала
  const closeEditModal = useCallback(() => {
    setEditFormData(formData);
    setShowEditModal(false);
  }, [formData]);

  // Escape key handler
  useEffect(() => {
    if (!showEditModal) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        closeEditModal();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showEditModal, closeEditModal]);

  // Scroll lock - предотвратява скролиране на страницата когато модала е отворен
  useEffect(() => {
    if (showEditModal) {
      const scrollY = window.scrollY;

      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';

      return () => {
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [showEditModal]);

  // Focus trap - задържа фокуса в модала
  useEffect(() => {
    if (!showEditModal) return;

    const modalElement = document.querySelector('.modal-frm');
    if (!modalElement) return;

    const focusableElements = modalElement.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    // Фокусиране на първия елемент
    requestAnimationFrame(() => {
      if (firstInputRef.current) {
        firstInputRef.current.focus();
      } else {
        const input = modalElement.querySelector('input, button');
        if (input) input.focus();
      }
    });

    document.addEventListener('keydown', handleTabKey);

    return () => {
      document.removeEventListener('keydown', handleTabKey);
    };
  }, [showEditModal]);

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
        setEditFormData(data);
      } catch (error) {
        console.error('Грешка при зареждане на профила:', error);
        toast.error('Грешка при зареждане на профила');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [token]);

  // Отваряне на модала
  const openEditModal = () => {
    setEditFormData(formData);
    setShowEditModal(true);
  };

  // Обновяване на профила
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(`${API_URL}/api/users/me`, editFormData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const updatedUser = response.data;
      setFormData(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));

      toast.success('Профилът е обновен успешно!');
      setShowEditModal(false);
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

      {/* Информация за профила */}
      <div className="profile-card">
        <div className="profile-info">
          <div className="profile-field">
            <label>Име:</label>
            <p>{formData.name}</p>
          </div>
          <div className="profile-field">
            <label>Имейл:</label>
            <p>{formData.email}</p>
          </div>
          <button
            className="profile-edit-btn"
            onClick={openEditModal}
            title="Редактиране на профила"
          >
            ✏️ Редактирай профил
          </button>
        </div>
      </div>

      {/* 🟢 МОДАЛ ЗА РЕДАКТИРАНЕ */}
      {showEditModal && (
        <div className="modal-overlay" onClick={closeEditModal}>
          <div className="modal-frm" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={closeEditModal}>
              &times;
            </button>
            <h2>✏️ Редактиране на профил</h2>

            <form onSubmit={handleUpdateProfile}>
              <div className="form-group">
                <label htmlFor="edit-name">Име</label>
                <input
                  id="edit-name"
                  ref={firstInputRef}
                  className="input input-modal"
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  placeholder="Въведете име..."
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-email">Имейл</label>
                <input
                  id="edit-email"
                  className="input input-modal"
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  placeholder="Въведете имейл..."
                  required
                />
              </div>

              <div className="modal-btns">
                <button type="submit" className="save-btn" title='Запазва промените'>
                  💾 Запази
                </button>
                <button
                  type="button"
                  className="cancel-btn"
                  title='Отказва промените'
                  onClick={closeEditModal}
                >
                  ❌ Отказ
                </button>
              </div>
            </form>
          </div>
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
          <button type="submit" className="password-btn" title='Променя паролата'>🔄 Промени парола</button>
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
            title='Изтрива завинаги профила !'
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
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { FaPlus, FaTrash, FaCheck, FaEdit, FaSignOutAlt, FaUser, FaArrowLeft } from 'react-icons/fa';
import toast, { Toaster } from 'react-hot-toast';
import './App.css';
import Auth from './components/Auth/Auth';
import Profile from './components/Profile/Profile';
import { useAuth } from './contexts/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function App() {
  const location = useLocation();
  const isProfilePage = location.pathname === '/profile';

  // ✅ ВСИЧКИ HOOKS НА ЕДНО МЯСТО - ПРЕДИ ВСИЧКИ RETURN
  const { isAuthenticated, loading: authLoading, logout } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [taskText, setTaskText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editedText, setEditedText] = useState('');
  const [isToggling, setIsToggling] = useState(false);
  // ✅ ФУНКЦИИТЕ
  const getHeaders = () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    return {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };
  };

  async function loadTasks() {
    try {
      setIsLoading(true);
      const res = await axios.get(`${API_URL}/api/todos`, getHeaders());
      setTasks(res.data.tasks || []);
    } catch (error) {
      console.error('Грешка при зареждане', error);
      if (error.response?.status === 401) {
        toast.error('Сесията ви е изтекла. Моля, влезте отново!');
        logout();
      } else {
        setTasks([]);
        toast.error('Грешка при зареждане на задачите!');
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function addTask() {
    if (!taskText.trim()) {
      toast.error('Моля, напишете бележка!');
      return;
    }
    try {
      const res = await axios.post(`${API_URL}/api/todos`,
        { task: taskText },
        getHeaders()
      );
      setTasks((prevTasks) => [res.data, ...prevTasks]);
      setTaskText('');
      toast.success('Бележката е добавена!');
    } catch (error) {
      console.error('Грешка при създаване', error);
      if (error.response?.status === 401) {
        toast.error('Сесията ви е изтекла. Моля, влезте отново!');
        logout();
      } else {
        toast.error('Грешка при добавяне на бележка!');
      }
    }
  }

  async function toggleTask(id, completed) {
    // Предотвратяваме множество кликове
    if (isToggling) return;
    setIsToggling(true);
    // Запазваме текущото състояние за при грешка
    const previousTasks = [...tasks];

    // 💡 Оптимистично обновяване - веднага променяме UI-то
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === id ? { ...task, completed } : task
      )
    );

    try {
      await axios.put(`${API_URL}/api/todos/${id}`,
        { completed },
        getHeaders()
      );
      // ✅ Върнати текстови съобщения
      toast.success(completed ? 'Бележката е изпълнена!' : 'Бележката е възстановена');
    } catch (error) {
      console.error('Грешка при обновяване', error);

      // 🔄 Връщаме старата стойност при грешка
      setTasks(previousTasks);

      if (error.response?.status === 401) {
        toast.error('Сесията ви е изтекла. Моля, влезте отново!');
        logout();
      } else {
        toast.error('Грешка при обновяване на статуса');
      }
    }
    finally {
      // 🔓 Освобождаваме блокировката
      setIsToggling(false);
    }
  }

  async function updateTask(id) {
    if (!editedText.trim()) {
      toast.error('Моля, напишете текст!');
      return;
    }
    try {
      await axios.put(`${API_URL}/api/todos/text/${id}`,
        { task: editedText },
        getHeaders()
      );
      setTasks((prevTasks) => prevTasks.map((task) =>
        task.id === id ? { ...task, task: editedText } : task
      ));
      setEditingId(null);
      setEditedText('');
      toast.success('Бележката е обновена успешно!');
    } catch (error) {
      console.error('Грешка при обновяване', error);
      if (error.response?.status === 401) {
        toast.error('Сесията ви е изтекла. Моля, влезте отново!');
        logout();
      } else {
        toast.error('Грешка при обновяване на бележката!');
      }
    }
  }

  async function deleteTask(id) {
    try {
      await axios.delete(`${API_URL}/api/todos/${id}`, getHeaders());
      setTasks((tasks) => tasks.filter((task) => task.id !== id));
      toast.success('Бележката е изтрита!');
    } catch (error) {
      console.error('Грешка при изтриване', error);
      if (error.response?.status === 401) {
        toast.error('Сесията ви е изтекла. Моля, влезте отново!');
        logout();
      } else {
        toast.error('Грешка при изтриване на бележка!');
      }
    }
  }

  function startEditing(task) {
    setEditingId(task.id);
    setEditedText(task.task);
  }

  function cancelEditing() {
    setEditingId(null);
    setEditedText('');
  }

  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token && isAuthenticated) {
      loadTasks();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // ✅ ВСИЧКИ RETURN-И СА НАКРАЯ, СЛЕД ВСИЧКИ HOOKS

  // Показване на Login, ако не е автентициран
  if (!authLoading && !isAuthenticated) {
    return (
      <>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
              padding: '16px',
              borderRadius: '8px',
            },
          }}
        />
        <Auth />
      </>
    );
  }
  // Показване на зареждане
  if (authLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        fontSize: '24px'
      }}>
        ⏳ Зареждане...
      </div>
    );
  }

  return (
    <div className='app-container'>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
            padding: '16px',
            borderRadius: '8px',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#4ade80',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />

      <header className='my-header'>
        <div>
          <h1>{isProfilePage ? 'Моят профил' : 'Моите бележки'}</h1>
        </div>
        {!isProfilePage && ( // 👈 СТАТИСТИКИ САМО НА ГЛАВНАТА
          <div className='task-statist'>
            <span>общо: {tasks.length}</span>
            <span>изпълнени: {tasks.filter((task) => task.completed).length}</span>
          </div>
        )}
        <div className="header-actions">
          {isProfilePage ? ( // 👈 КОГАТО СМЕ В ПРОФИЛА
            <Link to="/" className="header-btns back-btn">
              <FaArrowLeft /> Назад
            </Link>
          ) : ( // 👈 КОГАТО СМЕ В СПИСЪКА
            <Link to="/profile" className="header-btns profile-btn">
              <FaUser /> Профил
            </Link>
          )}
          <button onClick={logout} className="header-btns logout-btn">
            <FaSignOutAlt /> Изход
          </button>
        </div>
      </header>

      {/* 👇 Маршрутизация между задачи и профил */}
      <Routes>
        <Route path="/" element={
          <>
            {isLoading && <p className='loading'>⏳ Loading...</p>}

            <div className='add-task-form'>
              <input
                className='input'
                type="text"
                value={taskText}
                onChange={(e) => setTaskText(e.target.value)}
                placeholder='Нова бележка'
              />
              <button className='add-btn' title='Добави бележка' onClick={addTask}>
                <FaPlus className='add-icon' />
                <span className='btn-zagl'>Добави</span>
              </button>
            </div>

            <ul className='task-list'>
              {tasks.map((task) => (
                <li key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
                  {editingId === task.id ? (
                    <>
                      <input
                        type='text'
                        value={editedText}
                        onChange={(e) => setEditedText(e.target.value)}
                        className='edit-input'
                        autoFocus
                        onKeyPress={(e) => e.key === 'Enter' && updateTask(task.id)}
                      />
                      <button className='save-btn' onClick={() => updateTask(task.id)}>💾 Запази</button>
                      <button className='cancel-btn' onClick={cancelEditing}>❌ Отказ</button>
                    </>
                  ) : (
                    <>
                      <span
                        className={`task-check ${task.completed ? 'checked' : ''}`}
                        onClick={() => toggleTask(task.id, !task.completed)}
                      >
                        <FaCheck />
                      </span>
                      <span className='task-text'>{task.task}</span>
                      <button className='edit-btn' title="Редактирай бележка" onClick={() => startEditing(task)}><FaEdit /></button>
                      <button onClick={() => deleteTask(task.id)} className='delete-btn' title="Изтрий бележка">
                        <FaTrash />
                      </button>
                    </>
                  )}
                </li>
              ))}
            </ul>

            {tasks.length === 0 && !isLoading && (
              <p className='empty-message'>📭 Нямате бележки. Добавете нова!</p>
            )}
          </>
        } />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </div>
  );
}


export default App;
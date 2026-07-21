// frontend/src/App.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPlus, FaTrash, FaCheck } from 'react-icons/fa';
import toast, { Toaster } from 'react-hot-toast';
import './App.css';
import Auth from './components/Auth/Auth';
import { useAuth } from './contexts/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function App() {
  console.log('📱 App с автентикация');

  // 👇 ВСИЧКИ HOKS НА ЕДНО МЯСТО - ПРЕДИ ВСИЧКИ RETURN
  const { isAuthenticated, loading: authLoading, logout } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [taskText, setTaskText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editedText, setEditedText] = useState('');

  // 👇 ФУНКЦИИТЕ МОГАТ ДА СА ТУК
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
        toast.error('❌ Грешка при зареждане на задачите!');
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function addTask() {
    if (!taskText.trim()) {
      toast.error('Моля, напишете задача!');
      return;
    }
    try {
      const res = await axios.post(`${API_URL}/api/todos`,
        { task: taskText },
        getHeaders()
      );
      setTasks((prevTasks) => [res.data, ...prevTasks]);
      setTaskText('');
      toast.success('Задачата е добавена!');
    } catch (error) {
      console.error('Грешка при създаване', error);
      if (error.response?.status === 401) {
        toast.error('Сесията ви е изтекла. Моля, влезте отново!');
        logout();
      } else {
        toast.error('❌ Грешка при добавяне на задача!');
      }
    }
  }

  async function toggleTask(id, completed) {
    try {
      await axios.put(`${API_URL}/api/todos/${id}`,
        { completed },
        getHeaders()
      );
      setTasks((prevTasks) => prevTasks.map((task) =>
        task.id === id ? { ...task, completed } : task
      ));
      toast.success(completed ? '✅ Задачата е изпълнена!' : '🔄 Задачата е възстановена');
    } catch (error) {
      console.error('Грешка при обновяване', error);
      if (error.response?.status === 401) {
        toast.error('Сесията ви е изтекла. Моля, влезте отново!');
        logout();
      } else {
        toast.error('❌ Грешка при обновяване на статуса');
      }
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
      toast.success('✅ Задачата е обновена успешно!');
    } catch (error) {
      console.error('Грешка при обновяване', error);
      if (error.response?.status === 401) {
        toast.error('Сесията ви е изтекла. Моля, влезте отново!');
        logout();
      } else {
        toast.error('❌ Грешка при обновяване на задачата!');
      }
    }
  }

  async function deleteTask(id) {
    try {
      await axios.delete(`${API_URL}/api/todos/${id}`, getHeaders());
      setTasks((tasks) => tasks.filter((task) => task.id !== id));
      toast.success('🗑️ Задачата е изтрита!');
    } catch (error) {
      console.error('Грешка при изтриване', error);
      if (error.response?.status === 401) {
        toast.error('Сесията ви е изтекла. Моля, влезте отново!');
        logout();
      } else {
        toast.error('❌ Грешка при изтриване на задача!');
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

  // 👇 РАННИЯТ RETURN Е НАКРАЯ, СЛЕД ВСИЧКИ HOOKS
  // Ако не е автентициран, покажи Login страницата
  if (!authLoading && !isAuthenticated) {
    console.log('🔐 Показвам Login');
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

  // Ако се зарежда
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

  // 👇 ОСНОВНИЯТ RETURN
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <h1>Моите задачи</h1>
          <button
            onClick={logout}
            style={{
              padding: '8px 16px',
              background: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            🚪 Изход
          </button>
        </div>
        <div className='task-statist'>
          <span>общо: {tasks.length}</span>
          <span>изпълнени: {tasks.filter((task) => task.completed).length}</span>
        </div>
      </header>

      {isLoading && <p className='loading'>⏳ Loading...</p>}

      <div className='add-task-form'>
        <input
          className='input'
          type="text"
          value={taskText}
          onChange={(e) => setTaskText(e.target.value)}
          placeholder='Нова задача'
        />
        <button className='add-btn' title='Добави задача' onClick={addTask}>
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
                <button className='edit-btn' onClick={() => startEditing(task)}>✏️</button>
                <button onClick={() => deleteTask(task.id)} className='delete-btn'>
                  <FaTrash />
                </button>
              </>
            )}
          </li>
        ))}
      </ul>

      {tasks.length === 0 && !isLoading && (
        <p className='empty-message'>📭 Нямате задачи. Добавете нова!</p>
      )}
    </div>
  );
}

export default App;
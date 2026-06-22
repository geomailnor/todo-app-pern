import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { createRoot } from 'react-dom/client';
import { FaPlus, FaTrash, FaCheck } from 'react-icons/fa';
import toast, { Toaster } from 'react-hot-toast';
import './App.css';

function App() {
  const [tasks, setTasks] = useState([]);
  const [taskText, setTaskText] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const [editingId, setEditingId] = useState(null);
  const [editedText, setEditedText] = useState('');

  async function loadTasks() {
    try {
      setIsLoading(true);
      const res = await axios.get('http://localhost:3000/api/todos');
      setTasks(res.data.tasks || []);
    } catch (error) {
      console.error('Грешка при зареждане', error);
      setTasks([]);
      toast.error('❌ Грешка при зареждане на задачите!');
    } finally {
      setIsLoading(false);
    }
  }

  async function addTask() {
    if (!taskText.trim()) {
      toast.error('Моля, напишете задача!');
      return
    }
    try {
      const res = await axios.post('http://localhost:3000/api/todos', { task: taskText });
      setTasks((prevTasks) => [res.data, ...prevTasks]);
      setTaskText('');
      toast.success('Задачата е добавена!');
    } catch (error) {
      console.error('Грешка при създаване', error);
      toast.error('❌ Грешка при добавяне на задача!');
    }
  }

  async function toggleTask(id, completed) {
    try {
      await axios.put(`http://localhost:3000/api/todos/${id}`, { completed: completed });
      setTasks((prevTasks) => prevTasks.map((task) => task.id === id ? { ...task, completed } : task));
      if (completed) {
        toast.success('✅ Задачата е изпълнена!');
      } else {
        toast.success('🔄 Задачата е възстановена');
      }
    } catch (error) {
      console.error('Грешка при обновяване', error);
      toast.error('❌ Грешка при обновяване на статуса');
    }
  }

  async function updateTask(id) {
    if (!editedText.trim()) {
      toast.error('Please write text!');
      return;
    }
    try {
      await axios.put(`http://localhost:3000/api/todos/text/${id}`, { task: editedText });
      setTasks((prevTasks) => prevTasks.map((task) => task.id === id ? { ...task, task: editedText } : task));

      setEditingId(null);
      setEditedText('');
      toast.success('✅ Задачата е обновена успешно!');

    } catch (error) {
      console.error('Грешка при обновяване', error);
      toast.error('❌ Грешка при обновяване на задачата!');
    }
  }

  async function deleteTask(id) {
    try {
      await axios.delete(`http://localhost:3000/api/todos/${id}`);
      setTasks((tasks) => tasks.filter((task) => task.id !== id));
      toast.success('🗑️ Задачата е изтрита!');
    } catch (error) {
      console.error('Грешка при изтриване', error);
      toast.error('❌ Грешка при изтриване на задача!');
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
    loadTasks();
  }, []);

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
        <h1>Моите задачи</h1>
        <div className='task-statist'>
          <span>общо: {tasks.length}</span>
          <span>изпълнени: {tasks.filter((task) => task.completed).length}</span>
        </div>
      </header>

      {isLoading && <p className='loading'>⏳ Loading...</p>}
      <div className='add-task-form'>
        <input className='input' type="text" value={taskText} onChange={(e) => setTaskText(e.target.value)} placeholder='Нова задача' />
        <button className='add-btn' title='Добави задача' onClick={addTask}><FaPlus className='add-icon' /><span className='btn-zagl'>Добави</span></button>
      </div>

      <ul className='task-list'>
        {tasks.map((task) =>
          <li key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
            {/* <input type="checkbox" checked={task.completed} onChange={() => toggleTask(task.id, !task.completed)} /> */}
            {editingId === task.id ? (
              <>
                <input type='text' value={editedText}
                  onChange={(e) => setEditedText(e.target.value)} className='edit-input'
                  autoFocus onKeyPress={(e) => e.key === 'Enter' && updateTask(task.id)}
                />
                <button className='save-btn' onClick={() => updateTask(task.id)}>💾 Запази</button>
                <button className='cancel-btn' onClick={cancelEditing}>❌ Cancel</button>
              </>
            ) : (<>
              <span className={`task-check ${task.completed ? 'checked' : ''}`}
                onClick={() => toggleTask(task.id, !task.completed)}>
                <FaCheck />
              </span>
              <span className='task-text'>{task.task}</span>
              <button className='edit-btn' onClick={() => startEditing(task)}>Edit ✏️</button>
              <button onClick={() => deleteTask(task.id)} className='delete-btn'>
                <FaTrash />
              </button>
            </>
            )}
          </li>
        )}
      </ul>
      {tasks.length === 0 && !isLoading && (<p className='empty-message'>📭 Нямате задачи. Добавете нова!</p>)}
    </div>
  );
}
export default App;

const root = createRoot(document.getElementById('root'));
root.render(<App />);
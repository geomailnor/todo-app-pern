// frontend/src/api.js
const API_URL = import.meta.env.VITE_API_URL;

// Взима токена от localStorage или sessionStorage
export const getToken = () => {
  return localStorage.getItem('token') || sessionStorage.getItem('token');
};

// Взима headers с токен
export const getHeaders = () => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// ============ AUTH ENDPOINTS ============

export const registerUser = async (userData) => {
  const response = await fetch(`${API_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Грешка при регистрация');
  }

  return data;
};

export const loginUser = async (credentials) => {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Грешка при вход');
  }

  return data;
};

// ============ TODO ENDPOINTS ============

export const getTodos = async () => {
  const response = await fetch(`${API_URL}/api/todos`, {
    headers: getHeaders()
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Грешка при зареждане на задачите');
  }

  return data.tasks || [];
};

export const createTodo = async (task) => {
  const response = await fetch(`${API_URL}/api/todos`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ task })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Грешка при създаване на задача');
  }

  return data;
};

export const updateTodo = async (id, completed) => {
  const response = await fetch(`${API_URL}/api/todos/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify({ completed })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Грешка при обновяване на задача');
  }

  return data;
};

export const updateTodoText = async (id, task) => {
  const response = await fetch(`${API_URL}/api/todos/${id}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({ task })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Грешка при обновяване на текст');
  }

  return data;
};

export const deleteTodo = async (id) => {
  const response = await fetch(`${API_URL}/api/todos/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message || 'Грешка при изтриване на задача');
  }

  return true;
};

export const toggleTodo = async (id) => {
  const response = await fetch(`${API_URL}/api/todos/${id}/toggle`, {
    method: 'PATCH',
    headers: getHeaders()
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Грешка при превключване на задача');
  }

  return data;
};
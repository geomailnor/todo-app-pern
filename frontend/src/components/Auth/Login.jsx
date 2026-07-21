// // frontend/src/components/Auth/Login.jsx
// import { useState } from 'react';
// import { useForm } from 'react-hook-form';
// import toast from 'react-hot-toast';
// import { loginUser } from '../../api';
// import { useAuth } from '../../contexts/AuthContext';

// const Login = ({ onSwitchToRegister }) => {
//   const [isLoading, setIsLoading] = useState(false);
//   const { register, handleSubmit, formState: { errors } } = useForm();
//   const { login } = useAuth();

//   const onSubmit = async (data) => {
//     setIsLoading(true);
//     try {
//       const result = await loginUser({
//         email: data.email,
//         password: data.password,
//         rememberMe: data.rememberMe || false
//       });

//       // Запазване на потребителя в контекста
//       login(result.user, result.token, data.rememberMe);

//       toast.success('Успешен вход!');
//     } catch (error) {
//       toast.error(error.message);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
//       <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
//         Вход
//       </h2>

//       <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">
//             Имейл
//           </label>
//           <input
//             type="email"
//             {...register('email', {
//               required: 'Имейлът е задължителен',
//               pattern: {
//                 value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
//                 message: 'Невалиден имейл адрес'
//               }
//             })}
//             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//             placeholder="ivan@example.com"
//           />
//           {errors.email && (
//             <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
//           )}
//         </div>

//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">
//             Парола
//           </label>
//           <input
//             type="password"
//             {...register('password', {
//               required: 'Паролата е задължителна'
//             })}
//             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//             placeholder="••••••••"
//           />
//           {errors.password && (
//             <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
//           )}
//         </div>

//         <div className="flex items-center justify-between">
//           <div className="flex items-center">
//             <input
//               type="checkbox"
//               {...register('rememberMe')}
//               id="rememberMe"
//               className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
//             />
//             <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
//               Запомни ме
//             </label>
//           </div>
//         </div>

//         <button
//           type="submit"
//           disabled={isLoading}
//           className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//         >
//           {isLoading ? 'Вход...' : 'Вход'}
//         </button>
//       </form>

//       <p className="mt-4 text-center text-sm text-gray-600">
//         Нямаш акаунт?{' '}
//         <button
//           onClick={onSwitchToRegister}
//           className="text-blue-600 hover:text-blue-800 font-medium"
//         >
//           Регистрирай се
//         </button>
//       </p>
//     </div>
//   );
// };

// export default Login;

// frontend/src/components/Auth/Login.jsx
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const Login = ({ onSwitchToRegister }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('ivan@test.com');
  const [password, setPassword] = useState('123456');
  const [rememberMe, setRememberMe] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault(); // 👈 ВАЖНО - спира презареждането на страницата
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          rememberMe
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Грешка при вход');
      }

      login(result.user, result.token, rememberMe);
      toast.success('Успешен вход!');
    } catch (error) {
      console.error('❌ Грешка:', error);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '400px', margin: '0 auto' }}>
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          Имейл
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: '100%',
            padding: '10px',
            border: '1px solid #ccc',
            borderRadius: '5px',
            fontSize: '16px'
          }}
          placeholder="ivan@test.com"
        />
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          Парола
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: '100%',
            padding: '10px',
            border: '1px solid #ccc',
            borderRadius: '5px',
            fontSize: '16px'
          }}
          placeholder="••••••••"
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          <span>Запомни ме</span>
        </label>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        style={{
          width: '100%',
          padding: '12px',
          backgroundColor: '#2563eb',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          fontSize: '16px',
          fontWeight: 'bold',
          cursor: 'pointer',
          opacity: isLoading ? 0.7 : 1
        }}
      >
        {isLoading ? 'Вход...' : 'Вход'}
      </button>

      <p style={{ marginTop: '15px', textAlign: 'center' }}>
        Нямаш акаунт?{' '}
        <button
          type="button"
          onClick={onSwitchToRegister}
          style={{
            color: '#2563eb',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Регистрация
        </button>
      </p>
    </form>
  );
};

export default Login;
// frontend/src/components/Auth/Login.jsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { loginUser } from '../../api';
import { useAuth } from '../../contexts/AuthContext';

const Login = ({ onSwitchToRegister }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { login } = useAuth();

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const result = await loginUser({
        email: data.email,
        password: data.password,
        rememberMe: data.rememberMe || false
      });

      // Запазване на потребителя в контекста
      login(result.user, result.token, data.rememberMe);

      toast.success('Успешен вход!');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
        Вход
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Имейл
          </label>
          <input
            type="email"
            {...register('email', {
              required: 'Имейлът е задължителен',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Невалиден имейл адрес'
              }
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="ivan@example.com"
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Парола
          </label>
          <input
            type="password"
            {...register('password', {
              required: 'Паролата е задължителна'
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="••••••••"
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              type="checkbox"
              {...register('rememberMe')}
              id="rememberMe"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
              Запомни ме
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Вход...' : 'Вход'}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-600">
        Нямаш акаунт?{' '}
        <button
          onClick={onSwitchToRegister}
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          Регистрирай се
        </button>
      </p>
    </div>
  );
};

export default Login;
// frontend/src/components/Auth/Register.jsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { registerUser } from '../../api';

const Register = ({ onSwitchToLogin }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const password = watch('password');

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await registerUser({
        name: data.name,
        email: data.email,
        password: data.password
      });

      toast.success('Регистрацията е успешна! Моля, влезте.');

      // Изчистване на формата
      document.getElementById('registerForm').reset();

      // Преминаване към логин
      if (onSwitchToLogin) {
        setTimeout(onSwitchToLogin, 1500);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
        Регистрация
      </h2>

      <form id="registerForm" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Име
          </label>
          <input
            type="text"
            {...register('name', {
              required: 'Името е задължително',
              minLength: {
                value: 2,
                message: 'Името трябва да е поне 2 символа'
              }
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Иван Иванов"
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>

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
              required: 'Паролата е задължителна',
              minLength: {
                value: 6,
                message: 'Паролата трябва да е поне 6 символа'
              }
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="••••••••"
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Потвърди парола
          </label>
          <input
            type="password"
            {...register('confirmPassword', {
              required: 'Потвърдете паролата',
              validate: value => value === password || 'Паролите не съвпадат'
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="••••••••"
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Регистриране...' : 'Регистрация'}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-600">
        Вече имаш акаунт?{' '}
        <button
          onClick={onSwitchToLogin}
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          Влез
        </button>
      </p>
    </div>
  );
};

export default Register;
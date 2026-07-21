// frontend/src/components/Layout/Navbar.jsx
import { useAuth } from '../../contexts/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <span className="text-xl font-bold text-blue-600">
              ✅ TODO App
            </span>
          </div>

          {user && (
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">
                👋 {user.name}
              </span>
              <button
                onClick={logout}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-sm"
              >
                Изход
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
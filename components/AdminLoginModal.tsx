import React, { useState } from 'react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const trimmedUser = userId.trim();
    const trimmedPass = password.trim();

    if (trimmedUser === '145531' && trimmedPass === '2271') {
      onSuccess();
      setUserId('');
      setPassword('');
      setErrorMessage('');
    } else {
      setErrorMessage('Invalid User ID or Password. Please try again.');
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl p-6 w-full max-w-sm text-gray-100 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          aria-label="Close modal"
        >
          <i className="fas fa-times text-lg"></i>
        </button>

        <div className="text-center mb-5">
          <div className="w-14 h-14 bg-indigo-600/20 border border-indigo-500/40 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
            <i className="fa-solid fa-user-shield text-2xl text-indigo-400"></i>
          </div>
          <h3 className="text-xl font-bold text-white tracking-wide">Admin Login</h3>
          <p className="text-xs text-gray-400 mt-1">
            RFL Distribution • Khulna Depot Portal
          </p>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 bg-red-900/40 border border-red-500/60 rounded-xl text-red-200 text-xs flex items-center gap-2">
            <i className="fas fa-circle-exclamation text-red-400 text-sm flex-shrink-0"></i>
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              User ID
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-gray-400">
                <i className="fa-solid fa-id-badge text-sm"></i>
              </span>
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Enter User ID"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-mono"
                autoFocus
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              Password
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-gray-400">
                <i className="fa-solid fa-key text-sm"></i>
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter Password"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-9 pr-10 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-gray-400 hover:text-gray-200 text-sm focus:outline-none"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-semibold py-2.5 px-4 rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              <i className="fa-solid fa-arrow-right-to-bracket"></i>
              <span>Login to Portal</span>
            </button>
          </div>
        </form>

        <div className="mt-4 pt-3 border-t border-gray-800 text-center text-[11px] text-gray-500">
          Official Portal • Authorized Access Only
        </div>
      </div>
    </div>
  );
};

export default AdminLoginModal;

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldAlert, User, Lock, ArrowRight, Eye, EyeOff, AlertCircle, X, Loader2, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { loginUser } from '../services/api';

export const LoginPage: React.FC = () => {
  const [identifier, setIdentifier] = useState('alex@example.com');
  const [password, setPassword] = useState('User123!');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ identifier?: string; password?: string }>({});

  const { login } = useAuth();
  const navigate = useNavigate();

  const validateForm = (): boolean => {
    const errors: { identifier?: string; password?: string } = {};

    if (!identifier.trim()) {
      errors.identifier = 'Email or Username is required.';
    } else if (identifier.trim().length < 3) {
      errors.identifier = 'Identifier must be at least 3 characters long.';
    }

    if (!password) {
      errors.password = 'Password is required.';
    } else if (password.length < 4) {
      errors.password = 'Password must be at least 4 characters long.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Execute real authentication request against backend/database
      const authData = await loginUser({
        email: identifier.trim(),
        password: password,
      });

      // Update global state and local storage
      login(authData.access_token, authData.user);
      setLoading(false);
      
      // Navigate to main application dashboard upon successful login
      navigate('/dashboard');
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Authentication failed. Please check your credentials.');
    }
  };

  const handleQuickFill = (emailVal: string, passVal: string) => {
    setIdentifier(emailVal);
    setPassword(passVal);
    setError(null);
    setFieldErrors({});
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 bg-gray-50 dark:bg-dark-bg transition-colors duration-200">
      <div className="w-full max-w-md bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-brand-500/30">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Welcome Back
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            Sign in to access your Pothole Detector Dashboard
          </p>
        </div>

        {/* Global Error Alert Banner */}
        {error && (
          <div className="flex items-start justify-between p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 text-red-700 dark:text-red-300 text-xs sm:text-sm shadow-sm transition animate-in fade-in duration-200">
            <div className="flex items-start space-x-2.5">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500 mt-0.5" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-600 dark:hover:text-red-200 ml-2 p-0.5 rounded-lg transition"
              aria-label="Dismiss error"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Main Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          
          {/* Email / Username Field */}
          <div>
            <label htmlFor="login-identifier" className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1.5">
              Email or Username
            </label>
            <div className="relative">
              <User className="w-5 h-5 absolute left-3.5 top-3 text-gray-400 dark:text-gray-500 pointer-events-none" />
              <input
                id="login-identifier"
                type="text"
                autoComplete="username"
                required
                value={identifier}
                onChange={(e) => {
                  setIdentifier(e.target.value);
                  if (fieldErrors.identifier) {
                    setFieldErrors((prev) => ({ ...prev, identifier: undefined }));
                  }
                }}
                className={`w-full pl-11 pr-4 py-2.5 sm:py-3 rounded-xl border text-sm bg-gray-50 dark:bg-dark-surface text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 outline-none transition focus:ring-2 ${
                  fieldErrors.identifier
                    ? 'border-red-500 focus:ring-red-400'
                    : 'border-gray-300 dark:border-gray-700 focus:ring-brand-500 focus:border-brand-500'
                }`}
                placeholder="email@example.com or username"
              />
            </div>
            {fieldErrors.identifier && (
              <p className="mt-1 text-xs text-red-500 flex items-center space-x-1">
                <span>{fieldErrors.identifier}</span>
              </p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="login-password" className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                Password
              </label>
            </div>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-3.5 top-3 text-gray-400 dark:text-gray-500 pointer-events-none" />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password) {
                    setFieldErrors((prev) => ({ ...prev, password: undefined }));
                  }
                }}
                className={`w-full pl-11 pr-11 py-2.5 sm:py-3 rounded-xl border text-sm bg-gray-50 dark:bg-dark-surface text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 outline-none transition focus:ring-2 ${
                  fieldErrors.password
                    ? 'border-red-500 focus:ring-red-400'
                    : 'border-gray-300 dark:border-gray-700 focus:ring-brand-500 focus:border-brand-500'
                }`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition focus:outline-none"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="mt-1 text-xs text-red-500 flex items-center space-x-1">
                <span>{fieldErrors.password}</span>
              </p>
            )}
          </div>

          {/* Submit Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-brand-600 hover:bg-brand-700 active:scale-[0.99] text-white font-bold rounded-xl shadow-lg shadow-brand-500/25 flex items-center justify-center space-x-2 transition disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Credentials Assistant */}
        <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center space-x-1 text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
            <KeyRound className="w-3.5 h-3.5 text-brand-500" />
            <span>Quick Demo Credentials:</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill('alex@example.com', 'User123!')}
              className="py-1.5 px-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 hover:bg-gray-100 dark:bg-dark-surface dark:hover:bg-gray-800 text-[11px] font-medium text-gray-700 dark:text-gray-300 text-left transition truncate"
              title="Click to fill Demo User credentials"
            >
              👤 Standard User
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('admin@roadpothole.com', 'Admin123!')}
              className="py-1.5 px-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 hover:bg-gray-100 dark:bg-dark-surface dark:hover:bg-gray-800 text-[11px] font-medium text-gray-700 dark:text-gray-300 text-left transition truncate"
              title="Click to fill Admin credentials"
            >
              ⚡ System Admin
            </button>
          </div>
        </div>

        {/* Create Account Link */}
        <div className="text-center text-xs text-gray-500 dark:text-gray-400 pt-1">
          Don't have an account?{' '}
          <Link to="/register" className="text-brand-500 font-semibold hover:underline">
            Create an Account
          </Link>
        </div>

      </div>
    </div>
  );
};

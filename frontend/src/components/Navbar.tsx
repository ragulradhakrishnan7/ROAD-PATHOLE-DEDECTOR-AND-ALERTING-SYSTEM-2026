import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShieldAlert, Bell, Sun, Moon, User, LogOut, Menu, X, Camera, MapPin, LayoutDashboard 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-dark-card/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-brand-500/30 group-hover:scale-105 transition-transform">
            <ShieldAlert className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-gray-900 via-indigo-950 to-brand-600 dark:from-white dark:via-gray-100 dark:to-brand-500 bg-clip-text text-transparent">
              RoadPothole<span className="text-brand-500">AI</span>
            </span>
            <span className="block text-[10px] uppercase tracking-widest font-semibold text-gray-500 dark:text-gray-400">
              Detector & Alert System
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1 font-medium text-sm text-gray-700 dark:text-gray-200">
          <Link to="/dashboard" className="px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition flex items-center space-x-1.5">
            <LayoutDashboard className="w-4 h-4 text-brand-500" />
            <span>Dashboard</span>
          </Link>
          <Link to="/live-detection" className="px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition flex items-center space-x-1.5">
            <Camera className="w-4 h-4 text-emerald-500" />
            <span>Live Detection</span>
          </Link>
          <Link to="/map-view" className="px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition flex items-center space-x-1.5">
            <MapPin className="w-4 h-4 text-rose-500" />
            <span>GIS Map</span>
          </Link>
          <Link to="/history" className="px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition">
            History
          </Link>
          {user?.role === 'admin' && (
            <Link to="/admin" className="px-3 py-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 font-semibold transition">
              Admin Portal
            </Link>
          )}
        </nav>

        {/* Actions & Utilities */}
        <div className="flex items-center space-x-3">
          
          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            title="Toggle Light/Dark Theme"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-600" />}
          </button>

          {/* Notifications Bell */}
          <div className="relative">
            <button 
              onClick={() => setAlertsOpen(!alertsOpen)}
              className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition relative"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500" />
            </button>

            {/* Dropdown */}
            {alertsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100 dark:border-gray-800">
                  <h4 className="font-semibold text-sm">Real-time Hazards</h4>
                  <span className="text-xs bg-rose-500/20 text-rose-500 px-2 py-0.5 rounded-full font-bold">2 New</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
                    <p className="font-medium text-rose-600 dark:text-rose-400">⚠️ Critical Pothole nearby</p>
                    <p className="text-gray-500 dark:text-gray-400 text-[11px] mt-1">Market St & 5th St (0.2 miles)</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                    <p className="font-medium text-amber-600 dark:text-amber-400">📍 High Hazard Warning</p>
                    <p className="text-gray-500 dark:text-gray-400 text-[11px] mt-1">Geary Blvd (1.4 miles)</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Auth Buttons */}
          {isAuthenticated ? (
            <div className="flex items-center space-x-2">
              <Link to="/profile" className="flex items-center space-x-2 p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                <img 
                  src={user?.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150"} 
                  alt="Avatar" 
                  className="w-8 h-8 rounded-lg object-cover ring-2 ring-brand-500/50" 
                />
                <span className="hidden sm:inline font-medium text-sm">{user?.name}</span>
              </Link>
              <button 
                onClick={() => { logout(); navigate('/login'); }} 
                className="p-2 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-500/10 transition"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link to="/login" className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:text-brand-500 transition">
                Sign In
              </Link>
              <Link to="/register" className="px-4 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-lg shadow-brand-500/25 transition">
                Get Started
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-dark-card border-b border-gray-200 dark:border-gray-800 px-4 pt-2 pb-4 space-y-2">
          <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-base font-medium hover:bg-gray-100 dark:hover:bg-gray-800">
            Dashboard
          </Link>
          <Link to="/live-detection" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-base font-medium hover:bg-gray-100 dark:hover:bg-gray-800">
            Live Detection
          </Link>
          <Link to="/upload-image" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-base font-medium hover:bg-gray-100 dark:hover:bg-gray-800">
            Upload Image
          </Link>
          <Link to="/upload-video" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-base font-medium hover:bg-gray-100 dark:hover:bg-gray-800">
            Upload Video
          </Link>
          <Link to="/map-view" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-base font-medium hover:bg-gray-100 dark:hover:bg-gray-800">
            GIS Map
          </Link>
          <Link to="/history" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-base font-medium hover:bg-gray-100 dark:hover:bg-gray-800">
            History
          </Link>
          {user?.role === 'admin' && (
            <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-base font-medium text-amber-500 hover:bg-amber-500/10">
              Admin Portal
            </Link>
          )}
        </div>
      )}
    </header>
  );
};

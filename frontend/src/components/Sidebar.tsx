import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Camera, Upload, Video, History, MapPin, ShieldCheck, User, Settings 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();

  const links = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/live-detection', label: 'Live Camera', icon: Camera },
    { to: '/upload-image', label: 'Upload Image', icon: Upload },
    { to: '/upload-video', label: 'Upload Video', icon: Video },
    { to: '/map-view', label: 'GIS Hazard Map', icon: MapPin },
    { to: '/history', label: 'Detection Logs', icon: History },
  ];

  if (user?.role === 'admin') {
    links.push({ to: '/admin', label: 'Admin Portal', icon: ShieldCheck });
  }

  links.push(
    { to: '/profile', label: 'Profile', icon: User },
    { to: '/settings', label: 'Settings', icon: Settings }
  );

  return (
    <aside className="w-64 hidden lg:block bg-white dark:bg-dark-card border-r border-gray-200 dark:border-gray-800 min-h-[calc(100vh-4rem)] p-4">
      <div className="space-y-1">
        <p className="px-3 text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
          Navigation Menu
        </p>
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/25'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </div>
    </aside>
  );
};

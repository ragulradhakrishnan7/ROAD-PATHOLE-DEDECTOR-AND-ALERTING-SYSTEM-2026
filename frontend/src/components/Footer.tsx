import React from 'react';
import { ShieldAlert, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-dark-card border-t border-gray-200 dark:border-gray-800 py-8 px-4 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        <div className="flex items-center space-x-2">
          <ShieldAlert className="w-5 h-5 text-brand-500" />
          <span className="font-bold text-sm">RoadPothole AI System</span>
          <span className="text-xs text-gray-500">© 2026 All Rights Reserved</span>
        </div>

        <div className="flex items-center space-x-6 text-xs text-gray-500 dark:text-gray-400">
          <a href="#privacy" className="hover:text-brand-500 transition">Privacy Policy</a>
          <a href="#terms" className="hover:text-brand-500 transition">Terms of Service</a>
          <a href="#docs" className="hover:text-brand-500 transition">API Documentation</a>
        </div>

        <div className="flex items-center text-xs text-gray-400">
          <span>Engineered with</span>
          <Heart className="w-3.5 h-3.5 text-rose-500 mx-1 fill-rose-500" />
          <span>YOLOv8 & React</span>
        </div>
      </div>
    </footer>
  );
};

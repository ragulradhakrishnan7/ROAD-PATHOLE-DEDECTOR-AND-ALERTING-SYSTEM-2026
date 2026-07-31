import React, { useState } from 'react';
import { User as UserIcon, Mail, Shield, Calendar, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Toast } from '../components/Toast';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || 'Alex Driver');
  const [email, setEmail] = useState(user?.email || 'alex@example.com');
  const [toast, setToast] = useState<any>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setToast({
      id: Date.now().toString(),
      type: 'success',
      title: 'Profile Updated',
      message: 'Account details saved successfully.'
    });
  };

  return (
    <div className="max-w-3xl space-y-6">
      <Toast toast={toast} onClose={() => setToast(null)} />

      <div>
        <h1 className="text-2xl font-extrabold flex items-center space-x-3">
          <UserIcon className="w-7 h-7 text-brand-500" />
          <span>User Profile Settings</span>
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Manage your account information, role permissions, and avatar.
        </p>
      </div>

      <div className="bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-800 rounded-3xl p-8 space-y-6 shadow-sm">
        <div className="flex items-center space-x-4 pb-6 border-b border-gray-100 dark:border-gray-800">
          <img
            src={user?.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250"}
            alt="Avatar"
            className="w-20 h-20 rounded-2xl object-cover ring-4 ring-brand-500/20"
          />
          <div>
            <h2 className="text-xl font-bold">{user?.name}</h2>
            <p className="text-xs text-gray-500">{user?.email}</p>
            <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold bg-brand-500/10 text-brand-500">
              Role: {user?.role}
            </span>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-dark-surface text-sm outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-dark-surface text-sm outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <button
            type="submit"
            className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-lg shadow-brand-500/25 flex items-center space-x-2 transition"
          >
            <Save className="w-4 h-4" />
            <span>Save Profile Changes</span>
          </button>
        </form>
      </div>
    </div>
  );
};

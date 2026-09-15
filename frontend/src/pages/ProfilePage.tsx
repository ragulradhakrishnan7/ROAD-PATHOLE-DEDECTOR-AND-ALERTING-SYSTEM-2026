import React, { useState, useRef } from 'react';
import { 
  User as UserIcon, Mail, Shield, Calendar, Save, Camera, Upload, Lock, 
  CheckCircle2, KeyRound, AlertCircle, RefreshCw, Sparkles 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Toast } from '../components/Toast';
import { updateUserProfile } from '../services/api';

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250',
];

export const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(user?.name || 'Alex Driver');
  const [email, setEmail] = useState(user?.email || 'alex@example.com');
  const [avatarUrl, setAvatarUrl] = useState(
    user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'
  );
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ id: string; type: 'success' | 'error'; title: string; message: string } | null>(null);

  // Handle custom image file upload from user device
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setToast({
        id: Date.now().toString(),
        type: 'error',
        title: 'Invalid File Type',
        message: 'Please select a valid image file (JPG, PNG, WEBP).'
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setToast({
        id: Date.now().toString(),
        type: 'error',
        title: 'File Too Large',
        message: 'Image size must be under 5MB.'
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const newAvatar = reader.result;
        setAvatarUrl(newAvatar);
        // Automatically save avatar change
        updateUser({ avatar_url: newAvatar });
        updateUserProfile({ avatar_url: newAvatar }).catch(() => {});
        setToast({
          id: Date.now().toString(),
          type: 'success',
          title: 'Profile Photo Updated',
          message: 'Your profile picture has been updated successfully.'
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPreset = (url: string) => {
    setAvatarUrl(url);
    updateUser({ avatar_url: url });
    updateUserProfile({ avatar_url: url }).catch(() => {});
    setToast({
      id: Date.now().toString(),
      type: 'success',
      title: 'Avatar Changed',
      message: 'Preset avatar applied to your profile.'
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateUserProfile({ name, email, avatar_url: avatarUrl });
      updateUser({ name, email, avatar_url: avatarUrl });
      setToast({
        id: Date.now().toString(),
        type: 'success',
        title: 'Profile Saved',
        message: 'Your account profile details have been saved.'
      });
    } catch (err: any) {
      setToast({
        id: Date.now().toString(),
        type: 'error',
        title: 'Save Failed',
        message: err.message || 'Failed to update profile.'
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      {toast && <Toast toast={toast} onClose={() => setToast(null)} />}

      {/* Title Header */}
      <div>
        <h1 className="text-2xl font-extrabold flex items-center space-x-3">
          <UserIcon className="w-7 h-7 text-brand-500" />
          <span>User Account & Profile</span>
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Customize your profile photo and details. Other security settings and permissions are locked.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: Photo Upload Card */}
        <div className="md:col-span-1 bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-800 rounded-3xl p-6 space-y-6 shadow-sm text-center flex flex-col items-center">
          
          <div className="space-y-1">
            <h3 className="font-bold text-base text-gray-900 dark:text-white">Profile Picture</h3>
            <p className="text-xs text-gray-500">Upload or select a photo avatar</p>
          </div>

          {/* Avatar Container with Hover Overlay */}
          <div className="relative group w-32 h-32">
            <img
              src={avatarUrl}
              alt="User Avatar"
              className="w-32 h-32 rounded-3xl object-cover ring-4 ring-brand-500/30 shadow-xl transition group-hover:opacity-85"
            />
            
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 rounded-3xl opacity-0 group-hover:opacity-100 transition duration-200 text-white font-bold text-xs gap-1 cursor-pointer"
            >
              <Camera className="w-6 h-6 text-brand-400 animate-bounce" />
              <span>Change Photo</span>
            </button>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
          />

          <div className="w-full space-y-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2.5 px-4 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-2 transition shadow-lg shadow-brand-500/20 cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Upload New Photo</span>
            </button>
            <p className="text-[10px] text-gray-400">Supports JPG, PNG or WEBP (Max 5MB)</p>
          </div>

          {/* Quick Preset Avatars Selection */}
          <div className="w-full pt-4 border-t border-gray-100 dark:border-gray-800 space-y-2">
            <span className="text-[11px] uppercase font-bold text-gray-400 tracking-wider flex items-center justify-center gap-1">
              <Sparkles className="w-3 h-3 text-brand-400" />
              <span>Preset Avatars</span>
            </span>
            <div className="flex items-center justify-center gap-2 flex-wrap">
              {PRESET_AVATARS.map((url, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectPreset(url)}
                  className={`w-9 h-9 rounded-xl overflow-hidden border-2 transition ${
                    avatarUrl === url ? 'border-brand-500 scale-110 shadow-md' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={url} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Editable Profile Fields & Locked Restricted Settings */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Editable Form */}
          <div className="bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-800 rounded-3xl p-6 space-y-5 shadow-sm">
            
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
              <div>
                <h3 className="font-bold text-base text-gray-900 dark:text-white">Personal Information</h3>
                <p className="text-xs text-gray-500">Update your public name and email address</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Editable</span>
              </span>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Full Name</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-dark-surface text-sm outline-none focus:ring-2 focus:ring-brand-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-dark-surface text-sm outline-none focus:ring-2 focus:ring-brand-500 transition"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-sm shadow-lg shadow-brand-500/25 flex items-center space-x-2 transition disabled:opacity-50 cursor-pointer"
                >
                  {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Locked Security & Account Metadata Card ("except others") */}
          <div className="bg-gray-50/70 dark:bg-dark-card/50 border border-gray-200 dark:border-gray-800/80 rounded-3xl p-6 space-y-4 shadow-sm">
            
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-800">
              <div>
                <h3 className="font-bold text-base text-gray-900 dark:text-white flex items-center gap-2">
                  <Shield className="w-4 h-4 text-amber-500" />
                  <span>Restricted Account Settings</span>
                </h3>
                <p className="text-xs text-gray-500">System credentials & permissions (Read-Only)</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-amber-500/10 text-amber-500 rounded-full flex items-center gap-1 border border-amber-500/20">
                <Lock className="w-3.5 h-3.5" />
                <span>Locked / Admin Only</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              
              <div className="p-3.5 rounded-2xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Account Role</span>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-gray-800 dark:text-gray-200 capitalize">{user?.role || 'Standard User'}</span>
                  <Lock className="w-3.5 h-3.5 text-gray-400" />
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">User ID Reference</span>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold text-gray-600 dark:text-gray-300 truncate max-w-[140px]">{user?.id || 'USR-8942104'}</span>
                  <Lock className="w-3.5 h-3.5 text-gray-400" />
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Security Encryption</span>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-emerald-500">JWT + Bcrypt Hashed</span>
                  <KeyRound className="w-3.5 h-3.5 text-emerald-500" />
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Registration Date</span>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-gray-600 dark:text-gray-300">
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Jan 15, 2026'}
                  </span>
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                </div>
              </div>

            </div>

            <p className="text-[11px] text-gray-400 flex items-center gap-1.5 pt-2">
              <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>System role assignments and authentication tokens are managed exclusively by administrative policy.</span>
            </p>

          </div>

        </div>

      </div>
    </div>
  );
};

export default ProfilePage;

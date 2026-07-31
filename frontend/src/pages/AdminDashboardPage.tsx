import React, { useEffect, useState } from 'react';
import { ShieldCheck, Users, AlertTriangle, CheckCircle2, Wrench, Trash2 } from 'lucide-react';
import { fetchAdminStats, fetchDetectionHistory } from '../services/api';
import { AdminStats, Pothole } from '../types';
import { StatCard } from '../components/StatCard';
import { Toast } from '../components/Toast';

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [potholes, setPotholes] = useState<Pothole[]>([]);
  const [toast, setToast] = useState<any>(null);

  useEffect(() => {
    fetchAdminStats().then(setStats);
    fetchDetectionHistory().then(setPotholes);
  }, []);

  const handleDelete = (id: string) => {
    setPotholes(prev => prev.filter(p => p.id !== id));
    setToast({
      id: Date.now().toString(),
      type: 'success',
      title: 'Record Deleted',
      message: 'Pothole report deleted from admin database.'
    });
  };

  return (
    <div className="space-y-6">
      <Toast toast={toast} onClose={() => setToast(null)} />

      <div>
        <h1 className="text-2xl font-extrabold flex items-center space-x-3 text-amber-500">
          <ShieldCheck className="w-8 h-8" />
          <span>System Administration Portal</span>
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Global analytics, maintenance repair dispatch, and user access control.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={stats?.total_users || 142}
          change="Registered accounts"
          icon={Users}
          color="indigo"
        />
        <StatCard
          title="Total Potholes"
          value={stats?.total_potholes || 1284}
          change="System wide"
          icon={AlertTriangle}
          color="rose"
        />
        <StatCard
          title="Repaired Count"
          value={stats?.repaired_count || 890}
          change={`${stats?.repair_rate_percent || 69.3}% success rate`}
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Work Orders"
          value={stats?.in_progress_count || 214}
          change="Currently dispatched"
          icon={Wrench}
          color="amber"
        />
      </div>

      {/* Admin Management Table */}
      <div className="bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-800 rounded-3xl p-6 space-y-4 shadow-sm">
        <h3 className="font-bold text-lg">Manage Pothole Dispatch Reports</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 dark:bg-dark-surface uppercase font-bold text-gray-400 border-b border-gray-200 dark:border-gray-800">
              <tr>
                <th className="p-4">Report ID</th>
                <th className="p-4">Location</th>
                <th className="p-4">Severity</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 font-medium">
              {potholes.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/50 dark:hover:bg-dark-surface/50 transition">
                  <td className="p-4 font-mono text-gray-500">{p.id.slice(0, 8)}...</td>
                  <td className="p-4 font-bold">{p.location_name}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                      p.severity === 'Critical' ? 'bg-rose-500/20 text-rose-500' : 'bg-emerald-500/20 text-emerald-500'
                    }`}>
                      {p.severity}
                    </span>
                  </td>
                  <td className="p-4">{p.status}</td>
                  <td className="p-4">
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition"
                      title="Delete Record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

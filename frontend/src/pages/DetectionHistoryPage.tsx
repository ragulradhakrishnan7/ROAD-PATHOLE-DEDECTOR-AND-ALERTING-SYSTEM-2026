import React, { useState, useEffect } from 'react';
import { History, Filter, Search, Download, ExternalLink, Trash2 } from 'lucide-react';
import { fetchDetectionHistory, updatePotholeStatus } from '../services/api';
import { Pothole } from '../types';
import { Toast } from '../components/Toast';

export const DetectionHistoryPage: React.FC = () => {
  const [potholes, setPotholes] = useState<Pothole[]>([]);
  const [severityFilter, setSeverityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState<any>(null);

  useEffect(() => {
    fetchDetectionHistory(severityFilter, statusFilter).then(setPotholes);
  }, [severityFilter, statusFilter]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    const updated = await updatePotholeStatus(id, newStatus);
    setPotholes(prev => prev.map(p => p.id === id ? updated : p));
    setToast({
      id: Date.now().toString(),
      type: 'success',
      title: 'Status Updated',
      message: `Pothole status changed to ${newStatus}`
    });
  };

  const filteredPotholes = potholes.filter(p => 
    p.location_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Toast toast={toast} onClose={() => setToast(null)} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold flex items-center space-x-3">
            <History className="w-7 h-7 text-brand-500" />
            <span>Pothole Detection Log History</span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Historical log of all detected road defects, severities, and repair status.
          </p>
        </div>

        <button 
          onClick={() => {
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(potholes, null, 2));
            const downloadAnchor = document.createElement('a');
            downloadAnchor.setAttribute("href", dataStr);
            downloadAnchor.setAttribute("download", "pothole_reports.json");
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            downloadAnchor.remove();
          }}
          className="px-4 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 font-bold text-xs rounded-xl flex items-center space-x-2 transition"
        >
          <Download className="w-4 h-4" />
          <span>Export JSON Log</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search location name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-gray-700 rounded-xl text-xs outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="flex items-center space-x-4 text-xs">
          <div className="flex items-center space-x-1.5">
            <span className="text-gray-500">Severity:</span>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-1.5 outline-none font-semibold"
            >
              <option value="All">All Severities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="text-gray-500">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-1.5 outline-none font-semibold"
            >
              <option value="All">All Statuses</option>
              <option value="Reported">Reported</option>
              <option value="In Progress">In Progress</option>
              <option value="Repaired">Repaired</option>
            </select>
          </div>
        </div>
      </div>

      {/* History Data Table */}
      <div className="bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 dark:bg-dark-surface uppercase font-bold text-gray-400 border-b border-gray-200 dark:border-gray-800">
              <tr>
                <th className="p-4">Image</th>
                <th className="p-4">Location Name</th>
                <th className="p-4">Severity</th>
                <th className="p-4">Confidence</th>
                <th className="p-4">Surface Area</th>
                <th className="p-4">Status</th>
                <th className="p-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 font-medium">
              {filteredPotholes.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/50 dark:hover:bg-dark-surface/50 transition">
                  <td className="p-4">
                    <img src={p.image_url} alt="Pothole" className="w-12 h-12 rounded-xl object-cover" />
                  </td>
                  <td className="p-4 font-bold text-gray-900 dark:text-white">{p.location_name}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-bold ${
                      p.severity === 'Critical' ? 'bg-rose-500/20 text-rose-500' :
                      p.severity === 'High' ? 'bg-amber-500/20 text-amber-500' :
                      'bg-emerald-500/20 text-emerald-500'
                    }`}>
                      {p.severity}
                    </span>
                  </td>
                  <td className="p-4">{Math.round(p.confidence * 100)}%</td>
                  <td className="p-4">{p.surface_area_sq_m} m²</td>
                  <td className="p-4">
                    <select
                      value={p.status}
                      onChange={(e) => handleStatusChange(p.id, e.target.value)}
                      className="bg-gray-100 dark:bg-dark-surface border border-gray-300 dark:border-gray-700 rounded-lg px-2 py-1 text-xs outline-none"
                    >
                      <option value="Reported">Reported</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Repaired">Repaired</option>
                    </select>
                  </td>
                  <td className="p-4 text-gray-400">{new Date(p.timestamp).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

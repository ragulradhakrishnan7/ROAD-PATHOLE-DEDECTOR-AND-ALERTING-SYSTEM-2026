import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  icon: LucideIcon;
  color: 'indigo' | 'emerald' | 'amber' | 'rose';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  isPositive = true,
  icon: Icon,
  color
}) => {
  const COLOR_CLASSES = {
    indigo: 'from-brand-500/20 to-indigo-600/10 text-brand-500 border-brand-500/20',
    emerald: 'from-emerald-500/20 to-teal-600/10 text-emerald-500 border-emerald-500/20',
    amber: 'from-amber-500/20 to-orange-600/10 text-amber-500 border-amber-500/20',
    rose: 'from-rose-500/20 to-red-600/10 text-rose-500 border-rose-500/20',
  };

  return (
    <div className="bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-extrabold mt-1 text-gray-900 dark:text-white">{value}</h3>
          {change && (
            <p className={`text-xs font-medium mt-1 ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
              {change}
            </p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${COLOR_CLASSES[color]} flex items-center justify-center border shadow-inner`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};

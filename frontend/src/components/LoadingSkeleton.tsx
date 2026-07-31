import React from 'react';

export const LoadingSkeleton: React.FC = () => {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded-xl w-1/4" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded-2xl" />
        <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded-2xl" />
        <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded-2xl" />
        <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded-2xl" />
      </div>
      <div className="h-96 bg-gray-200 dark:bg-gray-800 rounded-2xl w-full" />
    </div>
  );
};

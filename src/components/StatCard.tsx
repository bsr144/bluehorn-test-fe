import type { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: number;
  icon: ReactNode;
  color: 'blue' | 'red' | 'amber' | 'green' | 'purple';
  active?: boolean;
  onClick?: () => void;
}

const colorMap = {
  blue: 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400',
  red: 'bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400',
  amber: 'bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400',
  green: 'bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400',
  purple: 'bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400',
};

const valueColorMap = {
  blue: 'text-blue-700 dark:text-blue-300',
  red: 'text-red-700 dark:text-red-300',
  amber: 'text-amber-700 dark:text-amber-300',
  green: 'text-green-700 dark:text-green-300',
  purple: 'text-purple-700 dark:text-purple-300',
};

const activeRing = {
  blue: 'ring-2 ring-blue-400 dark:ring-blue-500',
  red: 'ring-2 ring-red-400 dark:ring-red-500',
  amber: 'ring-2 ring-amber-400 dark:ring-amber-500',
  green: 'ring-2 ring-green-400 dark:ring-green-500',
  purple: 'ring-2 ring-purple-400 dark:ring-purple-500',
};

export default function StatCard({ title, value, icon, color, active, onClick }: StatCardProps) {
  const dimmed = value === 0 && !active;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 flex items-center gap-3 w-full text-left cursor-pointer transition-all hover:shadow-md ${
        active ? `${activeRing[color]} border-transparent` : ''
      } ${dimmed ? 'opacity-50' : ''}`}
    >
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorMap[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
        <p className={`text-2xl font-bold ${valueColorMap[color]}`}>{value}</p>
      </div>
    </button>
  );
}

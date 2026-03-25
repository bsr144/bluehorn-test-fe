interface StatusBadgeProps {
  status: 'upcoming' | 'in-progress' | 'completed' | 'missed' | 'pending' | 'not-completed';
  size?: 'sm' | 'md';
}

const config: Record<string, { bg: string; text: string; label: string }> = {
  upcoming: { bg: 'bg-blue-100 dark:bg-blue-900/40', text: 'text-blue-700 dark:text-blue-300', label: 'Upcoming' },
  'in-progress': { bg: 'bg-amber-100 dark:bg-amber-900/40', text: 'text-amber-700 dark:text-amber-300', label: 'In Progress' },
  completed: { bg: 'bg-green-100 dark:bg-green-900/40', text: 'text-green-700 dark:text-green-300', label: 'Completed' },
  missed: { bg: 'bg-red-100 dark:bg-red-900/40', text: 'text-red-700 dark:text-red-300', label: 'Missed' },
  pending: { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-600 dark:text-gray-400', label: 'Pending' },
  'not-completed': { bg: 'bg-red-100 dark:bg-red-900/40', text: 'text-red-700 dark:text-red-300', label: 'Not Completed' },
};

export default function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const c = config[status];
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  return (
    <span className={`inline-flex items-center rounded-full font-medium ${c.bg} ${c.text} ${sizeClass}`}>
      {c.label}
    </span>
  );
}

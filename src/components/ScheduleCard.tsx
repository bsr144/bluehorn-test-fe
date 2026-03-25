import { Link } from 'react-router-dom';
import { Clock, MapPin, ChevronRight, CalendarDays } from 'lucide-react';
import type { Schedule } from '../types';
import { formatDisplayDate } from '../utils/date';
import StatusBadge from './StatusBadge';

interface ScheduleCardProps {
  schedule: Schedule;
  showDate?: boolean;
}

export default function ScheduleCard({ schedule, showDate }: ScheduleCardProps) {
  const completedTasks = schedule.tasks.filter((t) => t.status === 'completed').length;
  const totalTasks = schedule.tasks.length;

  return (
    <Link
      to={`/schedule/${schedule.id}`}
      className="block bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 hover:shadow-md hover:border-primary-200 dark:hover:border-primary-800 transition-all no-underline"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
              {schedule.caregiverName || 'Unassigned'}
            </h3>
            <StatusBadge status={schedule.status} />
          </div>

          <div className="flex items-center gap-3 mb-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary-700 dark:text-primary-300 bg-primary-50 dark:bg-primary-900/30 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-400" />
              {schedule.clientName}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {schedule.startTime} – {schedule.endTime}
            </span>
            {showDate && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                <CalendarDays className="w-3 h-3" />
                {formatDisplayDate(schedule.date)}
              </span>
            )}
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              <span className="truncate">{schedule.location.address}</span>
            </span>
          </div>
          {totalTasks > 0 && (
            <div className="mt-1.5">
              <p className="text-xs text-gray-400 dark:text-gray-500">
                {totalTasks} task{totalTasks !== 1 ? 's' : ''} ·{' '}
                {completedTasks} completed
              </p>
              <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-1 mt-1">
                <div
                  className="bg-green-500 h-1 rounded-full transition-all duration-300"
                  style={{ width: `${(completedTasks / totalTasks) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
        <ChevronRight className="w-5 h-5 text-gray-400 dark:text-gray-600 flex-shrink-0 mt-1" />
      </div>
    </Link>
  );
}

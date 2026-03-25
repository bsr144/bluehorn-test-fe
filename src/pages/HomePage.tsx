import { useEffect, useState, useMemo, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { CalendarDays, AlertTriangle, Clock, CheckCircle2, Plus, Activity, RefreshCw, ClipboardList } from 'lucide-react';
import type { Schedule } from '../types';
import { fetchSchedules } from '../api/schedules';
import { getLocalToday } from '../utils/date';
import { useToast } from '../contexts/ToastContext';
import StatCard from '../components/StatCard';
import ScheduleCard from '../components/ScheduleCard';
import SkeletonCard from '../components/SkeletonCard';
import CreateScheduleModal from '../components/CreateScheduleModal';

export default function HomePage() {
  const location = useLocation();
  const { addToast } = useToast();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'today'>('today');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchSchedules();
      setSchedules(data);
    } catch (err) {
      addToast('error', 'Failed to load schedules');
      console.error('Failed to load schedules:', err);
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    loadData();
  
  }, [location.key]);

  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable;

      if (e.key === 'Escape') {
        setShowCreate(false);
        return;
      }

      if (isInput) return;

      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        setShowCreate(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const today = getLocalToday();
  const dateFiltered = useMemo(
    () => filter === 'today' ? schedules.filter((s) => s.date === today) : schedules,
    [schedules, today, filter],
  );

  const stats = useMemo(() => ({
    total: dateFiltered.length,
    missed: dateFiltered.filter((s) => s.status === 'missed').length,
    upcoming: dateFiltered.filter((s) => s.status === 'upcoming').length,
    inProgress: dateFiltered.filter((s) => s.status === 'in-progress').length,
    completed: dateFiltered.filter((s) => s.status === 'completed').length,
  }), [dateFiltered]);

  const displayedSchedules = useMemo(
    () => statusFilter ? dateFiltered.filter((s) => s.status === statusFilter) : dateFiltered,
    [dateFiltered, statusFilter],
  );

  const toggleStatus = (status: string | null) => {
    setStatusFilter((prev) => prev === status ? null : status);
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">Dashboard</h1>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <StatCard
            title={filter === 'today' ? 'Total Today' : 'Total'}
            value={stats.total}
            icon={<CalendarDays className="w-5 h-5" />}
            color="blue"
            active={statusFilter === null}
            onClick={() => toggleStatus(null)}
          />
          <StatCard
            title="Missed"
            value={stats.missed}
            icon={<AlertTriangle className="w-5 h-5" />}
            color="red"
            active={statusFilter === 'missed'}
            onClick={() => toggleStatus('missed')}
          />
          <StatCard
            title="Upcoming"
            value={stats.upcoming}
            icon={<Clock className="w-5 h-5" />}
            color="amber"
            active={statusFilter === 'upcoming'}
            onClick={() => toggleStatus('upcoming')}
          />
          <StatCard
            title="In Progress"
            value={stats.inProgress}
            icon={<Activity className="w-5 h-5" />}
            color="purple"
            active={statusFilter === 'in-progress'}
            onClick={() => toggleStatus('in-progress')}
          />
          <StatCard
            title="Completed"
            value={stats.completed}
            icon={<CheckCircle2 className="w-5 h-5" />}
            color="green"
            active={statusFilter === 'completed'}
            onClick={() => toggleStatus('completed')}
          />
        </div>
      </div>

      {/* Schedules List */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Schedules</h2>
            <button
              onClick={() => loadData()}
              disabled={loading}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer border-0 bg-transparent disabled:opacity-50"
              title="Refresh schedules"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors cursor-pointer border-0"
            >
              <Plus className="w-4 h-4" />
              New
            </button>
            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5">
              <button
                onClick={() => { setFilter('today'); setStatusFilter(null); }}
                className={`px-3 py-1 text-sm rounded-md font-medium transition-colors cursor-pointer border-0 ${
                  filter === 'today' ? 'bg-white dark:bg-gray-700 text-primary-700 dark:text-primary-300 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 bg-transparent'
                }`}
              >
                Today
              </button>
              <button
                onClick={() => { setFilter('all'); setStatusFilter(null); }}
                className={`px-3 py-1 text-sm rounded-md font-medium transition-colors cursor-pointer border-0 ${
                  filter === 'all' ? 'bg-white dark:bg-gray-700 text-primary-700 dark:text-primary-300 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 bg-transparent'
                }`}
              >
                All
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="space-y-2">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : displayedSchedules.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <ClipboardList className="w-8 h-8 text-gray-300 dark:text-gray-600" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-medium mb-1">
              {filter === 'today' ? 'No visits scheduled for today' : 'No schedules found'}
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">
              {statusFilter ? 'Try clearing the status filter above' : 'Create a new schedule to get started'}
            </p>
            {!statusFilter && (
              <button
                onClick={() => setShowCreate(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors cursor-pointer border-0"
              >
                <Plus className="w-4 h-4" />
                Create Schedule
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {displayedSchedules.map((schedule) => (
              <ScheduleCard key={schedule.id} schedule={schedule} showDate={filter === 'all'} />
            ))}
          </div>
        )}
      </div>

      {showCreate && (
        <CreateScheduleModal
          onClose={() => setShowCreate(false)}
          onCreated={loadData}
        />
      )}
    </div>
  );
}

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, MapPin, Play, Square, AlertCircle, Loader2, Trash2, User, BadgeCheck, MoreVertical } from 'lucide-react';
import type { Schedule } from '../types';
import { fetchScheduleById, startVisit, endVisit, updateTaskStatus, deleteSchedule, deleteTask } from '../api/schedules';
import { useGeolocation } from '../hooks/useGeolocation';
import { useToast } from '../contexts/ToastContext';
import { extractErrorMessage } from '../utils/error';
import { formatDisplayDate, formatRelativeTime, formatDuration } from '../utils/date';
import StatusBadge from '../components/StatusBadge';
import TaskItem from '../components/TaskItem';
import AddTaskForm from '../components/AddTaskForm';
import ConfirmDialog from '../components/ConfirmDialog';
import ActionError from '../components/ActionError';

export default function ScheduleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const { loading: geoLoading, getLocation, clearError: clearGeoError } = useGeolocation();

  const [confirmState, setConfirmState] = useState<{
    type: 'schedule' | 'task';
    taskId?: string;
  } | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const loadSchedule = useCallback(async () => {
    if (!id) return;
    try {
      const data = await fetchScheduleById(id);
      setSchedule(data);
    } catch (err) {
      setActionError(extractErrorMessage(err, 'Failed to load schedule'));
      console.error('Failed to load schedule:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadSchedule();
  }, [loadSchedule]);

  
  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen]);

  const handleStartVisit = async () => {
    if (!id) return;
    setActionLoading(true);
    setActionError(null);
    clearGeoError();
    try {
      const location = await getLocation();
      const updated = await startVisit(id, location);
      setSchedule(updated);
      addToast('success', 'Visit started');
    } catch (err) {
      setActionError(extractErrorMessage(err, 'Failed to start visit'));
      console.error('Failed to start visit:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEndVisit = async () => {
    if (!id) return;
    setActionLoading(true);
    setActionError(null);
    clearGeoError();
    try {
      const location = await getLocation();
      const updated = await endVisit(id, location);
      setSchedule(updated);
      addToast('success', 'Visit completed');
    } catch (err) {
      setActionError(extractErrorMessage(err, 'Failed to end visit'));
      console.error('Failed to end visit:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleTaskUpdate = async (
    taskId: string,
    status: 'completed' | 'not-completed',
    reason?: string
  ) => {
    if (!id) return;
    setActionError(null);
    try {
      const updated = await updateTaskStatus(id, taskId, status, reason);
      setSchedule(updated);
      addToast('success', status === 'completed' ? 'Task completed' : 'Task skipped');
    } catch (err) {
      setActionError(extractErrorMessage(err, 'Failed to update task'));
      console.error('Failed to update task:', err);
    }
  };

  const handleConfirm = async () => {
    if (!id || !confirmState) return;
    setConfirmLoading(true);
    setActionError(null);
    try {
      if (confirmState.type === 'schedule') {
        await deleteSchedule(id);
        addToast('success', 'Schedule deleted');
        navigate('/');
        return;
      }
      if (confirmState.taskId) {
        await deleteTask(id, confirmState.taskId);
        addToast('success', 'Task deleted');
        loadSchedule();
      }
    } catch (err) {
      setActionError(extractErrorMessage(err, confirmState.type === 'schedule' ? 'Failed to delete schedule' : 'Failed to delete task'));
      console.error('Failed to delete:', err);
    } finally {
      setConfirmLoading(false);
      setConfirmState(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full" />
      </div>
    );
  }

  if (!schedule) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="w-12 h-12 mx-auto mb-2 text-red-400" />
        <p className="text-gray-500">Schedule not found</p>
      </div>
    );
  }

  const isInProgress = schedule.status === 'in-progress';
  const isCompleted = schedule.status === 'completed';
  const isMissed = schedule.status === 'missed';
  const canStart = schedule.status === 'upcoming';
  const canEnd = isInProgress;
  const tasksEnabled = isInProgress;
  const canAddTasks = !isCompleted && !isMissed;

  const completedTasks = schedule.tasks.filter((t) => t.status === 'completed').length;
  const totalTasks = schedule.tasks.length;

  return (
    <div className="space-y-4">
      {/* Schedule Info Card */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 transition-colors">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">{schedule.clientName}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{formatDisplayDate(schedule.date)}</p>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={schedule.status} size="md" />
            {/* Overflow menu (#5) */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((prev) => !prev)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer border-0 bg-transparent"
                title="More options"
              >
                <MoreVertical className="w-5 h-5" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-full mt-1 w-44 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20 animate-fade-in">
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      setConfirmState({ type: 'schedule' });
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors cursor-pointer border-0 bg-transparent text-left"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Schedule
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400 dark:text-gray-500" />
            <span>
              {schedule.startTime} – {schedule.endTime}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span>{schedule.location.address}</span>
          </div>
          {schedule.caregiverName && (
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-400" />
              <span>{schedule.caregiverName}</span>
            </div>
          )}
          {schedule.employeeId && (
            <div className="flex items-center gap-2">
              <BadgeCheck className="w-4 h-4 text-gray-400" />
              <span>{schedule.employeeId}</span>
            </div>
          )}
        </div>

        {/* Clock In/Out Info */}
        {schedule.clockIn && (
          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 space-y-2 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="font-medium text-gray-700 dark:text-gray-300">Clocked In</span>
              <span className="text-gray-400">{new Date(schedule.clockIn.timestamp).toLocaleString()}</span>
              <span className="text-xs text-gray-400 dark:text-gray-500">({formatRelativeTime(schedule.clockIn.timestamp)})</span>
              {schedule.clockIn.latitude === 0 && schedule.clockIn.longitude === 0 ? (
                <span className="text-xs text-gray-400 italic">Location not recorded</span>
              ) : (
                <a
                  href={`https://www.openstreetmap.org/?mlat=${schedule.clockIn.latitude}&mlon=${schedule.clockIn.longitude}#map=16/${schedule.clockIn.latitude}/${schedule.clockIn.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
                >
                  {schedule.clockIn.latitude.toFixed(4)}, {schedule.clockIn.longitude.toFixed(4)} ↗
                </a>
              )}
            </div>
            {schedule.clockOut && (
              <div className="flex flex-wrap items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span className="font-medium text-gray-700 dark:text-gray-300">Clocked Out</span>
                <span className="text-gray-400">{new Date(schedule.clockOut.timestamp).toLocaleString()}</span>
                <span className="text-xs text-gray-400 dark:text-gray-500">({formatRelativeTime(schedule.clockOut.timestamp)})</span>
                {schedule.clockOut.latitude === 0 && schedule.clockOut.longitude === 0 ? (
                  <span className="text-xs text-gray-400 italic">Location not recorded</span>
                ) : (
                  <a
                    href={`https://www.openstreetmap.org/?mlat=${schedule.clockOut.latitude}&mlon=${schedule.clockOut.longitude}#map=16/${schedule.clockOut.latitude}/${schedule.clockOut.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
                  >
                    {schedule.clockOut.latitude.toFixed(4)}, {schedule.clockOut.longitude.toFixed(4)} ↗
                  </a>
                )}
              </div>
            )}
            {schedule.clockIn && schedule.clockOut && (
              <div className="flex items-center gap-2 pt-1">
                <div className="w-2 h-2" />
                <span className="text-xs font-medium text-primary-600 dark:text-primary-400">
                  Visit duration: {formatDuration(schedule.clockIn.timestamp, schedule.clockOut.timestamp)}
                </span>
              </div>
            )}
            {schedule.clockIn && !schedule.clockOut && (
              <div className="flex items-center gap-2 pt-1">
                <div className="w-2 h-2" />
                <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
                  Clocked in for {formatDuration(schedule.clockIn.timestamp, new Date().toISOString())}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {!isMissed && !isCompleted && (
        <div className="flex gap-3">
          {canStart && (
            <button
              onClick={handleStartVisit}
              disabled={actionLoading || geoLoading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer border-0 text-base"
            >
              {actionLoading || geoLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Play className="w-5 h-5" />
              )}
              Start Visit
            </button>
          )}
          {canEnd && (
            <button
              onClick={handleEndVisit}
              disabled={actionLoading || geoLoading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer border-0 text-base"
            >
              {actionLoading || geoLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Square className="w-5 h-5" />
              )}
              End Visit
            </button>
          )}
        </div>
      )}

      {/* Inline Action Error */}
      {actionError && (
        <ActionError message={actionError} onDismiss={() => setActionError(null)} />
      )}

      {/* Tasks */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Care Activities</h2>
          {totalTasks > 0 && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {completedTasks}/{totalTasks} completed
            </span>
          )}
        </div>

        {/* Progress Bar */}
        {totalTasks > 0 && (
          <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2 mb-3">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(completedTasks / totalTasks) * 100}%` }}
            />
          </div>
        )}

        {!isInProgress && !isCompleted && schedule.tasks.length > 0 && (
          <p className="text-sm text-gray-400 mb-3">
            Tasks will be available once the visit is started.
          </p>
        )}

        <div className="space-y-2">
          {schedule.tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              disabled={!tasksEnabled}
              onUpdate={handleTaskUpdate}
              onDelete={canAddTasks ? (taskId) => setConfirmState({ type: 'task', taskId }) : undefined}
            />
          ))}
        </div>

        {/* Add Task Form */}
        {canAddTasks && id && (
          <div className="mt-3">
            <AddTaskForm scheduleId={id} onTaskAdded={loadSchedule} />
          </div>
        )}
      </div>

      {/* Confirm Dialog */}
      {confirmState && (
        <ConfirmDialog
          title={confirmState.type === 'schedule' ? 'Delete Schedule' : 'Delete Task'}
          message={
            confirmState.type === 'schedule'
              ? `This will permanently remove "${schedule.clientName}" and all associated tasks.`
              : 'This task will be permanently removed from this schedule.'
          }
          confirmLabel="Delete"
          variant="danger"
          loading={confirmLoading}
          onConfirm={handleConfirm}
          onCancel={() => setConfirmState(null)}
        />
      )}
    </div>
  );
}

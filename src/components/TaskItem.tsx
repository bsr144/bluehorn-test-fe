import { useState } from 'react';
import { CheckCircle2, XCircle, Circle, MessageSquare, Trash2 } from 'lucide-react';
import type { Task } from '../types';

interface TaskItemProps {
  task: Task;
  disabled: boolean;
  onUpdate: (taskId: string, status: 'completed' | 'not-completed', reason?: string) => void;
  onDelete?: (taskId: string) => void;
}

export default function TaskItem({ task, disabled, onUpdate, onDelete }: TaskItemProps) {
  const [showReasonInput, setShowReasonInput] = useState(false);
  const [reason, setReason] = useState(task.reason || '');

  const handleComplete = () => {
    if (task.status === 'completed') return;
    onUpdate(task.id, 'completed');
    setShowReasonInput(false);
  };

  const handleNotCompleted = () => {
    if (task.status === 'not-completed') return;
    setShowReasonInput(true);
  };

  const handleSubmitReason = () => {
    if (!reason.trim()) return;
    onUpdate(task.id, 'not-completed', reason.trim());
    setShowReasonInput(false);
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-3 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 flex-1">
          {task.status === 'completed' ? (
            <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
          ) : task.status === 'not-completed' ? (
            <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          ) : (
            <Circle className="w-5 h-5 text-gray-300 dark:text-gray-600 flex-shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <p
              className={`text-sm font-medium ${
                task.status === 'completed' ? 'text-gray-400 dark:text-gray-500 line-through' : 'text-gray-800 dark:text-gray-200'
              }`}
            >
              {task.title}
            </p>
            {task.status === 'not-completed' && task.reason && (
              <p className="text-xs text-red-500 dark:text-red-400 mt-1 flex items-center gap-1">
                <MessageSquare className="w-3 h-3" />
                {task.reason}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          {!disabled && task.status === 'pending' && (
            <>
              <button
                onClick={handleComplete}
                className="px-2.5 py-1 text-xs font-medium rounded-md bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors cursor-pointer border-0"
              >
                Done
              </button>
              <button
                onClick={handleNotCompleted}
                className="px-2.5 py-1 text-xs font-medium rounded-md bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors cursor-pointer border-0"
              >
                Skip
              </button>
            </>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(task.id)}
              className="p-1 text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 transition-colors cursor-pointer border-0 bg-transparent"
              title="Delete task"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {showReasonInput && (
        <div className="mt-2 ml-7 flex gap-2">
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason for not completing..."
            className="flex-1 text-sm border border-gray-300 dark:border-gray-700 rounded-md px-2.5 py-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleSubmitReason()}
          />
          <button
            onClick={handleSubmitReason}
            disabled={!reason.trim()}
            className="px-3 py-1.5 text-xs font-medium rounded-md bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer border-0"
          >
            Submit
          </button>
          <button
            onClick={() => setShowReasonInput(false)}
            className="px-3 py-1.5 text-xs font-medium rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer border-0"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

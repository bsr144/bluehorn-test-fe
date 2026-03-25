import { useState, useRef } from 'react';
import { Plus, Loader2, AlertOctagon } from 'lucide-react';
import { createTask } from '../api/schedules';
import { useToast } from '../contexts/ToastContext';
import { extractErrorMessage } from '../utils/error';

interface Props {
  scheduleId: string;
  onTaskAdded: () => void;
}

export default function AddTaskForm({ scheduleId, onTaskAdded }: Props) {
  const { addToast } = useToast();
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hint, setHint] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await createTask(scheduleId, description.trim());
      addToast('success', 'Task added');
      setDescription('');
      onTaskAdded();
    } catch (err) {
      setError(extractErrorMessage(err, 'Failed to add task'));
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    if (!description.trim()) {
      setHint(true);
      inputRef.current?.focus();
      setTimeout(() => setHint(false), 2000);
    }
  };

  return (
    <div className="space-y-2">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            value={description}
            onChange={(e) => { setDescription(e.target.value); setError(null); setHint(false); }}
            placeholder="e.g., Medication reminder, Meal prep, Mobility exercise..."
            className={`w-full text-sm border rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${error ? 'border-red-300 dark:border-red-700' : 'border-gray-300 dark:border-gray-700'}`}
          />
          {hint && (
            <span className="absolute -bottom-5 left-0 text-xs text-amber-600 dark:text-amber-400 animate-fade-in">
              Type a description first
            </span>
          )}
        </div>
        <button
          type="submit"
          disabled={loading || !description.trim()}
          onClick={handleAddClick}
          className="px-3 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer border-0 flex items-center gap-1 text-sm font-medium"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          Add
        </button>
      </form>
      {error && (
        <div className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400">
          <AlertOctagon className="w-3.5 h-3.5" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

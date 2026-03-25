import { useEffect, useState } from 'react';
import { CheckCircle2, Info, X } from 'lucide-react';
import { useToast, type Toast } from '../contexts/ToastContext';

const DURATION = 3500;

const config = {
  success: {
    icon: CheckCircle2,
    bar: 'bg-green-500',
    bg: 'bg-gray-900',
    iconColor: 'text-green-400',
  },
  info: {
    icon: Info,
    bar: 'bg-blue-500',
    bg: 'bg-gray-900',
    iconColor: 'text-blue-400',
  },
  error: {
    icon: Info,
    bar: 'bg-red-500',
    bg: 'bg-gray-900',
    iconColor: 'text-red-400',
  },
};

function SnackbarItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const [exiting, setExiting] = useState(false);
  const c = config[toast.type];
  const Icon = c.icon;

  useEffect(() => {
    const exitTimer = setTimeout(() => setExiting(true), DURATION - 300);
    return () => clearTimeout(exitTimer);
  }, []);

  return (
    <div
      className={`${c.bg} rounded-xl shadow-2xl overflow-hidden transition-all duration-300 ${
        exiting ? 'opacity-0 translate-y-4 scale-95' : 'opacity-100 translate-y-0 scale-100'
      }`}
      style={{ animation: exiting ? 'none' : 'snackbar-in 0.35s cubic-bezier(0.16, 1, 0.3, 1)' }}
    >
      <div className="flex items-center gap-3 px-4 py-3">
        <Icon className={`w-5 h-5 ${c.iconColor} flex-shrink-0`} />
        <p className="text-sm text-white flex-1 font-medium">{toast.message}</p>
        <button
          onClick={onDismiss}
          className="text-gray-400 hover:text-white cursor-pointer border-0 bg-transparent p-0.5 flex-shrink-0 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="h-0.5 bg-gray-800">
        <div
          className={`h-full ${c.bar} rounded-full`}
          style={{
            animation: `snackbar-progress ${DURATION}ms linear forwards`,
          }}
        />
      </div>
    </div>
  );
}

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 w-full max-w-md px-4">
      {toasts.map((toast) => (
        <SnackbarItem key={toast.id} toast={toast} onDismiss={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}

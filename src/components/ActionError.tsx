import { X, AlertOctagon } from 'lucide-react';

interface Props {
  message: string;
  onDismiss: () => void;
}

export default function ActionError({ message, onDismiss }: Props) {
  const lines = message.split('\n');
  const isMultiLine = lines.length > 1;

  return (
    <div className="bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-start gap-3 animate-slide-in">
      <AlertOctagon className="w-5 h-5 text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        {isMultiLine ? (
          <ul className="text-sm text-red-700 dark:text-red-300 space-y-0.5 list-none m-0 p-0">
            {lines.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-red-700 dark:text-red-300">{message}</p>
        )}
      </div>
      <button
        onClick={onDismiss}
        className="text-red-400 hover:text-red-600 dark:hover:text-red-300 cursor-pointer border-0 bg-transparent p-0.5 flex-shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

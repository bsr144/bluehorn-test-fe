export default function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          {/* Heading bar + badge */}
          <div className="flex items-center gap-2 mb-1.5">
            <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded-full" />
          </div>

          {/* Client name chip */}
          <div className="mb-2">
            <div className="h-5 w-24 bg-gray-100 dark:bg-gray-800 rounded-full" />
          </div>

          {/* Two text lines */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
            <div className="h-4 w-28 bg-gray-100 dark:bg-gray-800 rounded" />
            <div className="h-4 w-36 bg-gray-100 dark:bg-gray-800 rounded" />
          </div>
        </div>
        <div className="w-5 h-5 bg-gray-100 dark:bg-gray-800 rounded flex-shrink-0 mt-1" />
      </div>
    </div>
  );
}

// Skeleton component for Oracle page loading state
export function OraclePageSkeleton() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header skeleton */}
        <div className="animate-pulse mb-8">
          <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded w-1/3 mb-4"></div>
          <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-1/2"></div>
        </div>

        {/* Market phase skeleton */}
        <div className="animate-pulse mb-8 p-6 bg-gray-100 dark:bg-gray-900 rounded-lg">
          <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/4 mb-3"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-5/6"></div>
        </div>

        {/* Ideas cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="animate-pulse p-6 bg-gray-100 dark:bg-gray-900 rounded-lg">
              <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-4/5 mb-4"></div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-2/3"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Loading text */}
        <div className="text-center mt-8 text-gray-500 dark:text-gray-400">
          <div className="inline-flex items-center gap-2">
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Loading market analysis...</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Skeleton for admin panel
export function AdminPanelSkeleton() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="animate-pulse">
          <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded w-1/4 mb-8"></div>
          
          {/* Tabs skeleton */}
          <div className="flex gap-4 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 bg-gray-200 dark:bg-gray-800 rounded w-32"></div>
            ))}
          </div>

          {/* Content skeleton */}
          <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-6">
            <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-1/3 mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 bg-gray-200 dark:bg-gray-800 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Skeleton for account page
export function AccountPageSkeleton() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded w-1/3 mb-8"></div>
          
          <div className="grid gap-6">
            {/* Profile section */}
            <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-6">
              <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-1/4 mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4"></div>
              </div>
            </div>

            {/* Preferences section */}
            <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-6">
              <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-1/3 mb-4"></div>
              <div className="space-y-3">
                <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded w-full"></div>
                <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded w-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

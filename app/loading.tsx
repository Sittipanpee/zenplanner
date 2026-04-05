/**
 * Root Loading State
 * Shows while page is loading — dark mode ready
 */

export default function Loading() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col items-center justify-center">
      <div className="text-center space-y-4">
        {/* Loading Spinner */}
        <div className="relative w-16 h-16 mx-auto">
          <div className="absolute inset-0 rounded-full border-4 border-[var(--border-primary)]" />
          <div className="absolute inset-0 rounded-full border-4 border-[var(--accent-primary)] border-t-transparent animate-spin" />
        </div>

        {/* Loading Text */}
        <p className="text-[var(--text-secondary)] animate-pulse">
          Loading...
        </p>
      </div>
    </div>
  )
}

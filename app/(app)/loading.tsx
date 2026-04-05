/**
 * App Group Loading State — dark mode ready
 */

export default function Loading() {
  return (
    <div className="min-h-screen bg-zen-bg flex flex-col items-center justify-center">
      <div className="text-center space-y-4">
        <div className="relative w-16 h-16 mx-auto">
          <div className="absolute inset-0 rounded-full border-4 border-zen-border" />
          <div className="absolute inset-0 rounded-full border-4 border-zen-sage border-t-transparent animate-spin" />
        </div>
        <p className="text-zen-text-secondary animate-pulse">Loading...</p>
      </div>
    </div>
  )
}

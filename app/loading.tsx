/**
 * Root Loading State — visual-only spinner (no text = no i18n needed)
 * Dark mode ready via zen CSS variables
 */

export default function Loading() {
  return (
    <div className="min-h-screen bg-zen-bg flex flex-col items-center justify-center">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-zen-border" />
        <div className="absolute inset-0 rounded-full border-4 border-zen-sage border-t-transparent animate-spin" />
      </div>
    </div>
  )
}

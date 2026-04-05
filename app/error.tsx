'use client'

import { useEffect } from 'react'

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Root error boundary caught:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-zen-bg p-4">
      <div className="text-center space-y-4 max-w-md">
        <div className="text-5xl">&#x26A0;&#xFE0F;</div>
        <h2 className="text-xl font-semibold text-zen-text">Something went wrong</h2>
        <p className="text-zen-text-muted text-sm">{error.message || 'An unexpected error occurred.'}</p>
        <button
          onClick={reset}
          className="px-6 py-2 bg-zen-accent text-white rounded-lg hover:opacity-90 transition-opacity"
        >
          Try again
        </button>
        <div>
          <a href="/" className="text-zen-text-muted text-sm underline">Return home</a>
        </div>
      </div>
    </div>
  )
}

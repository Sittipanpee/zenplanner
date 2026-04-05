/**
 * Download Card Component
 * Format selection and download buttons for generated planner
 * FIX: CSV option disabled with "Coming soon", hardcoded sheet count uses prop
 * i18n + dark mode ready
 */

'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Download, FileSpreadsheet, FileCode, Loader2, CheckCircle2 } from 'lucide-react'
import { ZenButton } from '../ui/zen-button'
import { ZenCard } from '../ui/zen-card'
import type { PlannerFormat } from '@/lib/types'

export interface DownloadCardProps {
  plannerTitle: string
  format?: PlannerFormat
  sheetsCount?: number
  toolCount?: number
  fileSize?: string
  onDownloadGoogleSheets?: () => void
  onDownloadExcelVba?: () => void
  isDownloading?: boolean
  downloadProgress?: number
}

export function DownloadCard({
  plannerTitle,
  format = 'google_sheets',
  sheetsCount = 0,
  toolCount = 0,
  fileSize = 'N/A',
  onDownloadGoogleSheets,
  onDownloadExcelVba,
  isDownloading = false,
  downloadProgress = 0,
}: DownloadCardProps) {
  const t = useTranslations('planner.done')
  const [selectedFormat, setSelectedFormat] = useState<PlannerFormat>(format)
  const [downloaded, setDownloaded] = useState(false)

  const handleDownload = async () => {
    setDownloaded(true)
    if (selectedFormat === 'google_sheets') {
      onDownloadGoogleSheets?.()
    } else {
      onDownloadExcelVba?.()
    }
    setTimeout(() => setDownloaded(false), 2000)
  }

  const formats: { id: PlannerFormat; label: string; icon: React.ReactNode; desc: string; disabled: boolean }[] = [
    {
      id: 'google_sheets',
      label: t('downloadSheets'),
      icon: <FileSpreadsheet className="w-5 h-5" />,
      desc: 'Google Sheets / Excel',
      disabled: false,
    },
    {
      id: 'excel_vba',
      label: t('downloadExcel'),
      icon: <FileCode className="w-5 h-5" />,
      desc: 'Excel VBA',
      disabled: false,
    },
  ]

  return (
    <ZenCard variant="default" padding="lg" className="w-full max-w-md">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-zen-gold/10 mb-4">
          <Download className="w-8 h-8 text-zen-gold" />
        </div>
        <h2 className="font-display text-xl font-semibold text-zen-text">{t('title')}</h2>
        <p className="text-sm text-zen-text-secondary mt-1 truncate">{plannerTitle}</p>
      </div>

      {/* File Info — uses actual tool count from props */}
      <div className="flex items-center justify-center gap-4 mb-6 text-sm text-zen-text-secondary">
        <div className="flex items-center gap-1.5">
          <FileSpreadsheet className="w-4 h-4" />
          <span>{toolCount > 0 ? toolCount : sheetsCount} tools</span>
        </div>
        <span className="text-zen-border">|</span>
        <div className="flex items-center gap-1.5">
          <span>~{fileSize}</span>
        </div>
      </div>

      {/* Format Selection */}
      <div className="space-y-3 mb-6">
        {formats.map((f) => (
          <button
            key={f.id}
            onClick={() => !f.disabled && setSelectedFormat(f.id)}
            disabled={f.disabled}
            className={`
              w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200
              ${f.disabled ? 'opacity-50 cursor-not-allowed' : ''}
              ${selectedFormat === f.id && !f.disabled
                ? 'border-zen-sage bg-zen-sage/5'
                : 'border-zen-border hover:border-zen-border-hover bg-zen-surface'
              }
            `}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${selectedFormat === f.id ? 'bg-zen-sage text-white' : 'bg-zen-surface-alt text-zen-text-secondary'}`}>
              {f.icon}
            </div>
            <div className="flex-1 text-left">
              <p className="font-medium text-zen-text">{f.label}</p>
              <p className="text-xs text-zen-text-muted">{f.desc}</p>
            </div>
            {selectedFormat === f.id && !f.disabled && (
              <CheckCircle2 className="w-5 h-5 text-zen-sage flex-shrink-0" />
            )}
          </button>
        ))}

        {/* CSV option — grayed out with "Coming soon" */}
        <div className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-zen-border bg-zen-surface opacity-50 cursor-not-allowed">
          <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-zen-surface-alt text-zen-text-muted">
            <FileCode className="w-5 h-5" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-medium text-zen-text">CSV</p>
            <p className="text-xs text-zen-text-muted">Coming soon</p>
          </div>
        </div>
      </div>

      {/* Download Button */}
      <ZenButton variant="primary" size="lg" fullWidth onClick={handleDownload} disabled={isDownloading}>
        {isDownloading ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            <span>{downloadProgress}%</span>
          </>
        ) : downloaded ? (
          <>
            <CheckCircle2 className="w-5 h-5 mr-2" />
            <span>{t('title')}</span>
          </>
        ) : (
          <>
            <Download className="w-5 h-5 mr-2" />
            <span>{t('downloadExcel')}</span>
          </>
        )}
      </ZenButton>
    </ZenCard>
  )
}

export default DownloadCard

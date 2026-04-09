'use client'

import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import releases from '@/data/releases'

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function ReleasesPage() {
  const router = useRouter()

  return (
    <div className="max-w-2xl mx-auto px-8 py-6">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ChevronLeft className="w-4 h-4" />
        Back
      </button>

      <h1 className="text-2xl font-semibold mb-8">Release notes</h1>

      <div className="flex flex-col gap-6">
        {releases.map((release, i) => (
          <div key={i} className="flex gap-6 items-start">
            <span className="text-sm text-muted-foreground whitespace-nowrap pt-[2px] w-32 shrink-0">
              {formatDate(release.date)}
            </span>
            <p className="text-sm leading-relaxed">{release.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

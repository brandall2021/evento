import Link from "next/link"
import { cn } from "@/lib/utils"

type BrandMarkProps = {
  compact?: boolean
  className?: string
  href?: string
}

export function BrandMark({ compact = false, className, href = "/" }: BrandMarkProps) {
  const content = (
    <div className={cn("inline-flex items-center gap-3", className)}>
      <div className="flex size-11 items-center justify-center rounded-[1rem] border border-white/10 bg-[linear-gradient(145deg,theme(colors.slate.950),theme(colors.slate.800))] shadow-[0_18px_40px_rgba(11,42,85,0.22)]">
        <svg viewBox="0 0 44 44" aria-hidden="true" className="size-8">
          <rect x="5" y="5" width="34" height="34" rx="12" fill="#0B2A55" />
          <path d="M14 12h5.5v20H30" fill="none" stroke="#FFB84D" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M28 14l6.5 6.5" fill="none" stroke="#F7F3EB" strokeWidth="3.4" strokeLinecap="round" />
          <circle cx="29.5" cy="30.5" r="2.2" fill="#F7F3EB" />
        </svg>
      </div>

      {!compact && (
        <div className="leading-none">
          <div className="text-[0.65rem] font-semibold uppercase tracking-[0.42em] text-muted-foreground">
            LACDI
          </div>
          <div className="mt-1 text-sm font-semibold text-foreground">
            Plataforma de eventos
          </div>
        </div>
      )}
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="inline-flex focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background">
        {content}
      </Link>
    )
  }

  return content
}

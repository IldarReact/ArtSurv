import { ChevronDown } from 'lucide-react'
import { useState } from 'react'

interface ExpandableCardProps {
  children?: React.ReactNode
  description: string
  image?: string
  onExpand?: (expanded: boolean) => void
  title: string
}

export function ExpandableCard({
  children,
  description,
  image,
  onExpand,
  title,
}: ExpandableCardProps) {
  const [expanded, setExpanded] = useState(false)

  const handleToggle = () => {
    setExpanded(!expanded)
    onExpand?.(!expanded)
  }

  return (
    <div
      className={`
        border border-border rounded-lg overflow-hidden transition-all duration-300
        ${expanded ? 'col-span-full lg:col-span-full' : ''}
        ${expanded ? 'bg-card' : 'bg-card hover:border-accent'}
      `}
    >
      <button
        className="w-full p-6 flex items-center gap-4 hover:bg-muted/30 transition-colors text-left"
        onClick={handleToggle}
      >
        {image && (
          <div className="w-20 h-20 rounded bg-muted shrink-0 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt={title}
              className="w-full h-full object-cover"
              src={image || '/placeholder.svg'}
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground text-lg">{title}</h3>
          <p className="text-muted-foreground text-sm line-clamp-2">{description}</p>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-muted-foreground shrink-0 transition-transform ${
            expanded ? 'rotate-180' : ''
          }`}
        />
      </button>

      {expanded && <div className="px-6 py-4 border-t border-border bg-background">{children}</div>}
    </div>
  )
}

interface DayGroupProps {
  label: string
  children: React.ReactNode
}

export default function DayGroup({ label, children }: DayGroupProps) {
  return (
    <div>
      {label && (
        <div className="sticky top-12 z-10 py-2 px-4 md:px-8 bg-background/95 backdrop-blur">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {label}
          </span>
        </div>
      )}
      <div>{children}</div>
    </div>
  )
}

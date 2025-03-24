import { Skeleton } from "@/components/shadcn-ui/skeleton"

export function CalendarSkeleton() {
  return (
    <div className="flex-1 overflow-hidden bg-calendar-bg-primary text-calendar-text-primary">
      {/* Header Skeleton */}
      <header className="h-16 border-b border-calendar-border-primary flex items-center justify-between px-6 bg-calendar-bg-secondary">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 bg-calendar-hover" />
          <Skeleton className="h-6 w-32 bg-calendar-hover" />
          <Skeleton className="h-8 w-8 bg-calendar-hover" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-24 bg-calendar-hover" />
          <Skeleton className="h-8 w-32 bg-calendar-hover" />
        </div>
      </header>

      {/* Status bar skeleton */}
      <div className="bg-calendar-bg-secondary p-4 border-b border-calendar-border-primary flex justify-between items-center">
        <Skeleton className="h-4 w-40 bg-calendar-hover" />
        <Skeleton className="h-4 w-60 bg-calendar-hover" />
      </div>

      {/* Week day labels */}
      <div className="flex border-b border-calendar-border-primary bg-calendar-bg-secondary">
        <div className="w-[72px] py-4 px-2">
          <Skeleton className="h-5 w-12 bg-calendar-hover" />
        </div>
        {[...Array(7)].map((_, i) => (
          <div key={i} className="flex-1 px-2 py-4 text-center">
            <Skeleton className="h-5 w-16 mx-auto bg-calendar-hover" />
          </div>
        ))}
      </div>

      {/* Calendar Grid Skeleton */}
      <div className="flex-1 overflow-auto">
        <div className="flex h-[1440px] relative">
          {/* Time column */}
          <div className="w-[72px] flex-none border-r border-calendar-border-primary sticky left-0 bg-calendar-bg-primary">
            {[...Array(24)].map((_, i) => (
              <div key={i} className="h-[60px] relative">
                <div className="absolute -top-2 right-4">
                  <Skeleton className="h-4 w-10 bg-calendar-hover" />
                </div>
              </div>
            ))}
          </div>

          {/* Day columns with sparse events */}
          <div className="flex-1 grid grid-cols-7 divide-x divide-calendar-border-tertiary">
            {[...Array(7)].map((_, dayIndex) => (
              <div key={dayIndex} className="relative h-full">
                {/* Only render 1-2 random events per day */}
                {dayIndex % 2 === 0 && (
                  <>
                    {/* Morning event */}
                    <div className="absolute top-[120px] left-1 right-1 h-[90px]">
                      <Skeleton className="h-full w-full rounded-md bg-calendar-hover opacity-40" />
                    </div>
                    
                    {/* Afternoon event */}
                    <div className="absolute top-[480px] left-1 right-1 h-[120px]">
                      <Skeleton className="h-full w-full rounded-md bg-calendar-hover opacity-40" />
                    </div>
                  </>
                )}
                
                {dayIndex % 3 === 0 && (
                  <div className="absolute top-[720px] left-1 right-1 h-[60px]">
                    <Skeleton className="h-full w-full rounded-md bg-calendar-hover opacity-40" />
                  </div>
                )}
                
                {dayIndex % 2 === 1 && (
                  <div className="absolute top-[300px] left-1 right-1 h-[150px]">
                    <Skeleton className="h-full w-full rounded-md bg-calendar-hover opacity-40" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

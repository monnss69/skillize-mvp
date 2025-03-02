import { Skeleton } from "@/components/shadcn-ui/skeleton"

export function CalendarSkeleton() {
  return (
    <div className="flex h-screen bg-[#0A0F14] text-[#E8E2D6]">
      {/* Sidebar Skeleton */}
      <div className="w-72 border-r border-[#1E2A36] flex flex-col bg-[#0D1419]">
        <div className="p-6 flex flex-col items-center">
          <Skeleton className="h-20 w-20 rounded-full bg-[#1E2A36]" />
          <Skeleton className="h-4 w-24 mt-4 bg-[#1E2A36]" />
          <Skeleton className="h-3 w-16 mt-2 bg-[#1E2A36]" />
        </div>
        <div className="flex-1 p-4 space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-full bg-[#1E2A36]" />
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header Skeleton */}
        <header className="h-16 border-b border-[#1E2A36] flex items-center justify-between px-6 bg-[#0D1419]">
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 bg-[#1E2A36]" />
            <Skeleton className="h-6 w-32 bg-[#1E2A36]" />
            <Skeleton className="h-8 w-8 bg-[#1E2A36]" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-24 bg-[#1E2A36]" />
            <Skeleton className="h-8 w-32 bg-[#1E2A36]" />
          </div>
        </header>

        {/* Calendar Skeleton */}
        <div className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-7 gap-4 mb-4">
            {[...Array(7)].map((_, i) => (
              <Skeleton key={i} className="h-8 bg-[#1E2A36]" />
            ))}
          </div>
          {[...Array(6)].map((_, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7 gap-4 mb-4">
              {[...Array(7)].map((_, dayIndex) => (
                <div key={dayIndex} className="h-32 bg-[#1E2A36]/30 rounded-lg p-2">
                  <Skeleton className="h-4 w-4 mb-2 bg-[#1E2A36]" />
                  <Skeleton className="h-6 w-full mb-2 bg-[#1E2A36]" />
                  <Skeleton className="h-4 w-3/4 bg-[#1E2A36]" />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}


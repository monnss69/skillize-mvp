export function ActionPanel({ className }: { className?: string }) {
    return (
      <aside className={`bg-[#242424] text-gray-300 p-4 flex flex-col gap-4 ${className}`}>
        {/* No upcoming meeting section */}
        <div className="mb-6">
          <h3 className="text-sm font-medium mb-2">No upcoming meeting</h3>
          <p className="text-xs text-gray-400">
            Add a new event to your calendar to get started.
          </p>
        </div>
      </aside> 

    );
  }
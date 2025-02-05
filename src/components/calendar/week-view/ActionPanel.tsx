export function ActionPanel({ className }: { className?: string }) {
    return (
      <aside className={`bg-[#242424] text-gray-300 p-4 flex flex-col gap-4 ${className}`}>
        {/* No upcoming meeting section */}
        <div className="mb-6">
          <h3 className="text-sm font-medium mb-2">No upcoming meeting</h3>
        </div>
      </aside>
    );
  }
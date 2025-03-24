import { CalendarSidebar } from "@/components/calendar/week-view/CalendarSidebar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0A0F14]">
      <CalendarSidebar className="w-1/6 border-r border-[rgb(30,42,54)]" />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
} 
"use client"

import { User, Lock, CreditCard, ArrowLeft } from "lucide-react"
import { Button } from "@/components/shadcn-ui/button"
import { ReactNode } from "react"
import { useRouter } from "next/navigation"
interface SettingsLayoutProps {
  children: ReactNode
  activeTab: string
  setActiveTab: (tab: string) => void
}

export default function SettingsLayout({ 
  children, 
  activeTab, 
  setActiveTab,
}: SettingsLayoutProps) {
  const router = useRouter()
  const settingsTabs = [
    { id: "profile", label: "Profile Settings", icon: User },
    { id: "account", label: "Account Settings", icon: Lock },
    { id: "subscription", label: "Subscription", icon: CreditCard },
  ]

  return (
    <div className="min-h-screen bg-[#0A0F14] text-[#E8E2D6]">
      {/* Top Navigation */}
      <nav className="bg-[#0D1419] p-4">
        <div className="container mx-auto flex justify-between items-center">
          <Button
            variant="ghost"
            size="icon"
            className="text-[#B8A47C] hover:text-[#D4C8A8] hover:bg-[#1E2A36]/30 h-10 w-10 mr-4"
            onClick={() => router.back()}
          >
            <ArrowLeft size={20} />
          </Button>
          <div className="flex space-x-4">
            {settingsTabs.map((tab) => (
              <Button
                key={tab.id}
                variant="ghost"
                className={`text-[#E8E2D6] hover:text-[#D4C8A8] hover:bg-[#1E2A36]/50 ${
                  activeTab === tab.id ? "bg-[#1E2A36]/30" : ""
                }`}
                onClick={() => {
                  setActiveTab(tab.id)
                }}
              >
                <tab.icon size={18} className="mr-2" />
                <span className="font-light">{tab.label}</span>
              </Button>
            ))}
          </div>
          <div className="w-10"></div> {/* Spacer for alignment */}
        </div>
      </nav>

      {/* Border */}
      <div className="relative h-0.5 bg-[#D3B665]"></div>

      {/* Main content */}
      <div className="container mx-auto mt-8 p-8 bg-[#0D1419] rounded-lg">
        {children}
      </div>
    </div>
  )
} 
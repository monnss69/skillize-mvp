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
    <div className="min-h-screen bg-settings-bg-primary text-settings-text-primary">
      {/* Top Navigation */}
      <nav className="bg-settings-bg-secondary p-4">
        <div className="container mx-auto flex justify-between items-center">
          <Button
            variant="ghost"
            size="icon"
            className="text-settings-text-accent hover:text-settings-text-accent-hover hover:bg-settings-bg-tertiary/30 h-10 w-10 mr-4"
            onClick={() => router.back()}
          >
            <ArrowLeft size={20} />
          </Button>
          <div className="flex space-x-4">
            {settingsTabs.map((tab) => (
              <Button
                key={tab.id}
                variant="ghost"
                className={`text-settings-text-primary hover:text-settings-text-accent-hover hover:bg-settings-bg-tertiary/50 ${
                  activeTab === tab.id ? "bg-settings-bg-tertiary/30" : ""
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
      <div className="relative h-0.5 bg-settings-button-primary"></div>

      {/* Main content */}
      <div className="container mx-auto mt-8 p-8 bg-settings-bg-secondary rounded-lg">
        {children}
      </div>
    </div>
  )
} 
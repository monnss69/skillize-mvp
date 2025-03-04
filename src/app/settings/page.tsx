"use client"

import { useState } from "react"
import SettingsLayout from "@/components/settings/settings-layout"
import ProfileSettings from "@/components/settings/profile-settings"
import AccountSettings from "@/components/settings/account-settings"
import SubscriptionSettings from "@/components/settings/subscription-settings"

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile")

  return (
    <SettingsLayout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab}
    >
      {activeTab === "profile" && <ProfileSettings />}
      {activeTab === "account" && <AccountSettings />}
      {activeTab === "subscription" && <SubscriptionSettings />}
    </SettingsLayout>
  )
} 
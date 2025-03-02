"use client"

import { useState } from "react"
import SettingsLayout from "@/components/settings/SettingsLayout"
import ProfileSettings from "@/components/settings/ProfileSettings"
import AccountSettings from "@/components/settings/AccountSettings"
import SubscriptionSettings from "@/components/settings/SubscriptionSettings"

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
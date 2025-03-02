"use client"

import { Computer, Apple } from "lucide-react"
import { Button } from "@/components/shadcn-ui/button"
import { GoogleConnectButton } from "@/components/ui/google-connect-button"

export default function AccountSettings() {
  return (
    <div className="space-y-6 max-w-md mx-auto">
      <h2 className="text-2xl font-light text-[#B8A47C] text-center mb-8">Account Settings</h2>
      <div className="space-y-4">
        <GoogleConnectButton />
        <Button className="w-full justify-start gap-3 bg-[#1E2A36] hover:bg-[#2A3A4A] text-[#E8E2D6]">
          <Computer size={18} />
          Connect with Outlook
        </Button>
        <Button className="w-full justify-start gap-3 bg-[#1E2A36] hover:bg-[#2A3A4A] text-[#E8E2D6]">
          <Apple size={18} />
          Connect with iOS
        </Button>
      </div>
    </div>
  )
} 
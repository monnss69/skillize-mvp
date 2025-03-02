"use client"

import { Button } from "@/components/shadcn-ui/button"
import { Badge } from "@/components/shadcn-ui/badge"

export default function SubscriptionSettings() {
  return (
    <div className="space-y-6 max-w-md mx-auto">
      <h2 className="text-2xl font-light text-[#B8A47C] text-center mb-8">Subscription</h2>
      <div className="space-y-4">
        <div className="bg-[#1E2A36] p-4 rounded-md">
          <div className="flex justify-between items-center mb-2">
            <span className="text-lg font-medium">Current Plan</span>
            <Badge variant="secondary" className="bg-[#B8A47C] text-[#0A0F14]">
              Premium
            </Badge>
          </div>
          <p className="text-[#8A8578]">Your next billing date is July 1, 2023</p>
        </div>
        <Button className="w-full justify-center bg-[#B8A47C] hover:bg-[#D4C8A8] text-[#0A0F14]">
          Upgrade Plan
        </Button>
        <Button
          variant="outline"
          className="w-full justify-center border-[#1E2A36] bg-transparent hover:bg-[#1E2A36]/50 hover:text-[#D4C8A8] text-[#E8E2D6]"
        >
          Cancel Subscription
        </Button>
      </div>
    </div>
  )
} 
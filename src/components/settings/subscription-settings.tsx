"use client"

import { Button } from "@/components/shadcn-ui/button"
import { Badge } from "@/components/shadcn-ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/shadcn-ui/card"
import { motion } from "framer-motion"
import { CreditCard, Calendar, Star, ArrowRight } from "lucide-react"

export default function SubscriptionSettings() {
  return (
    <motion.main 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container min-h-[calc(100vh-4rem)] py-8 relative"
    >
      {/* Background gradient */}
      <div className="absolute rounded-lg inset-0 bg-gradient-to-br from-[#1E2A36]/20 via-[#0A0F14] to-[#1E2A36]/10 pointer-events-none" />
      
      <div className="relative max-w-3xl mx-auto space-y-8">
        <div className="space-y-2 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-[#B8A47C]">Subscription</h2>
          <p className="text-[#E8E2D6]/60">Manage your subscription and billing</p>
        </div>

        <Card className="border-[#1E2A36] bg-[#0D1419] shadow-lg backdrop-blur-[2px] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#1E2A36]/10 via-transparent to-[#1E2A36]/5 opacity-50" />
          
          <CardHeader className="relative">
            <CardTitle className="text-xl font-semibold text-[#E8E2D6]">Current Plan</CardTitle>
            <CardDescription className="text-[#E8E2D6]/60">Your subscription details and billing information</CardDescription>
          </CardHeader>

          <CardContent className="relative space-y-6">
            {/* Current Plan Info */}
            <div className="flex items-start gap-4 p-4 rounded-lg bg-[#1E2A36]/30 border border-[#1E2A36]">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#1E2A36]/50 border border-[#B8A47C]/20">
                <Star className="h-6 w-6 text-[#B8A47C]" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-[#E8E2D6]">Premium Plan</h3>
                  <Badge className="bg-[#B8A47C] text-[#0A0F14] hover:bg-[#B8A47C]/90">Active</Badge>
                </div>
                <p className="text-[#E8E2D6]/60 mt-1">Access to all premium features and content</p>
              </div>
            </div>

            {/* Billing Info */}
            <div className="flex items-start gap-4 p-4 rounded-lg bg-[#1E2A36]/30 border border-[#1E2A36]">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#1E2A36]/50 border border-[#B8A47C]/20">
                <Calendar className="h-6 w-6 text-[#B8A47C]" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium text-[#E8E2D6]">Next Billing Date</h3>
                <p className="text-[#E8E2D6]/60 mt-1">July 1, 2023</p>
              </div>
            </div>

            {/* Payment Method */}
            <div className="flex items-start gap-4 p-4 rounded-lg bg-[#1E2A36]/30 border border-[#1E2A36]">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#1E2A36]/50 border border-[#B8A47C]/20">
                <CreditCard className="h-6 w-6 text-[#B8A47C]" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-[#E8E2D6]">Payment Method</h3>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-[#B8A47C] hover:text-[#B8A47C]/80 hover:bg-[#1E2A36]/50"
                  >
                    Update
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
                <p className="text-[#E8E2D6]/60 mt-1">Visa ending in 4242</p>
              </div>
            </div>

            <div className="pt-4 space-y-4">
              <Button 
                className="w-full bg-[#B8A47C] hover:bg-[#795f24] text-[#0A0F14] font-medium"
              >
                Upgrade Plan
              </Button>
              
              <Button
                variant="outline"
                className="w-full border-[#1E2A36] text-[#0A0F14] hover:bg-[#1E2A36]/50 hover:text-[#B8A47C] hover:border-[#B8A47C]/30"
              >
                Cancel Subscription
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.main>
  )
} 
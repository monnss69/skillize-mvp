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
      <div className="absolute rounded-lg inset-0 bg-gradient-to-br from-settings-gradient-from via-settings-gradient-via to-settings-gradient-to pointer-events-none" />
      
      <div className="relative max-w-3xl mx-auto space-y-8">
        <div className="space-y-2 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-settings-text-accent">Subscription</h2>
          <p className="text-settings-text-secondary">Manage your subscription and billing</p>
        </div>

        <Card className="border-settings-border-primary bg-settings-bg-secondary shadow-lg backdrop-blur-[2px] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-settings-gradient-from via-transparent to-settings-gradient-to opacity-50" />
          
          <CardHeader className="relative">
            <CardTitle className="text-xl font-semibold text-settings-text-primary">Current Plan</CardTitle>
            <CardDescription className="text-settings-text-secondary">Your subscription details and billing information</CardDescription>
          </CardHeader>

          <CardContent className="relative space-y-6">
            {/* Current Plan Info */}
            <div className="flex items-start gap-4 p-4 rounded-lg bg-settings-bg-tertiary/30 border border-settings-border-primary">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-settings-bg-tertiary/50 border border-settings-border-accent/20">
                <Star className="h-6 w-6 text-settings-text-accent" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-settings-text-primary">Premium Plan</h3>
                  <Badge className="bg-settings-button-primary text-settings-bg-primary hover:bg-settings-button-primary-hover">Active</Badge>
                </div>
                <p className="text-settings-text-secondary mt-1">Access to all premium features and content</p>
              </div>
            </div>

            {/* Billing Info */}
            <div className="flex items-start gap-4 p-4 rounded-lg bg-settings-bg-tertiary/30 border border-settings-border-primary">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-settings-bg-tertiary/50 border border-settings-border-accent/20">
                <Calendar className="h-6 w-6 text-settings-text-accent" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium text-settings-text-primary">Next Billing Date</h3>
                <p className="text-settings-text-secondary mt-1">July 1, 2023</p>
              </div>
            </div>

            {/* Payment Method */}
            <div className="flex items-start gap-4 p-4 rounded-lg bg-settings-bg-tertiary/30 border border-settings-border-primary">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-settings-bg-tertiary/50 border border-settings-border-accent/20">
                <CreditCard className="h-6 w-6 text-settings-text-accent" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-settings-text-primary">Payment Method</h3>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-settings-text-accent hover:text-settings-text-accent-hover hover:bg-settings-bg-tertiary/50"
                  >
                    Update
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
                <p className="text-settings-text-secondary mt-1">Visa ending in 4242</p>
              </div>
            </div>

            <div className="pt-4 space-y-4">
              <Button 
                className="w-full bg-settings-button-primary hover:bg-settings-button-primary-hover text-settings-bg-primary font-medium"
              >
                Upgrade Plan
              </Button>
              
              <Button
                variant="outline"
                className="w-full border-settings-border-primary text-settings-bg-primary hover:bg-settings-bg-tertiary/50 hover:text-settings-text-accent hover:border-settings-border-accent-hover"
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
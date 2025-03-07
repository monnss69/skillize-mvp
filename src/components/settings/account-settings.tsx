import { Computer, Apple, Globe, Check, Mail, Smartphone } from "lucide-react"
import { Button } from "@/components/shadcn-ui/button"
import { GoogleConnectButton } from "@/components/ui/google-connect-button"
import SignOutButton from "@/components/ui/sign-out-button"
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from "@/components/shadcn-ui/card"
import { ScrollArea } from "@/components/shadcn-ui/scroll-area"
import { motion } from "framer-motion"

export default function AccountSettings() {
  return (
    <motion.main 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container min-h-[calc(100vh-4rem)] py-8 relative"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1E2A36]/20 via-[#0A0F14] to-[#1E2A36]/10 pointer-events-none" />
      
      <div className="relative max-w-3xl mx-auto space-y-8">
        <div className="space-y-2 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-[#B8A47C]">Account Settings</h2>
          <p className="text-[#E8E2D6]/60">Manage your account connections and preferences</p>
        </div>

        <Card className="border-[#1E2A36] bg-[#0D1419] shadow-lg backdrop-blur-[2px] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#1E2A36]/10 via-transparent to-[#1E2A36]/5 opacity-50" />
          
          <CardHeader className="relative">
            <CardTitle className="text-xl font-semibold text-[#E8E2D6]">Connected Accounts</CardTitle>
            <CardDescription className="text-[#E8E2D6]/60">Manage your connected accounts and services</CardDescription>
          </CardHeader>

          <CardContent className="relative">
            <ScrollArea className="h-full pr-4">
              <div className="space-y-4">
                {/* Google Connection */}
                <GoogleConnectButton variant="cardConnect" />

                {/* Outlook - Not Connected */}
                <div className="group flex items-center justify-between p-4 rounded-lg border border-[#1E2A36] hover:border-[#B8A47C]/30 hover:bg-[#1E2A36]/20 transition-all duration-300">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#1E2A36]/50 border border-[#B8A47C]/20 group-hover:border-[#B8A47C]/30 group-hover:bg-[#1E2A36]/70 transition-colors duration-300">
                      <Mail className="h-6 w-6 text-[#B8A47C]/70 group-hover:text-[#B8A47C] transition-colors duration-300" />
                    </div>
                    <div>
                      <p className="font-medium text-lg text-[#E8E2D6]">Outlook</p>
                      <p className="text-[#E8E2D6]/60">Connect with Outlook</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    className="border-[#1E2A36] text-black hover:bg-[#1E2A36]/50 hover:text-[#B8A47C] group-hover:border-[#B8A47C]/30 transition-colors duration-300"
                  >
                    Connect
                  </Button>
                </div>

                {/* iOS - Not Connected */}
                <div className="group flex items-center justify-between p-4 rounded-lg border border-[#1E2A36] hover:border-[#B8A47C]/30 hover:bg-[#1E2A36]/20 transition-all duration-300">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#1E2A36]/50 border border-[#B8A47C]/20 group-hover:border-[#B8A47C]/30 group-hover:bg-[#1E2A36]/70 transition-colors duration-300">
                      <Smartphone className="h-6 w-6 text-[#B8A47C]/70 group-hover:text-[#B8A47C] transition-colors duration-300" />
                    </div>
                    <div>
                      <p className="font-medium text-lg text-[#E8E2D6]">iOS</p>
                      <p className="text-[#E8E2D6]/60">Connect with iOS</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline"
                    className="border-[#1E2A36] text-black hover:bg-[#1E2A36]/50 hover:text-[#B8A47C] group-hover:border-[#B8A47C]/30 transition-colors duration-300"
                  >
                    Connect
                  </Button>
                </div>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
        
        <div className="flex justify-center pt-4">
          <SignOutButton 
            className="px-8 bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 border border-red-500/30 hover:border-red-500/40 transition-colors duration-300" 
          />
        </div>
      </div>
    </motion.main>
  )
} 
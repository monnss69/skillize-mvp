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
      <div className="absolute inset-0 bg-gradient-to-br from-settings-gradient-from via-settings-gradient-via to-settings-gradient-to pointer-events-none" />
      
      <div className="relative max-w-3xl mx-auto space-y-8">
        <div className="space-y-2 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-settings-text-accent">Account Settings</h2>
          <p className="text-settings-text-secondary">Manage your account connections and preferences</p>
        </div>

        <Card className="border-settings-border-primary bg-settings-bg-secondary shadow-lg backdrop-blur-[2px] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-settings-gradient-from via-transparent to-settings-gradient-to opacity-50" />
          
          <CardHeader className="relative">
            <CardTitle className="text-xl font-semibold text-settings-text-primary">Connected Accounts</CardTitle>
            <CardDescription className="text-settings-text-secondary">Manage your connected accounts and services</CardDescription>
          </CardHeader>

          <CardContent className="relative">
            <ScrollArea className="h-full pr-4">
              <div className="space-y-4">
                {/* Google Connection */}
                <GoogleConnectButton variant="cardConnect" />

                {/* Outlook - Not Connected */}
                <div className="group flex items-center justify-between p-4 rounded-lg border border-settings-border-primary hover:border-settings-border-accent-hover hover:bg-settings-bg-tertiary/20 transition-all duration-300">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-settings-bg-tertiary/50 border border-settings-border-accent/20 group-hover:border-settings-border-accent/30 group-hover:bg-settings-bg-tertiary/70 transition-colors duration-300">
                      <Mail className="h-6 w-6 text-settings-text-accent/70 group-hover:text-settings-text-accent transition-colors duration-300" />
                    </div>
                    <div>
                      <p className="font-medium text-lg text-settings-text-primary">Outlook</p>
                      <p className="text-settings-text-secondary">Connect with Outlook</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    className="border-settings-border-primary text-black hover:bg-settings-bg-tertiary/50 hover:text-settings-text-accent group-hover:border-settings-border-accent-hover transition-colors duration-300"
                  >
                    Connect
                  </Button>
                </div>

                {/* iOS - Not Connected */}
                <div className="group flex items-center justify-between p-4 rounded-lg border border-settings-border-primary hover:border-settings-border-accent-hover hover:bg-settings-bg-tertiary/20 transition-all duration-300">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-settings-bg-tertiary/50 border border-settings-border-accent/20 group-hover:border-settings-border-accent/30 group-hover:bg-settings-bg-tertiary/70 transition-colors duration-300">
                      <Smartphone className="h-6 w-6 text-settings-text-accent/70 group-hover:text-settings-text-accent transition-colors duration-300" />
                    </div>
                    <div>
                      <p className="font-medium text-lg text-settings-text-primary">iOS</p>
                      <p className="text-settings-text-secondary">Connect with iOS</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline"
                    className="border-settings-border-primary text-black hover:bg-settings-bg-tertiary/50 hover:text-settings-text-accent group-hover:border-settings-border-accent-hover transition-colors duration-300"
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
            className="px-8 bg-settings-button-danger hover:bg-settings-button-danger-hover text-settings-button-danger-text hover:text-settings-button-danger-text-hover border border-settings-button-danger-text/30 hover:border-settings-button-danger-text/40 transition-colors duration-300" 
          />
        </div>
      </div>
    </motion.main>
  )
} 
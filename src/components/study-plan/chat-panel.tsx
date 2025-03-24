"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/shadcn-ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/shadcn-ui/card"
import { Input } from "@/components/shadcn-ui/input"
import { Avatar } from "@/components/shadcn-ui/avatar"
import { ScrollArea } from "@/components/shadcn-ui/scroll-area"
import { Send, Bot, User } from "lucide-react"

interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
}

export function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hello! I'm your AI study assistant. What would you like to learn about?",
      role: "assistant",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const handleSendMessage = () => {
    if (!input.trim()) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: "user",
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    // Simulate AI response
    setTimeout(() => {
      const aiResponses = [
        "I'll create a study plan based on your interests. Let me analyze the best approach for you.",
        "Great choice! For this subject, I recommend starting with the fundamental concepts before moving to advanced topics.",
        "Based on your goals, I've identified several key areas to focus on. Would you like me to break these down into weekly modules?",
        "I've generated a comprehensive topic list. Let me know if you'd like to adjust any areas or add more specific subjects.",
      ]

      const randomResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)]

      const assistantMessage: Message = {
        id: Date.now().toString(),
        content: randomResponse,
        role: "assistant",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
      setIsLoading(false)
    }, 1500)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <Card className="w-full h-[600px] flex flex-col bg-gradient-to-br from-gray-900 to-gray-800">
      <CardHeader className="bg-gradient-to-r from-palette-7 to-palette-9 text-white p-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Bot size={20} />
          AI Study Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-[450px] p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`flex gap-3 max-w-[80%] ${message.role === "user" ? "flex-row-reverse" : ""}`}>
                  <Avatar
                    className={`h-8 w-8 ${
                      message.role === "assistant"
                        ? "bg-gradient-to-r from-palette-7 to-palette-9"
                        : "bg-gradient-to-r from-palette-1 to-palette-3"
                    }`}
                  >
                    {message.role === "assistant" ? (
                      <Bot className="h-4 w-4 text-white" />
                    ) : (
                      <User className="h-4 w-4 text-white" />
                    )}
                  </Avatar>
                  <div>
                    <div
                      className={`rounded-lg p-3 ${
                        message.role === "assistant"
                          ? "bg-gray-800/50 text-gray-100"
                          : "bg-gradient-to-r from-palette-1 to-palette-3 text-white"
                      }`}
                    >
                      {message.content}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">{formatTime(message.timestamp)}</div>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex gap-3 max-w-[80%]">
                  <Avatar className="h-8 w-8 bg-gradient-to-r from-palette-7 to-palette-9">
                    <Bot className="h-4 w-4 text-white" />
                  </Avatar>
                  <div className="rounded-lg p-3 bg-gray-800/50">
                    <div className="flex space-x-2">
                      <div
                        className="h-2 w-2 rounded-full bg-palette-7 animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      ></div>
                      <div
                        className="h-2 w-2 rounded-full bg-palette-8 animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      ></div>
                      <div
                        className="h-2 w-2 rounded-full bg-palette-9 animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="border-t border-gray-800 p-3">
        <div className="flex w-full items-center space-x-2">
          <Input
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            className="flex-1 bg-gray-800/50 border-gray-700 focus:border-palette-7"
          />
          <Button
            onClick={handleSendMessage}
            disabled={isLoading || !input.trim()}
            className="bg-palette-7 hover:bg-palette-8"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
} 
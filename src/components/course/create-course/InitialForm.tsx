"use client"

import type { FormEvent } from "react"
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/shadcn-ui/dialog"
import { Label } from "@/components/shadcn-ui/label"
import { Input } from "@/components/shadcn-ui/input"
import { Textarea } from "@/components/shadcn-ui/textarea"
import { Button } from "@/components/shadcn-ui/button"

interface FormData {
  objective: string
  goal: string
  duration: string
}

interface InitialFormProps {
  formData: FormData
  setFormData: (data: FormData) => void
  onSubmit: (e: FormEvent) => void
}

export function InitialForm({ formData, setFormData, onSubmit }: InitialFormProps) {
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  return (
    <>
      <DialogHeader className="space-y-2">
        <DialogTitle className="text-lg font-semibold text-course-card-text-primary">Course Information</DialogTitle>
        <DialogDescription className="text-sm text-course-card-text-muted">
          Enter the details about the course you want to create.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={onSubmit} className="space-y-4 mt-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="objective" className="text-course-card-text-primary text-sm">
              Learning Objective
            </Label>
            <Textarea
              id="objective"
              name="objective"
              placeholder="What do you want to learn?"
              value={formData.objective}
              onChange={handleInputChange}
              required
              className="min-h-[80px] bg-course-card-bg border-course-card-border focus:border-course-card-border-hover text-course-card-text-primary resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="goal" className="text-course-card-text-primary text-sm">
              Learning Goal
            </Label>
            <Textarea
              id="goal"
              name="goal"
              placeholder="What is your end goal?"
              value={formData.goal}
              onChange={handleInputChange}
              required
              className="min-h-[80px] bg-course-card-bg border-course-card-border focus:border-course-card-border-hover text-course-card-text-primary resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration" className="text-course-card-text-primary text-sm">
              Duration
            </Label>
            <Input
              id="duration"
              name="duration"
              placeholder="e.g., 4 weeks, 2 months"
              value={formData.duration}
              onChange={handleInputChange}
              required
              className="bg-course-card-bg border-course-card-border focus:border-course-card-border-hover text-course-card-text-primary"
            />
            <p className="text-xs text-course-card-text-muted">
              Specify how long you expect to spend on this course
            </p>
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full bg-primary hover:bg-gray-700 text-primary-foreground border-gray-700 border"
        >
          Continue
        </Button>
      </form>
    </>
  )
} 
"use client"

import { DialogHeader, DialogTitle, DialogDescription } from "@/components/shadcn-ui/dialog"
import { Label } from "@/components/shadcn-ui/label"
import { Textarea } from "@/components/shadcn-ui/textarea"
import { Button } from "@/components/shadcn-ui/button"
import { CircleIcon, CheckCircleIcon } from "lucide-react"

interface Question {
  id: number
  text: string
  answer: string
}

interface QuestionFormProps {
  questions: Question[]
  onAnswerChange: (id: number, value: string) => void
  onSubmit: () => void
}

export function QuestionForm({ questions, onAnswerChange, onSubmit }: QuestionFormProps) {
  const isAllQuestionsAnswered = questions.every((q) => q.answer.trim().length > 0)

  return (
    <>
      <DialogHeader className="space-y-2">
        <DialogTitle className="text-lg font-semibold text-course-card-text-primary">Course Personalization</DialogTitle>
        <DialogDescription className="text-sm text-course-card-text-muted">
          Help us customize your learning experience by answering these questions.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 mt-4">
        <div>
          {questions.map((question) => (
            <div 
              key={question.id} 
              className="rounded-lg bg-course-card-bg p-3 transition-colors hover:bg-course-card-bg/80"
            >
              <div className="flex gap-3 mb-3">
                <Label className="text-sm text-course-card-text-primary leading-6">
                  {question.text}
                </Label>
              </div>
              <Textarea
                value={question.answer}
                onChange={(e) => onAnswerChange(question.id, e.target.value)}
                placeholder="Type your answer here..."
                className="min-h-[60px] bg-course-card-bg border-course-card-border focus:border-course-card-border-hover text-course-card-text-primary resize-none"
              />
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <Button 
            onClick={onSubmit} 
            disabled={!isAllQuestionsAnswered}
            className="w-full bg-primary hover:bg-gray-700 text-primary-foreground border-gray-700 border"
          >
            Generate Course
          </Button>
          {!isAllQuestionsAnswered && (
            <p className="text-xs text-center text-course-card-text-muted">
              Please answer all questions to continue
            </p>
          )}
        </div>
      </div>
    </>
  )
} 
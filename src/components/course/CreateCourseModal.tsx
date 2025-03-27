"use client";

import { useState, useEffect } from "react";
import { Loader2, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/shadcn-ui/dialog";
import { Button } from "@/components/shadcn-ui/button";
import { InitialForm } from "./create-course/InitialForm";
import { QuestionForm } from "./create-course/QuestionForm";
import { CoursePreview } from "./create-course/CoursePreview";
import { useRouter } from "next/navigation";
import {
  createCourseWithQuestion,
  createCourseWithQuestionAndAnswer,
} from "@/lib/actions/create-course";
import { useUserPreferences } from "@/hooks/use-user-preference";

type Step = "input" | "questions" | "loading" | "preview";

interface FormData {
  learningSubject: string;
  goal: string;
  duration: string;
  dailyStudyTime: string;
}

interface CourseData {
  courseOverview: {
    estimatedTime: string;
    title: string;
    description: string;
    aim: string;
  }[];
}


export function CreateCourseModal() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("input");
  const [formData, setFormData] = useState<FormData>({
    learningSubject: "",
    goal: "",
    duration: "",
    dailyStudyTime: "",
  });
  const [questions, setQuestions] = useState<{ id: number; text: string; answer: string }[]>([]);
  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const { data: userPreferences } = useUserPreferences();
  const router = useRouter();

  useEffect(() => {
    setFormData({...formData, dailyStudyTime: userPreferences?.study_duration.toString() || ""})
  }, [userPreferences])

  const handleInitialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep("loading");

    const response = await createCourseWithQuestion(formData);

    if (response) {
      const questions = response.question;
      console.log(questions)
      const modifiedQuestions = questions.map((question: string, index: number) => ({
        id: index,
        text: question,
        answer: "",
      }));

      setQuestions(modifiedQuestions);
      setStep("questions");
    } else {
      setStep("input");
    }
  };

  const handleAnswerChange = (id: number, value: string) => {
    setQuestions(
      questions.map((q) => (q.id === id ? { ...q, answer: value } : q))
    );
  };

  const handleFinalSubmit = async () => {
    // Reset for next use
    const questionArray = questions.map((question) => question.text);
    const answerArray = questions.map((question) => question.answer);
    setStep("loading");
    const response = await createCourseWithQuestionAndAnswer({
      duration: formData.duration,
      dailyStudyTime: formData.dailyStudyTime,
      learningSubject: formData.learningSubject,
      goal: formData.goal,
      question: questionArray,
      answer: answerArray,
    });
    if (response) {
      setCourseData(response);
      setStep("preview");
    } else {
      setStep("questions");
    }
  };

  const handleClose = () => {
    console.log("Final submission:", { formData, questions });
    setOpen(false);
    setStep("input");
    setFormData({ learningSubject: "", goal: "", duration: "", dailyStudyTime: "" });
    setQuestions([]);
  };

  const handleSave = () => {
    console.log("Saving course data:", courseData);
    // Reset the course data
    setCourseData(null);
    setOpen(false);
    setStep("input");
    setFormData({ learningSubject: "", goal: "", duration: "", dailyStudyTime: "" });
    setQuestions([]);
    router.push("/courses");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="border-course-card-borderhover:bg-gray-600 text-black"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create a new Course
        </Button>
      </DialogTrigger>

      <DialogContent className="w-full max-w-4xl bg-gray-900 border-course-card-border">
        {step === "input" && (
          <InitialForm
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleInitialSubmit}
          />
        )}

        {step === "loading" && (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-course-card-text-primary" />
            <p className="mt-4 text-course-card-text-muted">
              Analyzing your requirements...
            </p>
          </div>
        )}

        {step === "questions" && (
          <QuestionForm
            questions={questions}
            onAnswerChange={handleAnswerChange}
            onSubmit={handleFinalSubmit}
          />
        )}

        {step === "preview" && (
          <CoursePreview
            courseData={courseData}
            onClose={handleClose}
            onSave={handleSave}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

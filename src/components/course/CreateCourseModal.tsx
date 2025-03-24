"use client";

import { useState } from "react";
import { Loader2, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/shadcn-ui/dialog";
import { Button } from "@/components/shadcn-ui/button";
import { InitialForm } from "./create-course/InitialForm";
import { QuestionForm } from "./create-course/QuestionForm";
import { CoursePreview } from "./create-course/CoursePreview";
import { useRouter } from "next/navigation";

type Step = "input" | "questions" | "loading" | "preview";

const mockCourseData = {
  courseOverview: [
    {
      estimatedTime: "2 hours",
      title: "Introduction to C++",
      description:
        "Learn the basic syntax and structure of C++, including data types, variables, operators, and control statements (if, switch, loops).",
      aim: "To grasp foundational concepts of C++ programming and establish a base for more complex topics.",
    },
    {
      estimatedTime: "2 hours",
      title: "Functions and Scope",
      description:
        "Understand the concept of functions, parameters, return types, and variable scoping. Learn to create modular code with functions.",
      aim: "To develop skills in writing reusable code blocks and understanding function scope.",
    },
    {
      estimatedTime: "2 hours",
      title: "Object-Oriented Programming (OOP) in C++",
      description:
        "Dive into classes and objects, inheritance, polymorphism, and encapsulation in C++. Explore how these concepts are used in C++ for large-scale systems.",
      aim: "To learn the principles of OOP and how they facilitate organized and reusable code.",
    },
    {
      estimatedTime: "2 hours",
      title: "Memory Management",
      description:
        "Study pointers, references, dynamic memory allocation, and memory management techniques in C++. Understand the importance of managing memory in low-level programming.",
      aim: "To gain proficiency in memory handling, crucial for operating systems and performance-critical applications.",
    },
    {
      estimatedTime: "2 hours",
      title: "Basic Data Structures",
      description:
        "Explore arrays, linked lists, stacks, and queues. Implement these structures in C++ to understand their performance characteristics and memory implications.",
      aim: "To establish a solid understanding of data structures which are essential in algorithm design and OS development.",
    },
    {
      estimatedTime: "2 hours",
      title: "Introduction to Operating Systems Concepts",
      description:
        "Learn essential OS concepts such as processes, threads, concurrency, and synchronization. Examine how these concepts apply to systems programming.",
      aim: "To lay the groundwork for understanding the architecture and functioning of operating systems.",
    },
    {
      estimatedTime: "2 hours",
      title: "Advanced Data Structures",
      description:
        "Delve into advanced data structures like trees, graphs, and hash tables. Understand their applications in software and system design.",
      aim: "To empower learners with advanced problem-solving tools that are vital in OS and algorithm implementations.",
    },
    {
      estimatedTime: "2 hours",
      title: "Introduction to Systems Programming",
      description:
        "Understand low-level programming concepts, system calls, inter-process communication, and how C++ interacts with the operating system.",
      aim: "To develop capabilities to write systems-level code that interfaces with operating systems.",
    },
    {
      estimatedTime: "2 hours",
      title: "Building a Simple Command-Line Application",
      description:
        "Apply learned concepts to create a command-line application that performs specific tasks, integrating earlier lessons from memory management and data structures.",
      aim: "To build real-world application development skills, synthesizing knowledge from previous sessions.",
    },
    {
      estimatedTime: "2 hours",
      title: "Debugging and Testing in C++",
      description:
        "Learn debugging techniques and test-driven development practices. Understand error handling and using tools for efficient debugging.",
      aim: "To improve coding reliability and correctness through effective debugging and testing methodologies.",
    },
    {
      estimatedTime: "2 hours",
      title: "Project: Basic Operating System Components",
      description:
        "Collaboratively design and implement a simplified version of key OS components to reinforce learning in a practical setting.",
      aim: "To integrate knowledge into a practical project that illustrates real-world application of C++ in operating systems.",
    },
  ],
};

interface FormData {
  objective: string;
  goal: string;
  duration: string;
}

export function CreateCourseModal() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("input");
  const [formData, setFormData] = useState<FormData>({
    objective: "",
    goal: "",
    duration: "",
  });
  const [questions, setQuestions] = useState<
    { id: number; text: string; answer: string }[]
  >([]);
  const [courseData, setCourseData] = useState<typeof mockCourseData | null>(
    null
  );
  const router = useRouter();
  const handleInitialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep("loading");

    // Simulate API call to get questions from AI
    setTimeout(() => {
      const mockQuestions = [
        {
          id: 1,
          text: "What is your current level of expertise in this subject?",
          answer: "",
        },
        {
          id: 2,
          text: "Do you prefer practical exercises or theoretical learning?",
          answer: "",
        },
        {
          id: 3,
          text: "What specific outcomes do you expect from this course?",
          answer: "",
        },
      ];
      
      setCourseData(mockCourseData);
      setQuestions(mockQuestions);
      setStep("questions");
    }, 1500);
  };

  const handleAnswerChange = (id: number, value: string) => {
    setQuestions(
      questions.map((q) => (q.id === id ? { ...q, answer: value } : q))
    );
  };

  const handleFinalSubmit = () => {
    // Reset for next use
    setStep("preview");
    setCourseData(mockCourseData);
  };

  const handleClose = () => {
    console.log("Final submission:", { formData, questions });
    setOpen(false);
    setStep("input");
    setFormData({ objective: "", goal: "", duration: "" });
    setQuestions([]);
  };

  const handleSave = () => {
    console.log("Saving course data:", courseData);
    // Reset the course data
    setCourseData(null);
    setOpen(false);
    setStep("input");
    setFormData({ objective: "", goal: "", duration: "" });
    setQuestions([]);
    router.push("/courses")
  }

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
            courseData={mockCourseData}
            onClose={handleClose}
            onSave={handleSave}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

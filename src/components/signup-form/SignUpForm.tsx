"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { FcGoogle } from "react-icons/fc";
import { signIn } from "next-auth/react";
import Image from "next/image";

const formSchema = z.object({
  email: z.string().email(),
  username: z.string().min(4, "Username must be at least 4 characters"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

export default function SignUpForm() {
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    defaultValues: {
      email: "",
      username: "",
      password: "",
    },
    resolver: zodResolver(formSchema),
  });

  const handleGoogleSignIn = () => {
    signIn("google", {
      callbackUrl: "/calendar",
      prompt: "select_account",
      authorizationParams: {
        access_type: "offline",
        prompt: "consent select_account",
        scope: "https://www.googleapis.com/auth/calendar openid profile email",
      },
    });
  };

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const responseData = await res.json();

      if (!res.ok) {
        form.setError("root", {
          message: responseData.error || "Failed to create account",
        });
      } else {
        router.push("/login");
      }
    } catch (err) {
      form.setError("root", { message: "An unexpected error occurred." });
    }
  };

  return (
    <div className="w-full h-full flex flex-col lg:flex-row">
      <div className="max-w-xl m-auto w-full flex flex-col items-center border border-gray-700 rounded-xl p-12">
        <p className="mt-4 text-xl font-bold tracking-tight text-white">
          Sign up to start scheduling
        </p>

        <Button
          className="mt-8 w-full gap-3 border-gray-700 hover:bg-gray-900 text-gray-700 hover:text-white"
          variant="outline"
          type="button"
          onClick={handleGoogleSignIn}
        >
          <FcGoogle className="mr-2 h-5 w-5" />
          Continue with Google
        </Button>

        <div className="my-7 w-full flex items-center justify-center overflow-hidden">
          <Separator className="flex-1 bg-gray-800" />
          <span className="text-sm px-2 text-gray-400">OR</span>
          <Separator className="flex-1 bg-gray-800" />
        </div>

        {form.formState.errors.root && (
          <p className="text-red-500 text-sm mb-4">
            {form.formState.errors.root.message}
          </p>
        )}

        <Form {...form}>
          <form
            className="w-full space-y-4"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Email"
                      className="bg-gray-900 text-white border-gray-700"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">Username</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Username"
                      className="bg-gray-900 text-white border-gray-700"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Password"
                      className="bg-gray-900 text-white border-gray-700"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-500 text-white"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting
                ? "Signing up..."
                : "Continue with Email"}
            </Button>
          </form>
        </Form>

        <p className="mt-5 text-sm text-center text-gray-400">
          Already have an account?
          <Link
            href="/login"
            className="ml-1 underline text-gray-300 hover:text-white"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}

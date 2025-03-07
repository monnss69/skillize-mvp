"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button, ButtonProps } from "@/components/shadcn-ui/button";
import { cn } from "@/lib/utils";
import { LogOut } from "lucide-react";

interface SignOutButtonProps extends ButtonProps {
  showIcon?: boolean;
  label?: string;
}

/**
 * SignOutButton - A button component that redirects users to the sign-out page
 * 
 * @param showIcon - Whether to show the logout icon (default: true)
 * @param label - Custom label for the button (default: "Sign out")
 * @param className - Additional class names
 * @param props - Additional button props
 */
export default function SignOutButton({
  showIcon = true,
  label = "Sign out",
  className,
  ...props
}: SignOutButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push('/signout');
  };

  return (
    <Button
      variant="ghost"
      onClick={handleClick}
      className={cn(
        "text-white bg-red-500 hover:bg-red-800 focus-visible:ring-1 focus-visible:ring-gray-700", 
        className
      )}
      {...props}
    >
      {showIcon && <LogOut className="h-4 w-4 mr-2" />}
      {label}
    </Button>
  );
} 
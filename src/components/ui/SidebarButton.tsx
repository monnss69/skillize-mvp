import React from 'react';
import { cn } from '@/lib/utils';

interface SidebarButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export default function SidebarButton({ children, className, ...props }: SidebarButtonProps) {
  return (
    <button
      className={cn(
        "flex items-center justify-center px-4 py-2 rounded-md bg-gray-700 text-gray-200 hover:bg-gray-600 transition-colors duration-200",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
} 
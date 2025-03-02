'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/shadcn-ui/button';
import { Input } from '@/components/shadcn-ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/shadcn-ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/shadcn-ui/select';
import { updateUserProfile } from '@/lib/actions/user';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/shadcn-ui/avatar';
import { User } from '@/types';
import { Upload, X } from 'lucide-react';
import { TIMEZONES } from '@/lib/constant';

/**
 * Form schema for updating user profile 
 * Using Zod for validation
 */
const formSchema = z.object({
  username: z.string().min(3, {
    message: 'Username must be at least 3 characters.',
  }).max(30),
  email: z.string().email({
    message: 'Please enter a valid email.',
  }),
  timezone: z.string().min(1, {
    message: 'Please select a timezone.',
  }),
  avatar_url: z.string().optional(),
});

/**
 * Type for the form values based on Zod schema
 */
type FormValues = z.infer<typeof formSchema>;

/**
 * User profile form component with field validation
 * Allows updating specific user fields
 */
export default function UserProfileForm({ initialData }: { initialData: User }) {
  const [isLoading, setIsLoading] = useState(false);
  
  // Initialize the form with React Hook Form and Zod validation
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: initialData.username || '',
      email: initialData.email || '',
      timezone: initialData.timezone || '',
      avatar_url: initialData.avatar_url || '',
    },
  });
  
  /**
   * Handle form submission using the server action
   */
  async function onSubmit(data: FormValues) {
    try {
      setIsLoading(true);
      
      // Only send fields that have changed from initial values
      const changedFields = Object.entries(data).reduce((fields, [key, value]) => {
        const fieldKey = key as keyof FormValues;
        if (value !== initialData[fieldKey]) {
          fields[fieldKey] = value;
        }
        return fields;
      }, {} as Partial<FormValues>);
      
      // If no fields have changed, don't submit
      if (Object.keys(changedFields).length === 0) {
        toast.info("No changes detected", {
          description: "You haven't made any changes to your profile.",
        });
        setIsLoading(false);
        return;
      }
      
      // Call the server action to update the user profile
      const result = await updateUserProfile(changedFields);
      
      if (result.success) {
        toast.success("Profile updated", {
          description: "Your profile has been updated successfully.",
        });
      } else {
        toast.error("Update failed", {
          description: result.error || "Something went wrong. Please try again.",
        });
      }
    } catch (error) {
      toast.error("Error",  {
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-2xl mx-auto">
        <h2 className="text-2xl font-light text-[#B8A47C] text-center mb-8">Profile Settings</h2>
        
        {/* Avatar */}
        <div className="flex flex-col items-center justify-center gap-2">
          <Avatar className="h-40 w-40 border-2 border-[#B8A47C]/20">
            <AvatarImage 
              src={form.watch('avatar_url') || initialData.avatar_url || ''}
              alt={`${form.watch('username') || 'User'}'s avatar`}
              referrerPolicy="no-referrer"
              crossOrigin="anonymous"
            />
            <AvatarFallback className="text-xl font-medium text-[#B8A47C]">
              {form.watch('username')?.substring(0, 2)?.toUpperCase() || 'UN'}
            </AvatarFallback>
          </Avatar>
          
          {/* Username display */}
          <p className="text-[#E8E2D6] font-medium mt-1">
            {form.watch('username') || 'Username'}
          </p>

          {/* Upload button */}
          <Button variant="outline" className="bg-[#1E2A36] border-[#2A3A4A] text-[#E8E2D6] mt-2">
            <Upload className="w-4 h-4 mr-2" />
            Upload
          </Button>
        </div>
        
        {/* Username field */}
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input
                  placeholder="Your username"
                  {...field}
                  className="bg-[#1E2A36] border-[#2A3A4A] text-[#E8E2D6]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Email field */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  placeholder="your.email@example.com"
                  {...field}
                  className="bg-[#1E2A36] border-[#2A3A4A] text-[#E8E2D6]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Timezone field */}
        <FormField
          control={form.control}
          name="timezone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Timezone</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger className="bg-[#1E2A36] border-[#2A3A4A] text-[#E8E2D6]">
                    <SelectValue placeholder="Select your timezone" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="max-h-[300px]">
                  {TIMEZONES.map((timezone) => (
                    <SelectItem key={timezone.value} value={timezone.value}>
                      {timezone.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Submit button */}
        <Button 
          type="submit" 
          disabled={isLoading}
          className="w-full bg-[#B8A47C] hover:bg-[#A89567] text-black"
        >
          {isLoading ? "Updating..." : "Update Profile"}
        </Button>
      </form>
    </Form>
  );
} 
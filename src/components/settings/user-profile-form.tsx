'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/shadcn-ui/button';
import { Input } from '@/components/shadcn-ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/shadcn-ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/shadcn-ui/select';
import { updateUserProfile } from '@/lib/actions/user';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/shadcn-ui/avatar';
import { User, UserPreferences } from '@/types';
import { Upload, X, Loader2 } from 'lucide-react';
import { TIMEZONES } from '@/lib/constant';
import { updateUserPreferences } from '@/lib/actions/preferences';
import { FormTimePicker } from "@/components/ui/form-time-picker";

/**
 * Form schema for updating user profile 
 * Using Zod for validation
 */
const formUserSchema = z.object({
  username: z.string().min(3, {
    message: 'Username must be at least 3 characters.',
  }).max(30),
  email: z.string().email({
    message: 'Please enter a valid email.',
  }),
  timezone: z.string().optional(),
  avatar_url: z.string().optional(),
  preferred_study_time: z.object({
    start_time: z.string().optional(),
    end_time: z.string().optional(),
    preference: z.enum(['morning', 'afternoon', 'evening']).optional(),
  }).optional().nullable(),
  study_duration: z.number().optional().nullable(),
  break_duration: z.number().optional().nullable(),
  learning_style: z.enum(['visual', 'auditory', 'kinesthetic']).optional().nullable(),
});

/**
 * Type for the form values based on Zod schema
 */
type FormValues = z.infer<typeof formUserSchema>;

/**
 * User profile form component with field validation
 * Allows updating specific user fields
 * @param initialData - The user's profile data
 * @param preferences - The user's preferences
 */
export default function UserProfileForm({ initialData, preferences }: { initialData: User, preferences: UserPreferences }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: session } = useSession();
  
  // Initialize the form with React Hook Form and Zod validation
  const form = useForm<FormValues>({
    resolver: zodResolver(formUserSchema),
    defaultValues: {
      username: initialData.username || '',
      email: initialData.email || '',
      timezone: initialData.timezone || '',
      avatar_url: initialData.avatar_url || '',
      preferred_study_time: preferences.preferred_study_time || null,
      study_duration: preferences.study_duration || null,
      break_duration: preferences.break_duration || null,
      learning_style: preferences.learning_style || null,
    },
  });
  
  /**
   * Clean up any object URLs when component unmounts
   */
  useEffect(() => {
    return () => {
      // Clean up any object URLs to avoid memory leaks
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  /**
   * Handle file selection for avatar preview
   */
  const handleFileSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error("Invalid file type", {
        description: "Please upload an image file (JPEG, PNG, etc.).",
      });
      return;
    }
    
    // Check file size (limit to 3MB)
    if (file.size > 3 * 1024 * 1024) {
      toast.error("File too large", {
        description: "Please upload an image smaller than 3MB.",
      });
      return;
    }

    // Create a preview URL
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setPreviewFile(file);
  };

  /**
   * Cancel the avatar preview
   */
  const cancelPreview = () => {
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setPreviewFile(null);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  /**
   * Confirm and upload the previewed avatar
   */
  const confirmAndUploadAvatar = async () => {
    if (!previewFile || !session?.user?.id) return;
    
    try {
      setIsUploading(true);
      
      // Create FormData for more efficient file upload
      const formData = new FormData();
      formData.append('userId', session.user.id);
      formData.append('file', previewFile);
      
      // Upload to S3
      const response = await fetch('/api/s3/avatar-upload', {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to upload avatar');
      }
      
      // Generate avatar URL based on user ID
      // Using the CDN URL pattern for the S3 bucket or direct S3 URL
      const cdnUrl = process.env.NEXT_PUBLIC_CDN_URL || '';
      let avatarUrl = '';
      
      if (cdnUrl) {
        // If CDN is configured, use CDN URL pattern
        avatarUrl = `${cdnUrl}/avatars/${session.user.id}.jpg`;
      } else {
        // Fallback to direct S3 URL
        const bucketName = process.env.NEXT_PUBLIC_S3_BUCKET_NAME || '';
        const region = process.env.NEXT_PUBLIC_S3_REGION || '';
        avatarUrl = `https://${bucketName}.s3.${region}.amazonaws.com/avatars/${session.user.id}.jpg`;
      }
      
      // Add cache busting parameter to force refresh
      avatarUrl = `${avatarUrl}?t=${new Date().getTime()}`;
      
      // Update the form value
      form.setValue('avatar_url', avatarUrl);
      
      toast.success("Avatar uploaded", {
        description: "Your avatar has been updated successfully.",
      });
      
      // Clear the preview after successful upload
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(null);
      setPreviewFile(null);
    } catch (error) {
      console.error('Avatar upload error:', error);
      toast.error("Upload failed", {
        description: error instanceof Error ? error.message : "An error occurred during upload.",
      });
    } finally {
      setIsUploading(false);
      
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  /**
   * Handle avatar file upload (for backward compatibility with drag/drop)
   */
  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelection(event);
  };

  /**
   * Handle file drop for avatar upload
   */
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      // Create a mock event for the handleAvatarUpload function
      const mockEvent = {
        target: {
          files: [file]
        }
      } as React.ChangeEvent<HTMLInputElement>;
      
      handleFileSelection(mockEvent);
    }
  }, []);
  
  /**
   * Handle drag events for avatar upload
   */
  const handleDragEvents = useCallback((e: React.DragEvent<HTMLDivElement>, isDraggingState: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(isDraggingState);
  }, []);
  
  /**
   * Handle form submission using the server action
   */
  async function onSubmit(data: FormValues) {
    try {
      setIsLoading(true);
      
      // Track user profile fields that have changed (non-preference fields)
      const changedFields = Object.entries(data).reduce((fields, [key, value]) => {
        const fieldKey = key as keyof FormValues;
        // Only include non-preference fields in this object
        if (fieldKey === 'username' || fieldKey === 'email' || fieldKey === 'timezone' || fieldKey === 'avatar_url') {
          // Only add fields that have changed from initial values
          if (value !== initialData[fieldKey as keyof User]) {
            fields[fieldKey] = value as any; // We'll handle the type conversion in the server action
          }
        }
        return fields;
      }, {} as Partial<FormValues>);
      
      // Create a new object with only the preference fields that have changed
      const changedPreferencesFields = Object.entries(data).reduce((fields, [key, value]) => {
        const fieldKey = key as keyof FormValues;
        if (fieldKey === 'preferred_study_time' || fieldKey === 'learning_style' || fieldKey === 'study_duration' || fieldKey === 'break_duration') {
          // Only add if value is different from existing preferences
          if (JSON.stringify(value) !== JSON.stringify(preferences[fieldKey as keyof UserPreferences])) {
            // Ensure only fields of the right type are added for preferences
            fields[fieldKey] = value as any; // We'll handle the type conversion in the server action
          }
        }
        return fields;
      }, {} as Partial<FormValues>);
      
      // If no fields have changed, don't submit
      if (Object.keys(changedFields).length === 0 && Object.keys(changedPreferencesFields).length === 0) {
        toast.info("No changes detected", {
          description: "You haven't made any changes to your profile.",
        });
        setIsLoading(false);
        return;
      }
      
      let result = undefined;
      let result2 = undefined;

      // Call the server action to update the user profile
      if (Object.keys(changedFields).length > 0) {
        const res = await updateUserProfile(changedFields);
        result = res;
      }
      
      // Only call updateUserPreferences if there are preference changes
      if (Object.keys(changedPreferencesFields).length > 0) {
        try {
          const resultPreferences = await updateUserPreferences(changedPreferencesFields);
          result2 = resultPreferences;
          // Handle preference update result if needed
          if (!resultPreferences.success) {
            toast.error("Failed to update preferences", {
              description: resultPreferences.error || "Something went wrong with preferences update.",
            });
          }
        } catch (error) {
          console.error("Error updating preferences:", error);
          toast.error("Error updating preferences", {
            description: "Failed to update your study preferences. Please try again.",
          });
        }
      }
      
      const success1 = (result && result.success) || result == undefined;
      const success2 = (result2 && result2.success) || result2 == undefined;

      // Keep this here to show the user the result of the update after the preferences are updated
      if (success1 && success2) {
        toast.success("Profile updated", {
          description: "Your profile has been updated successfully.",
        });
      } else {
        toast.error("Update failed", {
          description: result?.error || result2?.error || "Something went wrong. Please try again.",
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
        
        {/* Avatar with drag & drop */}
        <div className="flex flex-col items-center justify-center gap-2">
          <div 
            className={`relative rounded-full cursor-pointer overflow-hidden transition-all duration-200 ${isDragging ? 'ring-4 ring-[#B8A47C] scale-105' : ''}`}
            onDragOver={(e) => handleDragEvents(e, true)}
            onDragEnter={(e) => handleDragEvents(e, true)}
            onDragLeave={(e) => handleDragEvents(e, false)}
            onDrop={handleDrop}
            onClick={() => !previewUrl && fileInputRef.current?.click()}
          >
            <Avatar className="h-40 w-40 border-2 border-[#B8A47C]/20 relative">
              {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full z-10">
                  <Loader2 className="h-10 w-10 text-[#B8A47C] animate-spin" />
                </div>
              )}
              <AvatarImage 
                src={previewUrl || form.watch('avatar_url') || initialData.avatar_url || ''}
              />
              <AvatarFallback className="text-xl font-medium text-[#B8A47C]">
                {form.watch('username')?.substring(0, 2)?.toUpperCase() || 'UN'}
              </AvatarFallback>
            </Avatar>
            
            {/* Drag overlay */}
            {isDragging && (
              <div className="absolute inset-0 flex items-center justify-center bg-[#1E2A36]/80 rounded-full z-20">
                <p className="text-[#B8A47C] text-sm font-medium">Drop to upload</p>
              </div>
            )}
          </div>
          
          {/* Username display */}
          <p className="text-[#E8E2D6] font-medium mt-1">
            {form.watch('username') || 'Username'}
          </p>

          {/* Hidden file input */}
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileSelection}
          />

          {/* Preview controls or Upload button */}
          {previewUrl ? (
            <div className="flex gap-2 mt-2">
              <Button 
                type="button"
                variant="default"
                className="bg-[#B8A47C] hover:bg-[#A89567] text-black"
                onClick={confirmAndUploadAvatar}
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    Confirm
                  </>
                )}
              </Button>
              <Button 
                type="button"
                variant="outline" 
                className="bg-[#1E2A36] border-[#2A3A4A] text-[#E8E2D6]"
                onClick={cancelPreview}
                disabled={isUploading}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <Button 
              type="button"
              variant="outline" 
              className="bg-[#1E2A36] border-[#2A3A4A] text-[#E8E2D6] mt-2"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload
            </Button>
          )}
          
          {previewUrl ? (
            <p className="text-xs text-gray-400 text-center mt-1">
              Preview mode - Confirm to save or Cancel to discard
            </p>
          ) : (
            <p className="text-xs text-gray-400 text-center mt-1">
              Click or drag & drop to change your avatar
            </p>
          )}
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
                    <SelectValue placeholder="Select your timezone"> {field.value} </SelectValue>
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
        
        {/* Learning Style field */}
        <FormField
          control={form.control}
          name="learning_style"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Learning Style</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value || ""}
              >
                <FormControl>
                  <SelectTrigger className="bg-[#1E2A36] border-[#2A3A4A] text-[#E8E2D6]">
                    <SelectValue placeholder="Select your learning style" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="visual">Visual</SelectItem>
                  <SelectItem value="auditory">Auditory</SelectItem>
                  <SelectItem value="kinesthetic">Kinesthetic</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
              <p className="text-sm text-gray-400 mt-1">
                Your preferred way of learning new information.
              </p>
            </FormItem>
          )}
        />
        
        {/* Study Duration field */}
        <FormField
          control={form.control}
          name="study_duration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Study Session Duration (minutes)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="25"
                  className="bg-[#1E2A36] border-[#2A3A4A] text-[#E8E2D6]"
                  {...field}
                  onChange={(e) => {
                    const value = e.target.value === '' ? null : Number(e.target.value);
                    field.onChange(value);
                  }}
                  value={field.value === null ? '' : field.value}
                />
              </FormControl>
              <FormMessage />
              <p className="text-sm text-gray-400 mt-1">
                How long would you like your focused study sessions to be?
              </p>
            </FormItem>
          )}
        />

        {/* Break Duration field */}
        <FormField
          control={form.control}
          name="break_duration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Break Duration (minutes)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="5"
                  className="bg-[#1E2A36] border-[#2A3A4A] text-[#E8E2D6]"
                  {...field}
                  onChange={(e) => {
                    const value = e.target.value === '' ? null : Number(e.target.value);
                    field.onChange(value);
                  }}
                  value={field.value === null ? '' : field.value}
                />
              </FormControl>
              <FormMessage />
              <p className="text-sm text-gray-400 mt-1">
                How long would you like your breaks between study sessions to be?
              </p>
            </FormItem>
          )}
        />
        
        {/* Preferred Study Time */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-[#E8E2D6]">Preferred Study Time</h3>
          
          {/* Preference (morning/afternoon/evening) */}
          <FormField
            control={form.control}
            name="preferred_study_time.preference"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Time of Day</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value || ""}
                >
                  <FormControl>
                    <SelectTrigger className="bg-[#1E2A36] border-[#2A3A4A] text-[#E8E2D6]">
                      <SelectValue placeholder="Select preferred time of day" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="morning">Morning</SelectItem>
                    <SelectItem value="afternoon">Afternoon</SelectItem>
                    <SelectItem value="evening">Evening</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Start Time */}
          <FormTimePicker
            control={form.control}
            name="preferred_study_time.start_time"
            label="Start Time"
            placeholder="09:00"
            helperText="When do you prefer to start studying?"
            containerClassName="mb-2"
          />
          
          {/* End Time */}
          <FormTimePicker
            control={form.control}
            name="preferred_study_time.end_time"
            label="End Time"
            placeholder="17:00"
            helperText="When do you prefer to end studying?"
            containerClassName="mb-2"
          />
          
          <p className="text-sm text-gray-400 mb-4">
            Setting your preferred study times helps us optimize your learning schedule and reminders.
          </p>
        </div>
        
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
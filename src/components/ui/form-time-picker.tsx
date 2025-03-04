"use client"

import * as React from "react"
import { useFormContext, Controller, type ControllerProps, type FieldPath, type FieldValues } from "react-hook-form"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/shadcn-ui/form"
import { TimePicker } from "@/components/ui/time-picker"

export interface FormTimePickerProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> extends Omit<ControllerProps<TFieldValues, TName>, 'render'> {
  label?: string
  placeholder?: string
  className?: string
  helperText?: string
  disabled?: boolean
  containerClassName?: string
}

/**
 * A form-compatible time picker component for use with React Hook Form
 * Uses the TimePicker component that pushes content down when opened
 */
export function FormTimePicker<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  name,
  control,
  label,
  placeholder,
  className,
  containerClassName,
  helperText,
  disabled,
  ...props
}: FormTimePickerProps<TFieldValues, TName>) {
  const formContext = useFormContext<TFieldValues>()
  const contextControl = control || formContext?.control
  
  if (!contextControl) {
    throw new Error("FormTimePicker must be used within a FormProvider or be passed the control prop explicitly.")
  }

  return (
    <FormField
      control={contextControl}
      name={name}
      {...props}
      render={({ field, fieldState }: any) => (
        <FormItem className={containerClassName}>
          {label && <FormLabel className="text-[#E8E2D6]">{label}</FormLabel>}
          <FormControl>
            <TimePicker
              value={field.value}
              placeholder={placeholder}
              onChange={field.onChange}
              error={!!fieldState.error}
              disabled={disabled}
              onBlur={field.onBlur}
              name={field.name}
              className={className}
            />
          </FormControl>
          {helperText && <p className="text-sm text-[#A0AEC0]">{helperText}</p>}
          <FormMessage className="text-red-400" />
        </FormItem>
      )}
    />
  )
} 
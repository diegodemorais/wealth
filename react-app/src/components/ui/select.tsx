import * as React from "react"
import { cn } from "@/lib/utils"

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, ...props }, ref) => (
    <select
      className={cn(
        "flex h-9 w-full rounded-md border border-border bg-card px-3 py-2 text-sm",
        "text-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-card",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "appearance-none cursor-pointer",
        className
      )}
      ref={ref}
      {...props}
    />
  )
)
Select.displayName = "Select"

export interface SelectGroupProps
  extends React.HTMLAttributes<HTMLOptGroupElement> {}

const SelectGroup = React.forwardRef<HTMLOptGroupElement, SelectGroupProps>(
  ({ className, ...props }, ref) => (
    <optgroup
      ref={ref}
      {...props}
    />
  )
)
SelectGroup.displayName = "SelectGroup"

export interface SelectValueProps
  extends React.OptionHTMLAttributes<HTMLOptionElement> {}

const SelectValue = React.forwardRef<HTMLOptionElement, SelectValueProps>(
  ({ className, ...props }, ref) => (
    <option
      ref={ref}
      {...props}
    />
  )
)
SelectValue.displayName = "SelectValue"

export interface SelectItemProps
  extends React.OptionHTMLAttributes<HTMLOptionElement> {}

const SelectItem = React.forwardRef<HTMLOptionElement, SelectItemProps>(
  ({ className, ...props }, ref) => (
    <option
      ref={ref}
      {...props}
    />
  )
)
SelectItem.displayName = "SelectItem"

export { Select, SelectGroup, SelectValue, SelectItem }

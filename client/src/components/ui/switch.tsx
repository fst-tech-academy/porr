import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"

import { cn } from "../../lib/utils"

interface SwitchProps extends React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> {
  theme?: 'admin' | 'landlord';
}

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  SwitchProps
>(({ className, theme = 'admin', ...props }, ref) => {
  const getThemeClasses = () => {
    if (theme === 'landlord') {
      return {
        checked: 'data-[state=checked]:bg-green-500 dark:data-[state=checked]:bg-green-500',
        unchecked: 'data-[state=unchecked]:bg-green-600 dark:data-[state=unchecked]:bg-green-800',
        thumb: 'bg-white dark:bg-gray-100'
      };
    } else {
      return {
        checked: 'data-[state=checked]:bg-blue-700 dark:data-[state=checked]:bg-blue-600',
        unchecked: 'data-[state=unchecked]:bg-blue-900 dark:data-[state=unchecked]:bg-blue-800',
        thumb: 'bg-white dark:bg-gray-100'
      };
    }
  };

  const themeClasses = getThemeClasses();

  return (
    <SwitchPrimitives.Root
      className={cn(
        "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
        themeClasses.checked,
        themeClasses.unchecked,
        className
      )}
      {...props}
      ref={ref}
    >
      <SwitchPrimitives.Thumb
        className={cn(
          "pointer-events-none block h-5 w-5 rounded-full shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0",
          themeClasses.thumb
        )}
      />
    </SwitchPrimitives.Root>
  )
})
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "../../lib/utils"
import { buttonVariants } from "./button"

interface CalendarProps {
  mode?: "single" | "range" | "multiple";
  selected?: Date;
  onSelect?: (date: Date | undefined) => void;
  className?: string;
  initialFocus?: boolean;
}

function Calendar({
  mode = "single",
  selected,
  onSelect,
  className,
  initialFocus = false,
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(new Date());
  
  const today = new Date();
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const firstDayOfWeek = firstDay.getDay();
  const daysInMonth = lastDay.getDate();
  
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  
  const handleDateClick = (day: number) => {
    const date = new Date(year, month, day);
    onSelect?.(date);
  };
  
  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };
  
  const goToNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };
  
  const isSelected = (day: number) => {
    if (!selected) return false;
    const date = new Date(year, month, day);
    return date.toDateString() === selected.toDateString();
  };
  
  const isToday = (day: number) => {
    const date = new Date(year, month, day);
    return date.toDateString() === today.toDateString();
  };
  
  const renderDays = () => {
    const days = [];
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="h-9 w-9" />);
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isSelectedDay = isSelected(day);
      const isTodayDay = isToday(day);
      
      days.push(
        <button
          key={day}
          onClick={() => handleDateClick(day)}
          className={cn(
            "h-9 w-9 text-center text-sm p-0 font-normal rounded-md transition-colors",
            "hover:bg-gray-100 dark:hover:bg-gray-700",
            isSelectedDay && "bg-blue-600 text-white hover:bg-blue-700",
            isTodayDay && !isSelectedDay && "bg-gray-200 dark:bg-gray-600 font-semibold",
            !isSelectedDay && !isTodayDay && "text-gray-900 dark:text-gray-100"
          )}
        >
          {day}
        </button>
      );
    }
    
    return days;
  };
  
  return (
    <div className={cn("p-3 bg-white dark:bg-gray-800 rounded-lg border shadow-lg", className)}>
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={goToPreviousMonth}
          className={cn(
            buttonVariants({ variant: "outline" }),
            "h-7 w-7 p-0"
          )}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        
        <h2 className="text-sm font-medium">
          {monthNames[month]} {year}
        </h2>
        
        <button
          onClick={goToNextMonth}
          className={cn(
            buttonVariants({ variant: "outline" }),
            "h-7 w-7 p-0"
          )}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {dayNames.map((day) => (
          <div key={day} className="h-9 w-9 text-center text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center justify-center">
            {day}
          </div>
        ))}
        {renderDays()}
      </div>
    </div>
  );
}

Calendar.displayName = "Calendar"

export { Calendar }

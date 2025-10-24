import React from 'react';
import { cn } from '../../lib/utils';
import { Check } from 'lucide-react';

export interface StepperProps {
  steps: Array<{
    id: string;
    title: string;
    description?: string;
    completed?: boolean;
    active?: boolean;
    icon?: React.ReactNode;
  }>;
  currentStep: number;
  onStepClick?: (stepIndex: number) => void;
  className?: string;
}

const Stepper: React.FC<StepperProps> = ({
  steps,
  currentStep,
  onStepClick,
  className
}) => {
  return (
    <div className={cn('w-full', className)}>
      <div className="relative">
        {/* Vertical Timeline Line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
        
        {steps.map((step, index) => {
          const isCompleted = step.completed || index < currentStep;
          const isActive = step.active || index === currentStep;
          const isClickable = onStepClick && (isCompleted || isActive);

          return (
            <div key={step.id} className="relative flex items-start mb-8 last:mb-0">
              {/* Step Circle */}
              <div
                className={cn(
                  'w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-200 relative z-10',
                  isCompleted
                    ? 'bg-green-500 border-green-500 text-white'
                    : isActive
                    ? 'bg-blue-500 border-blue-500 text-white'
                    : 'bg-white border-gray-300 text-gray-400',
                  isClickable && 'cursor-pointer hover:scale-105'
                )}
                onClick={() => isClickable && onStepClick(index)}
              >
                {isCompleted ? (
                  <Check className="w-6 h-6" />
                ) : step.icon ? (
                  <div className="w-6 h-6 flex items-center justify-center">
                    {step.icon}
                  </div>
                ) : (
                  <span className="text-sm font-semibold">{index + 1}</span>
                )}
              </div>

              {/* Step Content */}
              <div className="ml-6 flex-1">
                <h3
                  className={cn(
                    'text-lg font-semibold transition-colors duration-200 text-black',
                    isActive || isCompleted
                      ? 'text-black'
                      : 'text-gray-500'
                  )}
                >
                  {step.title}
                </h3>
                {step.description && (
                  <p
                    className={cn(
                      'text-sm mt-1 transition-colors duration-200 text-black',
                      isActive || isCompleted
                        ? 'text-gray-700'
                        : 'text-gray-400'
                    )}
                  >
                    {step.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Stepper;

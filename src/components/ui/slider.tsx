import * as React from "react"
import { cn } from "@/lib/utils"

interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'defaultValue'> {
  onValueChange?: (value: number[]) => void;
  value?: number[];
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ className, min = 0, max = 100, step = 1, value, onValueChange, ...props }, ref) => {
    
    // Internal state if uncontrolled (though we mostly use controlled)
    const [localValue, setLocalValue] = React.useState<number>(value?.[0] || 0);

    React.useEffect(() => {
        if (value) {
            setLocalValue(value[0]);
        }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = parseFloat(e.target.value);
        setLocalValue(newValue);
        if (onValueChange) {
            onValueChange([newValue]);
        }
    };

    return (
      <input
        type="range"
        className={cn(
          "w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 accent-indigo-600 dark:accent-indigo-400",
          className
        )}
        min={min}
        max={max}
        step={step}
        value={localValue}
        onChange={handleChange}
        ref={ref}
        {...props}
      />
    )
  }
)
Slider.displayName = "Slider"

export { Slider }

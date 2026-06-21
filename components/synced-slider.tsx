'use client';

import React, { useState, useEffect } from 'react';

interface SyncedSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
  prefix?: string;
  showInput?: boolean;
  maxWidth?: string;
}

export function SyncedSlider({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  suffix = '',
  prefix = '',
  showInput = true,
  maxWidth = '100%',
}: SyncedSliderProps) {
  const [inputValue, setInputValue] = useState(value.toString());

  useEffect(() => {
    setInputValue(value.toString());
  }, [value]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    onChange(newValue);
    setInputValue(newValue.toString());
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    // Update parent only if valid number
    if (newValue !== '' && !isNaN(parseFloat(newValue))) {
      const numValue = parseFloat(newValue);
      if (numValue >= min && numValue <= max) {
        onChange(numValue);
      }
    }
  };

  const handleInputBlur = () => {
    // Clamp to min/max or reset if invalid
    let validValue = parseFloat(inputValue);
    if (isNaN(validValue)) {
      validValue = value;
    } else if (validValue > max) {
      validValue = max;
    } else if (validValue < min) {
      validValue = min;
    }
    
    onChange(validValue);
    setInputValue(validValue.toString());
  };

  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="w-full space-y-3" style={{ maxWidth }}>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">{label}</label>
        {showInput && (
          <div className="flex items-center gap-1">
            {prefix && <span className="text-sm text-muted-foreground">{prefix}</span>}
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              className="w-24 px-2 py-1 text-sm border border-border rounded bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {suffix && <span className="text-sm text-muted-foreground">{suffix}</span>}
          </div>
        )}
      </div>

      {/* Slider Input */}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleSliderChange}
        className="w-full"
      />

      {/* Min and Max Labels */}
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{prefix}{min.toLocaleString('en-IN')}{suffix}</span>
        <span>{prefix}{max.toLocaleString('en-IN')}{suffix}</span>
      </div>
    </div>
  );
}

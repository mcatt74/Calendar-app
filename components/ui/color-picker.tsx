"use client"

import React from 'react'
import { cn } from '../../lib/utils'

interface ColorPickerProps {
  value: string
  onChange: (color: string) => void
  className?: string
}

const predefinedColors = [
  '#EF4444', // Red
  '#F97316', // Orange
  '#EAB308', // Yellow
  '#22C55E', // Green
  '#06B6D4', // Cyan
  '#3B82F6', // Blue
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#6B7280', // Gray
  '#84CC16', // Lime
  '#F59E0B', // Amber
  '#10B981', // Emerald
]

export function ColorPicker({ value, onChange, className }: ColorPickerProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <label className="text-sm font-medium text-gray-700">Choose your color</label>
      <div className="grid grid-cols-6 gap-2">
        {predefinedColors.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => onChange(color)}
            className={cn(
              "w-8 h-8 rounded-full border-2 transition-all duration-200 hover:scale-110",
              value === color 
                ? "border-gray-900 shadow-lg" 
                : "border-gray-300 hover:border-gray-400"
            )}
            style={{ backgroundColor: color }}
            title={color}
          />
        ))}
      </div>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
          title="Custom color"
        />
        <span className="text-xs text-gray-500">Custom</span>
      </div>
    </div>
  )
}

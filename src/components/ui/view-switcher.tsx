"use client"

import { LayoutGrid, Rows } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import type { SketchViewMode } from "@/types/script-vision"

interface ViewSwitcherProps {
  mode: SketchViewMode
  onModeChange: (mode: SketchViewMode) => void
  className?: string
}

export function ViewSwitcher({ mode, onModeChange, className }: ViewSwitcherProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
        className
      )}
    >
      <Button
        variant={mode === 'carousel' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onModeChange('carousel')}
        className={cn(
          "h-8 px-2.5",
          mode === 'carousel'
            ? "bg-background text-foreground shadow-sm"
            : "hover:bg-background/50"
        )}
      >
        <Rows className="h-4 w-4" />
        <span className="sr-only">Carousel View</span>
      </Button>
      <Button
        variant={mode === 'grid' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onModeChange('grid')}
        className={cn(
          "h-8 px-2.5",
          mode === 'grid'
            ? "bg-background text-foreground shadow-sm"
            : "hover:bg-background/50"
        )}
      >
        <LayoutGrid className="h-4 w-4" />
        <span className="sr-only">Grid View</span>
      </Button>
    </div>
  )
}

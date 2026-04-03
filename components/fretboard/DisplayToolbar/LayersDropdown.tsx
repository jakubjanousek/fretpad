"use client";

import { ChevronDown, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface LayersDropdownProps {
  showScaleTones: boolean;
  onToggleScaleTones?: () => void;
}

export function LayersDropdown({
  showScaleTones,
  onToggleScaleTones,
}: LayersDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "h-8 px-2.5 gap-1.5 text-xs",
            showScaleTones && "border-blue-500/50 bg-blue-500/10",
          )}
        >
          <Layers className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Layers</span>
          {showScaleTones && (
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          )}
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuCheckboxItem
          checked={showScaleTones}
          onCheckedChange={onToggleScaleTones}
        >
          <div className="flex flex-col gap-0.5">
            <span className="font-medium">Fill Scale</span>
            <span className="text-[10px] text-muted-foreground">
              Show remaining diatonic notes
            </span>
          </div>
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

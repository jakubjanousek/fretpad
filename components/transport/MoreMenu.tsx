"use client";

import { BookOpen, CircleHelp, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MoreMenuProps {
  onSettingsClick: () => void;
  onHelpClick: () => void;
  onGuideClick: () => void;
}

/**
 * Combined "More" dropdown menu for secondary actions.
 * Contains: Help Guide, Keyboard Shortcuts, Settings
 */
export function MoreMenu({
  onSettingsClick,
  onHelpClick,
  onGuideClick,
}: MoreMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-9 px-3 gap-1.5"
          aria-label="More options"
        >
          <Settings className="h-4 w-4" />
          <span className="hidden sm:inline text-xs">More</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem
          onClick={onGuideClick}
          className="gap-2 cursor-pointer"
        >
          <BookOpen className="h-4 w-4" />
          <span>Help Guide</span>
          <span className="ml-auto text-xs text-muted-foreground">H</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={onHelpClick}
          className="gap-2 cursor-pointer"
        >
          <CircleHelp className="h-4 w-4" />
          <span>Keyboard Shortcuts</span>
          <span className="ml-auto text-xs text-muted-foreground">?</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={onSettingsClick}
          className="gap-2 cursor-pointer"
        >
          <Settings className="h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

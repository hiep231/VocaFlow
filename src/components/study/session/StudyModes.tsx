import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dumbbell, BookOpen, Puzzle, Mic } from "lucide-react";
import type { StudyMode } from "@/hooks/useStudySession";

interface StudyModesProps {
  mode: StudyMode;
  onModeChange: (mode: StudyMode) => void;
}

export function StudyModes({ mode, onModeChange }: StudyModesProps) {
  return (
    <div className="mb-8 w-full max-w-[550px] px-4">
      <Tabs
        value={mode}
        onValueChange={(v) => onModeChange(v as StudyMode)}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-4 h-auto p-1">
          <TabsTrigger
            value="practice"
            className="flex flex-col md:flex-row items-center gap-1 md:gap-2 text-[10px] md:text-sm py-2"
          >
            <Dumbbell className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
            <span>Practice</span>
          </TabsTrigger>
          <TabsTrigger
            value="flashcard"
            className="flex flex-col md:flex-row items-center gap-1 md:gap-2 text-[10px] md:text-sm py-2"
          >
            <BookOpen className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
            <span>Flashcard</span>
          </TabsTrigger>
          <TabsTrigger
            value="grammar"
            className="flex flex-col md:flex-row items-center gap-1 md:gap-2 text-[10px] md:text-sm py-2"
          >
            <Puzzle className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
            <span>Grammar</span>
          </TabsTrigger>
          <TabsTrigger
            value="shadowing"
            className="flex flex-col md:flex-row items-center gap-1 md:gap-2 text-[10px] md:text-sm py-2"
          >
            <Mic className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
            <span>Shadowing</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}

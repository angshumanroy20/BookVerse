import { Grid3x3, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useViewMode } from "@/contexts/ViewModeContext";

export default function ViewModeToggle() {
  const { viewMode, setViewMode } = useViewMode();

  return (
    <div className="flex items-center gap-1 border border-border rounded-md p-1">
      <Button
        variant={viewMode === "grid" ? "default" : "ghost"}
        size="sm"
        onClick={() => setViewMode("grid")}
        className="h-8 px-3"
      >
        <Grid3x3 className="w-4 h-4" />
      </Button>
      <Button
        variant={viewMode === "list" ? "default" : "ghost"}
        size="sm"
        onClick={() => setViewMode("list")}
        className="h-8 px-3"
      >
        <List className="w-4 h-4" />
      </Button>
    </div>
  );
}

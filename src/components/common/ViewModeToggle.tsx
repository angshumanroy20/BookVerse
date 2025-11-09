import { Grid3x3, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useViewMode } from "@/contexts/ViewModeContext";

export default function ViewModeToggle() {
  const { viewMode, setViewMode } = useViewMode();

  return (
    <div className="flex items-center gap-1 border-2 border-border/50 rounded-xl p-1 shadow-elegant bg-card">
      <Button
        variant={viewMode === "grid" ? "default" : "ghost"}
        size="sm"
        onClick={() => setViewMode("grid")}
        className={`h-10 px-4 rounded-lg transition-all duration-300 ${
          viewMode === "grid" 
            ? "gradient-primary text-primary-foreground shadow-glow" 
            : "hover:bg-muted/50"
        }`}
      >
        <Grid3x3 className="w-4 h-4" />
      </Button>
      <Button
        variant={viewMode === "list" ? "default" : "ghost"}
        size="sm"
        onClick={() => setViewMode("list")}
        className={`h-10 px-4 rounded-lg transition-all duration-300 ${
          viewMode === "list" 
            ? "gradient-primary text-primary-foreground shadow-glow" 
            : "hover:bg-muted/50"
        }`}
      >
        <List className="w-4 h-4" />
      </Button>
    </div>
  );
}

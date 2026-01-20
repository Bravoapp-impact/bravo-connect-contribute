import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface HRExperienceFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  categoryFilter: string;
  onCategoryChange: (value: string) => void;
  cityFilter: string;
  onCityChange: (value: string) => void;
  showPastEvents: boolean;
  onShowPastEventsChange: (value: boolean) => void;
  categories: { id: string; name: string }[];
  cities: { id: string; name: string }[];
  resultCount: number;
}

export function HRExperienceFilters({
  searchTerm,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  cityFilter,
  onCityChange,
  showPastEvents,
  onShowPastEventsChange,
  categories,
  cities,
  resultCount,
}: HRExperienceFiltersProps) {
  const hasActiveFilters =
    searchTerm || categoryFilter !== "all" || cityFilter !== "all" || showPastEvents;

  const clearFilters = () => {
    onSearchChange("");
    onCategoryChange("all");
    onCityChange("all");
    onShowPastEventsChange(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cerca esperienza..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 bg-background/50"
          />
        </div>

        {/* Category filter */}
        <Select value={categoryFilter} onValueChange={onCategoryChange}>
          <SelectTrigger className="w-full sm:w-[180px] bg-background/50">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutte le categorie</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* City filter */}
        <Select value={cityFilter} onValueChange={onCityChange}>
          <SelectTrigger className="w-full sm:w-[180px] bg-background/50">
            <SelectValue placeholder="Città" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutte le città</SelectItem>
            {cities.map((city) => (
              <SelectItem key={city.id} value={city.id}>
                {city.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Past events toggle */}
        <Button
          variant={showPastEvents ? "default" : "outline"}
          onClick={() => onShowPastEventsChange(!showPastEvents)}
          className="shrink-0"
        >
          {showPastEvents ? "Eventi passati inclusi" : "Solo eventi futuri"}
        </Button>
      </div>

      {/* Results count and clear filters */}
      <div className="flex items-center justify-between">
        <Badge variant="secondary" className="bg-muted">
          {resultCount} {resultCount === 1 ? "esperienza trovata" : "esperienze trovate"}
        </Badge>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4 mr-1" />
            Rimuovi filtri
          </Button>
        )}
      </div>
    </div>
  );
}

"use client";

import { Button } from "@/components/ui/button";
import { APP_CATEGORIES, CATEGORY_META, type AppCategory } from "@/lib/categories";

interface CategoryFilterProps {
  selected: AppCategory | null;
  onSelect: (category: AppCategory | null) => void;
}

export function CategoryFilter({ selected, onSelect }: CategoryFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      <Button
        variant={selected === null ? "default" : "outline"}
        size="sm"
        onClick={() => onSelect(null)}
      >
        All
      </Button>
      {APP_CATEGORIES.map((category) => {
        const meta = CATEGORY_META[category];
        return (
          <Button
            key={category}
            variant={selected === category ? "default" : "outline"}
            size="sm"
            onClick={() => onSelect(category)}
            className="whitespace-nowrap"
          >
            {meta.label}
          </Button>
        );
      })}
    </div>
  );
}

"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // Assuming these are correctly imported from your shadcn/ui setup

// Define the props for the ModuleFilter component
interface ModuleFilterProps {
  options: string[]; // Array of string options for the filter (e.g., "2023 Mich")
  selectedValue: string; // The currently selected value
  onValueChange: (value: string) => void; // Callback when the value changes
}

export function ModuleFilter({
  options,
  selectedValue,
  onValueChange,
}: ModuleFilterProps) {
  return (
    <div className="w-auto min-w-[180px]">
      <Select value={selectedValue} onValueChange={onValueChange}>
        <SelectTrigger className="w-full whitespace-nowrap">
          <SelectValue placeholder="Filter by Term/Year" /> {/* Updated placeholder */}
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="all">All Modules</SelectItem>
            {options.map((value) => (
              <SelectItem key={value} value={value}>
                {value}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
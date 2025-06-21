"use client";

import { useState, useEffect } from "react";
// Removed direct Select imports here, as they are now encapsulated in ModuleFilter
// import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

// Import the modular components
import { AddModuleDialog } from "@/app/(pages)/modules/components/addModuleDialog"; // Adjust path if needed
import { ModuleCard } from "@/app/(pages)/modules/components/moduleCard"; // Adjust path if needed
import { ModuleFilter } from "@/app/(pages)/modules/components/moduleFilter"; // Import the new ModuleFilter component

// Define the Module interface (important to keep consistent across files)
interface Module {
  id: string;
  module_id: string; // Ensure this matches your backend/Supabase schema
  name: string;
  term: string;
  year: string;
}

// Define the shape of the data that AddModuleDialog will submit
interface NewModuleData {
  moduleId: string;
  name: string;
  year: string;
  term: string;
}

export default function Home() {
  const [modules, setModules] = useState<Module[]>([]);
  const [selectedFilter, setSelectedFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isDeleting, setIsDeleting] = useState<string | null>(null); // Stores module_id being deleted

  useEffect(() => {
    const fetchModules = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/modules", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
        const data = await res.json();
        if (!data.modules) throw new Error("Invalid data format");
        setModules(data.modules);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        console.error("Failed to fetch modules:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchModules();
  }, []);

  const handleDeleteModule = async (moduleId: string) => {
    setIsDeleting(moduleId);
    try {
      const response = await fetch(`/api/modules/${moduleId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete module");
      }

      setModules(modules.filter((mod) => mod.module_id !== moduleId));
      toast.success("Module deleted successfully!");
    } catch (error) {
      console.error("Error deleting module:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete module"
      );
    } finally {
      setIsDeleting(null);
    }
  };

  const handleAddModule = async (newModuleData: NewModuleData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/modules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newModuleData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add module");
      }

      const result = await response.json();
      setModules((prev) => [...prev, result.module]);

      setIsDialogOpen(false);
      toast.success("Module added successfully!");
    } catch (error) {
      console.error("Error adding module:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to add module."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // The options for the filter are derived from the modules data
  const yearTermOptions = Array.from(
    new Set(modules.map((m) => `${m.year} ${m.term}`))
  ).sort();

  const filteredModules =
    selectedFilter === "" || selectedFilter === "all"
      ? modules
      : modules.filter((mod) => `${mod.year} ${mod.term}` === selectedFilter);

  return (
    <main className="min-h-screen p-4 sm:p-8 lg:p-12 bg-white text-black dark:bg-[#0a0a0a] dark:text-white transition-colors duration-300">
      <h1 className="text-3xl sm:text-5xl font-bold mb-8 sm:mb-12 text-center">
        Course Modules
      </h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="mb-6 w-full mx-auto flex items-center gap-4">
        {/* Render the ModuleFilter component here */}
        <ModuleFilter
          options={yearTermOptions}
          selectedValue={selectedFilter}
          onValueChange={setSelectedFilter}
        />

        <AddModuleDialog
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onSubmit={handleAddModule}
          isSubmitting={isSubmitting}
        />
      </div>

      {loading ? (
        <div className="text-center py-12">Loading modules...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {filteredModules.length > 0 ? (
            filteredModules.map((mod) => (
              <ModuleCard
                key={mod.id}
                module={mod}
                onDelete={handleDeleteModule}
                isDeleting={isDeleting}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              No modules found matching your filters
            </div>
          )}
        </div>
      )}
    </main>
  );
}
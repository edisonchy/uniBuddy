"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Trash2 } from "lucide-react";

interface Module {
  id: string;
  module_id: string;
  name: string;
  term: string;
  year: string;
  outline_uploaded: string;
}

export default function Home() {
  const [modules, setModules] = useState<Module[]>([]);
  const [selectedFilter, setSelectedFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
    try {
      const response = await fetch(`/api/modules/${moduleId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete module");
      }

      // Update the UI by removing the deleted module
      setModules(modules.filter((mod) => mod.module_id !== moduleId));
      toast.success("Module deleted successfully!");
    } catch (error) {
      console.error("Error deleting module:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete module"
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const newModule = {
      moduleId: formData.get("moduleCode") as string,
      name: formData.get("name") as string,
      year: formData.get("year") as string,
      term: formData.get("term") as string,
    };

    try {
      const response = await fetch("/api/modules", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newModule),
      });

      if (!response.ok) throw new Error("Failed to add module");

      const result = await response.json();
      setModules((prev) => [...prev, result.module]);
      document.getElementById("closeDialog")?.click();

      toast.success("Module added successfully!");
    } catch (error) {
      console.error("Error adding module:", error);
      toast.error("Failed to add module.");
    }
  };

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
        <div className="w-auto min-w-[180px]">
          <Select value={selectedFilter} onValueChange={setSelectedFilter}>
            <SelectTrigger className="w-full whitespace-nowrap">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">All Modules</SelectItem>
                {yearTermOptions.map((value) => (
                  <SelectItem key={value} value={value}>
                    {value}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="cursor-pointer">Add Module</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add Module</DialogTitle>
              <DialogDescription>
                Add a new module. Click save when you're done.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div className="flex items-center gap-4">
                  <Label htmlFor="moduleCode" className="w-32 text-right">
                    Module Code
                  </Label>
                  <Input
                    id="moduleCode"
                    name="moduleCode"
                    required
                    placeholder="e.g., MKT101"
                    className="flex-1"
                  />
                </div>

                <div className="flex items-center gap-4">
                  <Label htmlFor="name" className="w-32 text-right">
                    Module Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    required
                    placeholder="e.g., Introduction to Marketing"
                    className="flex-1"
                  />
                </div>

                <div className="flex items-center gap-4">
                  <Label htmlFor="year" className="w-32 text-right">
                    Year
                  </Label>
                  <Input
                    id="year"
                    name="year"
                    required
                    placeholder="e.g., 2023"
                    className="flex-1"
                  />
                </div>

                <div className="flex items-center gap-4">
                  <Label htmlFor="term" className="w-32 text-right">
                    Term
                  </Label>
                  <Select name="term" required>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select term" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mich">Mich</SelectItem>
                      <SelectItem value="Lent">Lent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline" id="closeDialog" className="cursor-pointer">
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit" className="cursor-pointer">Add Module</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading modules...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {filteredModules.length > 0 ? (
            filteredModules.map((mod) => (
              <Card
                key={mod.id}
                className="relative border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition duration-200 dark:bg-gray-800/50"
              >
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                      aria-label={`Delete module ${mod.id}`}
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently
                        delete the module <strong>{mod.name}</strong>.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDeleteModule(mod.module_id)}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl font-semibold">
                    🧩 {mod.module_id}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-2">📘 {mod.name}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    📅 Term: {mod.term}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    📆 Year: {mod.year}
                  </p>
                </CardContent>
                <CardFooter>
                  <Link
                    href={{
                      pathname: `/modules/${mod.module_id}`,
                      query: { name: mod.name, year: mod.year, term: mod.term, uploaded: mod.outline_uploaded },
                    }}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    aria-label={`View lectures for ${mod.id}`}
                  >
                    👇 View Lectures
                  </Link>
                </CardFooter>
              </Card>
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

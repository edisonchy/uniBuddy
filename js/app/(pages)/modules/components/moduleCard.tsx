// components/ModuleCard.tsx
"use client";

import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { Trash2 } from "lucide-react";

// Define the Module interface (can be imported from Home.tsx if you prefer,
// or defined here and exported, then imported in Home.tsx)
interface Module {
  id: string;
  module_id: string; // Ensure this matches your backend/Supabase schema
  name: string;
  term: string;
  year: string;
}

// Define the props for the ModuleCard component
interface ModuleCardProps {
  module: Module; // The module data to display
  onDelete: (moduleId: string) => void; // Callback function to trigger deletion in the parent
  isDeleting: string | null; // The ID of the module currently being deleted (for loading state)
}

export function ModuleCard({ module, onDelete, isDeleting }: ModuleCardProps) {
  return (
    <Card
      key={module.id} // The key prop is important when rendering lists, but it's handled by the parent's map
      className="relative border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition duration-200 dark:bg-gray-800/50"
    >
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
            aria-label={`Delete module ${module.id}`}
            disabled={isDeleting === module.module_id} // Disable delete button if this module is being deleted
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              module <strong>{module.name}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => onDelete(module.module_id)} // Call the onDelete prop
              disabled={isDeleting === module.module_id} // Disable action button during deletion
            >
              {isDeleting === module.module_id ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <CardHeader>
        <CardTitle className="text-lg sm:text-xl font-semibold">
          🧩 {module.module_id}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm mb-2">📘 {module.name}</p>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          📅 Term: {module.term}
        </p>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          📆 Year: {module.year}
        </p>
      </CardContent>
      <CardFooter>
        <Link
          href={{
            pathname: `/modules/${module.module_id}`,
            query: {
              name: module.name,
              year: module.year,
              term: module.term,
            },
          }}
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          aria-label={`View lectures for ${module.id}`}
        >
          👇 View Lectures
        </Link>
      </CardFooter>
    </Card>
  );
}
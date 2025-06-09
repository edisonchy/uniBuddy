// components/AddModuleDialog.tsx
"use client";

import { useState } from "react";
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
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Define the shape of the data this component will submit
interface NewModuleData {
  moduleId: string;
  name: string;
  year: string;
  term: string;
}

// Define the props for the AddModuleDialog component
interface AddModuleDialogProps {
  isOpen: boolean; // Controls whether the dialog is open
  onOpenChange: (open: boolean) => void; // Callback when dialog open state changes
  onSubmit: (data: NewModuleData) => Promise<void>; // Function to call on form submission
  isSubmitting: boolean; // Loading state for the parent (Home component)
}

export function AddModuleDialog({
  isOpen,
  onOpenChange,
  onSubmit,
  isSubmitting,
}: AddModuleDialogProps) {
  // State for the form inputs, managed internally by this component
  const [moduleCode, setModuleCode] = useState("");
  const [moduleName, setModuleName] = useState("");
  const [moduleYear, setModuleYear] = useState("");
  const [moduleTerm, setModuleTerm] = useState("");

  // Internal handler for the form submission
  const handleInternalSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Create the data object to pass to the parent's onSubmit prop
    const newModuleData: NewModuleData = {
      moduleId: moduleCode,
      name: moduleName,
      year: moduleYear,
      term: moduleTerm,
    };

    // Call the parent's onSubmit function
    await onSubmit(newModuleData);

    // After submission (and parent handles success/error), reset form fields
    // This happens regardless of success/failure, as onSubmit is expected to complete
    // and then the dialog might close via onOpenChange if successful.
    if (!isSubmitting) { // Only reset if not still submitting from previous attempt
        setModuleCode("");
        setModuleName("");
        setModuleYear("");
        setModuleTerm("");
        // No need to call onOpenChange(false) here, parent will do it on success.
    }
  };

  // Function to reset form fields when dialog is closed (e.g., by clicking outside or cancel)
  const handleDialogClose = (open: boolean) => {
    if (!open) { // If dialog is closing
        setModuleCode("");
        setModuleName("");
        setModuleYear("");
        setModuleTerm("");
    }
    onOpenChange(open); // Propagate the change to the parent
  };


  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogTrigger asChild>
        {/*
          The DialogTrigger is usually the button that opens the dialog.
          It's controlled by the parent component's `isSubmitting` state.
          The button text reflects the parent's loading status.
        */}
        <Button
          variant="outline"
          className="cursor-pointer"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Adding..." : "Add Module"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Module</DialogTitle>
          <DialogDescription>
            Add a new module. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleInternalSubmit}>
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
                value={moduleCode}
                onChange={(e) => setModuleCode(e.target.value)}
                disabled={isSubmitting} // Disable inputs during submission
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
                value={moduleName}
                onChange={(e) => setModuleName(e.target.value)}
                disabled={isSubmitting}
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
                value={moduleYear}
                onChange={(e) => setModuleYear(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="flex items-center gap-4">
              <Label htmlFor="term" className="w-32 text-right">
                Term
              </Label>
              <Select
                name="term"
                required
                value={moduleTerm}
                onValueChange={setModuleTerm}
                disabled={isSubmitting}
              >
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
              <Button
                type="button"
                variant="outline"
                className="cursor-pointer"
                disabled={isSubmitting} // Disable cancel button too
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              className="cursor-pointer"
              disabled={isSubmitting} // Disable submit button during submission
            >
              {isSubmitting ? "Adding..." : "Add Module"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
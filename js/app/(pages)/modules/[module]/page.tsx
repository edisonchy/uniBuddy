"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import FileUploadCard from "@/app/(pages)/modules/[module]/components/fileUploadCard";

export default function CollapsibleDemo() {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const pathSegments = pathname.split("/");
  const moduleId = pathSegments[pathSegments.length - 1];
  const name = searchParams.get("name");
  const year = searchParams.get("year");
  const term = searchParams.get("term");

  return (
    <main className="min-h-screen p-8 sm:p-20 bg-white text-black dark:bg-[#0a0a0a] dark:text-white">
      <section className="mb-6">
        <Link
          href="/modules"
          className="inline-block mb-4 text-blue-600 dark:text-blue-400 hover:underline text-sm"
        >
          ← Back to Modules
        </Link>

        <div className="flex items-end gap-6 mb-10">
          <h1 className="text-3xl sm:text-5xl font-bold">
            📘 {moduleId} - {name}
          </h1>
          <div className="pb-1 text-md text-gray-600 dark:text-gray-400">
            {year} {term}
          </div>
        </div>
        <div>
          <FileUploadCard />
        </div>
      </section>
    </main>
  );
}

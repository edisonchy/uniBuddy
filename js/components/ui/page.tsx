"use client"

import { useState } from "react";
import Link from "next/link";

export default function Home() {
  const [modules] = useState([
    {
      id: "marketing-101",
      code: "MKT101",
      description: "Introduction to core marketing principles and consumer behavior.",
      term: "Spring 2025",
      year: "2025"
    },
    {
      id: "finance-basics",
      code: "FIN100",
      description: "Covers the essentials of personal finance and corporate accounting.",
      term: "Spring 2025",
      year: "2025"
    },
    {
      id: "business-strategy",
      code: "BUS205",
      description: "Explores competitive advantage, SWOT, and strategic frameworks.",
      term: "Summer 2025",
      year: "2025"
    }
  ]);

  const [filterYear, setFilterYear] = useState("");
  const [filterTerm, setFilterTerm] = useState("");

  const filteredModules = modules.filter((mod) => {
    return (
      (filterYear === "" || mod.year === filterYear) &&
      (filterTerm === "" || mod.term.toLowerCase().includes(filterTerm.toLowerCase()))
    );
  });

  return (
    <main className="min-h-screen p-8 sm:p-20 bg-white text-black dark:bg-[#0a0a0a] dark:text-white">
      <h1 className="text-3xl sm:text-5xl font-bold mb-12 text-center">📚 Course Modules</h1>

      <div className="mb-12 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Filter by Year (e.g., 2025)"
          value={filterYear}
          onChange={(e) => setFilterYear(e.target.value)}
          className="p-2 border rounded w-full"
        />
        <input
          type="text"
          placeholder="Filter by Term (e.g., Spring)"
          value={filterTerm}
          onChange={(e) => setFilterTerm(e.target.value)}
          className="p-2 border rounded w-full"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredModules.map((mod) => (
          <div
            key={mod.id}
            className="rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 hover:shadow-md transition duration-200"
          >
            <h2 className="text-xl font-semibold mb-2">🧩 {mod.code}</h2>
            <p className="text-sm mb-4">📘 {mod.description}</p>
            <p className="text-xs mb-1 text-gray-600 dark:text-gray-400">📅 {mod.term}</p>
            <p className="text-xs mb-4 text-gray-600 dark:text-gray-400">📆 Year: {mod.year}</p>
            <Link
              href={`/modules/${mod.id}`}
              className="inline-block mt-auto text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              👇 View Lectures
            </Link>
          </div>
        ))}
      </div>
    </main>
  );
}
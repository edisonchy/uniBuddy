"use client";

import { useState } from "react";
import Link from "next/link";

export default function ModulePage() {
  const [lectures] = useState([
    { id: "topic-1", title: "Module Introduction" },
    { id: "topic-2", title: "Projects and Organisational Strategy" },
    { id: "topic-3", title: "Requirements Management / Project Definition" },
    { id: "topic-4", title: "Stakeholder Engagement" },
    { id: "topic-5", title: "Structural Choices and Frameworks; Project Lifecycles" },
    { id: "topic-6", title: "Project Success" },
    { id: "topic-7", title: "Strategic Project Governance and Leadership" },
    { id: "topic-8", title: "Cost Planning" },
    { id: "topic-9", title: "Time Planning" },
    { id: "topic-10", title: "Project Risk and Uncertainty Management" },
    { id: "topic-11", title: "Project Controls" },
    { id: "topic-12", title: "Project Closure" },
  ]);

  return (
    <main className="min-h-screen p-8 sm:p-20 bg-white text-black dark:bg-[#0a0a0a] dark:text-white">
      <section className="mb-6">
        <Link
          href="/modules"
          className="inline-block mb-4 text-blue-600 dark:text-blue-400 hover:underline text-sm"
        >
          ← Back to Modules
        </Link>

        <h1 className="text-3xl sm:text-5xl font-bold mb-6">📘 SCC211 - Strategic Project Management</h1>

        <button className="mb-6 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded text-sm">
          📤 Upload Course Outline
        </button>

        <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-xl shadow-md max-w-3xl">
          <p className="text-lg font-medium mb-2">Instructor: Dr Aaron Anvuur</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Email: a.anvuur@lancaster.ac.uk</p>
          <div className="border-t border-gray-300 dark:border-gray-600 pt-4 mb-0">
            <p className="text-md font-semibold mb-1">📝 Assessments</p>
            <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300">
              <li>Exam: 50%</li>
              <li>Coursework: 50%</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        {lectures.map((lecture) => (
          <div
            key={lecture.id}
            className="border rounded-xl p-4 shadow-sm hover:shadow-md transition duration-200 dark:border-gray-700"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">📝 {lecture.title}</h2>
              <Link
                href={`/modules/scc211/lectures/${lecture.id}`}
                className="inline-block text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                View Summary →
              </Link>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
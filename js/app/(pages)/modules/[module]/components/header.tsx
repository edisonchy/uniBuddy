import Link from "next/link";

interface ModuleHeaderProps {
  moduleId: string;
  name: string | null;
  year: string | null;
  term: string | null;
}

export default function Header({ moduleId, name, year, term }: ModuleHeaderProps) {
  return (
    <header>
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
    </header>
  );
}
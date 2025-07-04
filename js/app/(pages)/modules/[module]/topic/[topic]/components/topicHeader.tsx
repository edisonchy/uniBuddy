'use client';

import Link from 'next/link';

interface TopicHeaderProps {
  moduleId: string;
  topic: string;
}

export default function TopicHeader({ moduleId, topic }: TopicHeaderProps) {
  return (
    <header className="mb-6 flex-shrink-0">
      <Link
        href={`/modules/${moduleId}`}
        className="inline-block mb-4 text-blue-600 dark:text-blue-400 hover:underline text-sm"
      >
        ← Back to {moduleId} Outline
      </Link>
      <h1 className="text-3xl sm:text-5xl font-bold mb-6">
        Topic: {decodeURIComponent(topic)}
      </h1>
    </header>
  );
}
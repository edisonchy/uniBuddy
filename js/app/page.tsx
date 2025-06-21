"use client";

export default function Home() {
  const openModules = () => {
    window.open("/modules", "_blank");
  };

  return (
    <main className="min-h-screen p-8 sm:p-20 bg-white text-black dark:bg-[#0a0a0a] dark:text-white">
      <h1 className="text-3xl sm:text-5xl font-bold mb-12 text-center">
        📚 UniBuddy.ai
      </h1>
      <div className="flex justify-center">
        <button
          onClick={openModules}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded text-sm"
        >
          🔗 Open Modules
        </button>
      </div>
    </main>
  );
}

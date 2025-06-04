"use client";

import Link from "next/link";
import { Fullscreen } from "lucide-react";
import { useState } from "react";

export default function LecturePage() {
  const lecture = {
    title: "Project Risk and Uncertainty Management",
    date: "Monday, 10 March 2025",
    slides: Array.from({ length: 10 }, (_, i) => ({ number: i + 1, image: "/lol.pdf" })),
    keyTakeaways: [
      "Risk is an inherent part of every project and must be actively managed.",
      "Early identification and planning reduces the impact of major risks.",
      "A combination of assessment methods is most effective."
    ]
  };

  const handleFullScreen = (src) => {
    const img = new Image();
    img.src = src;
    const w = window.open();
    w?.document.write(img.outerHTML);
  };

  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    setChatMessages([...chatMessages, { sender: "You", text: newMessage }]);
    setNewMessage("");
  };

  return (
    <main className="min-h-screen p-8 sm:p-20 bg-white text-black dark:bg-[#0a0a0a] dark:text-white">
      <section className="mb-8">
        <Link href="/modules/scc211" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">← Back to Module</Link>
        <h1 className="text-2xl sm:text-4xl font-bold mt-4 mb-2">📝 {lecture.title}</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">📅 {lecture.date}</p>
        <div className="mt-4">
          <button className="inline-block bg-blue-600 hover:bg-blue-700 text-white py-1.5 px-3 rounded text-sm">
            📤 Upload Slides
          </button>
        </div>
      </section>

      {lecture.keyTakeaways.length > 0 && (
        <section className="mb-10">
          <div className="bg-yellow-100 dark:bg-yellow-900 p-4 rounded-xl shadow-inner">
            <h2 className="text-lg font-semibold mb-2">💡 Key Ideas</h2>
            <ul className="list-disc list-inside text-sm text-gray-800 dark:text-gray-200 space-y-1">
              {lecture.keyTakeaways.map((point, index) => (
                <li key={index}>{point}</li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <div className="flex flex-col lg:flex-row gap-10">
        <div className="flex-1 max-h-[80vh] overflow-y-auto">
          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-4">📊 Slides</h2>
            <ul className="space-y-6">
              {lecture.slides.map((slide) => (
                <li key={slide.number} className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                  <div className="relative">
                    <embed src={slide.image} type="application/pdf" className="rounded mb-2 w-full max-w-3xl h-[400px]" />
                    <button
                      onClick={() => handleFullScreen(slide.image)}
                      className="absolute top-2 right-2 p-1 bg-white dark:bg-gray-900 rounded-full shadow hover:scale-105 transition"
                      aria-label="View Fullscreen"
                    >
                      <Fullscreen size={16} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="flex-1 max-h-[80vh] overflow-y-auto border rounded-lg p-4 bg-gray-50 dark:bg-gray-900 shadow-sm flex flex-col">
          <h2 className="text-lg font-semibold mb-2">💬 Lecture Chat</h2>
          <div className="flex-1 overflow-y-auto mb-4 space-y-2">
            {chatMessages.map((msg, idx) => (
              <div key={idx} className="text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 p-2 rounded">
                <strong>{msg.sender}:</strong> {msg.text}
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              className="flex-1 p-2 rounded border dark:border-gray-700 dark:bg-gray-800"
              placeholder="Type a message..."
            />
            <button
              onClick={sendMessage}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm"
            >
              Send
            </button>
          </div>
        </aside>
      </div>
    </main>
  );
}
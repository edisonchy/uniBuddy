"use client";

import { useRef, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ChatMessage {
  role: "user" | "model";
  text: string;
}

interface TopicContentSectionProps {
  topic: string;
  slideUrl: string | null;
  chatHistory: ChatMessage[];
  isSendingMessage: boolean;
  currentMessage: string;
  setCurrentMessage: (val: string) => void;
  handleSendMessage: () => void;
  handleKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export default function TopicContentSection({
  topic,
  slideUrl,
  chatHistory,
  isSendingMessage,
  currentMessage,
  setCurrentMessage,
  handleSendMessage,
  handleKeyPress,
}: TopicContentSectionProps) {
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll when new message is added
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  return (
    <section className="flex-grow flex flex-col md:flex-row gap-6">
      {/* 📚 Lecture Slides */}
      <Card className="flex-1 bg-gray-100 dark:bg-gray-900 p-4 rounded-lg shadow-md overflow-hidden flex flex-col">
        <CardHeader className="p-0 pb-4">
          <CardTitle className="text-xl font-semibold">
            📚 Lecture Slides
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-0">
          {slideUrl ? (
            <iframe
              src={slideUrl}
              className="w-full h-full"
              title="Lecture Slides"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400 text-center">
              <p>No slides uploaded yet for this topic.</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="p-0 pt-4 flex-shrink-0">
          <Button variant="outline" className="w-full">
            Upload New Slides (Coming Soon)
          </Button>
        </CardFooter>
      </Card>

      {/* 🤖 AI Chat */}
      <Card className="flex-1 bg-gray-100 dark:bg-gray-900 p-4 rounded-lg shadow-md overflow-hidden flex flex-col h-[70vh] md:h-auto">
        <CardHeader className="p-0 pb-4">
          <CardTitle className="text-xl font-semibold">🤖 AI Chat</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-0 space-y-4 pr-2">
          {chatHistory.length === 0 ? (
            <div className="text-gray-500 dark:text-gray-400 text-center py-4">
              Ask me anything about "
              <strong>{decodeURIComponent(topic)}</strong>"!
            </div>
          ) : (
            chatHistory.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg shadow-sm ${
                    msg.role === "user"
                      ? "bg-blue-500 text-white dark:bg-blue-600"
                      : "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))
          )}
          {isSendingMessage && (
            <div className="flex justify-start">
              <div className="max-w-[80%] p-3 rounded-lg shadow-sm bg-gray-200 dark:bg-gray-700 animate-pulse">
                AI is thinking...
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </CardContent>
        <CardFooter className="p-0 pt-4 flex-shrink-0">
          <div className="flex w-full space-x-2">
            <Input
              type="text"
              placeholder="Ask about the topic..."
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isSendingMessage}
              className="flex-1 rounded-lg dark:bg-gray-800 dark:border-gray-700"
            />
            <Button onClick={handleSendMessage} disabled={isSendingMessage}>
              {isSendingMessage ? "Sending..." : "Send"}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </section>
  );
}

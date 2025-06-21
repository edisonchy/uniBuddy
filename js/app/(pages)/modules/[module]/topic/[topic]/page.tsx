// app/(pages)/modules/[module]/topics/[topic]/page.tsx
'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react'; // Added useEffect for scrollIntoView
import { Button } from "@/components/ui/button"; // Assuming you have shadcn/ui Button
import { Input } from "@/components/ui/input";   // Assuming you have shadcn/ui Input
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"; // Assuming shadcn/ui Card

// Define interface for chat messages
interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export default function TopicPage() {
  const params = useParams();
  const moduleId = params.module as string;
  const topic = params.topic as string;

  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState<string>('');
  const [isSendingMessage, setIsSendingMessage] = useState<boolean>(false);
  const chatEndRef = useRef<HTMLDivElement>(null); // Ref for auto-scrolling chat

  // Auto-scroll to the latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  const handleSendMessage = async () => {
    if (currentMessage.trim() === '') return;

    const userMessage: ChatMessage = { role: 'user', text: currentMessage.trim() };
    const newChatHistory = [...chatHistory, userMessage];
    setChatHistory(newChatHistory);
    setCurrentMessage('');
    setIsSendingMessage(true);

    try {
      // Prepare chat history for the LLM API call
      // Only send roles the LLM understands and text parts
      const llmChatHistory = newChatHistory.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }]
      }));

      const prompt = `You are an AI assistant designed to help students understand the module topic "${decodeURIComponent(topic)}" within the module "${moduleId}". Answer questions directly related to this topic. If a question is outside the scope of this specific topic, kindly state that you cannot answer it and offer to help with the current topic.
      
      Current Topic: "${decodeURIComponent(topic)}"
      Module ID: "${moduleId}"
      
      User's question: "${userMessage.text}"`;

      const payload = {
        contents: [...llmChatHistory.slice(-5), { role: "user", parts: [{ text: prompt }] }], // Send last 5 messages + current prompt for context
      };

      // ** IMPORTANT: DO NOT provide an actual API key here. Canvas will inject it. **
      const apiKey = ""; 
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorBody = await response.json();
        throw new Error(`API error: ${response.statusText} - ${JSON.stringify(errorBody)}`);
      }

      const result = await response.json();

      if (result.candidates && result.candidates.length > 0 &&
          result.candidates[0].content && result.candidates[0].content.parts &&
          result.candidates[0].content.parts.length > 0) {
        const aiResponseText = result.candidates[0].content.parts[0].text;
        setChatHistory((prev) => [...prev, { role: 'model', text: aiResponseText }]);
      } else {
        setChatHistory((prev) => [...prev, { role: 'model', text: 'Sorry, I could not generate a response.' }]);
        console.error("Unexpected API response structure:", result);
      }
    } catch (error) {
      console.error("Error sending message to AI:", error);
      setChatHistory((prev) => [...prev, { role: 'model', text: 'Error: Could not connect to AI. Please try again later.' }]);
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isSendingMessage) {
      handleSendMessage();
    }
  };

  return (
    <main className="min-h-screen p-4 sm:p-8 lg:p-12 bg-white text-black dark:bg-[#0a0a0a] dark:text-white transition-colors duration-300 flex flex-col">
      <section className="mb-6 flex-shrink-0">
        <Link
          href={`/modules/${moduleId}`}
          className="inline-block mb-4 text-blue-600 dark:text-blue-400 hover:underline text-sm"
        >
          ← Back to {moduleId} Outline
        </Link>
        <h1 className="text-3xl sm:text-5xl font-bold mb-6">Topic: {decodeURIComponent(topic)}</h1>
      </section>

      <section className="flex-grow flex flex-col md:flex-row gap-6">
        {/* Left Column: Lecture Slides Placeholder */}
        <Card className="flex-1 bg-gray-100 dark:bg-gray-900 p-4 rounded-lg shadow-md overflow-hidden flex flex-col">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="text-xl font-semibold">📚 Lecture Slides</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-0">
            <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400 text-center">
              <p>
                [Placeholder for Lecture Slides]<br />
                (e.g., Embedded PDF viewer, image carousel, or summary generated from slides)
              </p>
            </div>
          </CardContent>
          <CardFooter className="p-0 pt-4 flex-shrink-0">
            <Button variant="outline" className="w-full">Upload New Slides (Coming Soon)</Button>
          </CardFooter>
        </Card>

        {/* Right Column: Interactive AI Chat */}
        <Card className="flex-1 bg-gray-100 dark:bg-gray-900 p-4 rounded-lg shadow-md overflow-hidden flex flex-col h-[70vh] md:h-auto">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="text-xl font-semibold">🤖 AI Chat</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-0 space-y-4 pr-2">
            {chatHistory.length === 0 ? (
              <div className="text-gray-500 dark:text-gray-400 text-center py-4">
                Ask me anything about "<strong>{decodeURIComponent(topic)}</strong>"!
              </div>
            ) : (
              chatHistory.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg shadow-sm ${
                      msg.role === 'user'
                        ? 'bg-blue-500 text-white dark:bg-blue-600'
                        : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
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
            <div ref={chatEndRef} /> {/* For auto-scrolling */}
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
                {isSendingMessage ? 'Sending...' : 'Send'}
              </Button>
            </div>
          </CardFooter>
        </Card>
      </section>
    </main>
  );
}
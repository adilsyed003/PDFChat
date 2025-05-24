"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export default function ChatPage() {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [mounted, setMounted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: input,
          pdfText: localStorage.getItem("pdfFiles") || "",
        }), // Only send the input text
      });

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          id: data.id || crypto.randomUUID(),
          role: data.role || "assistant",
          content: data.content || "",
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "Sorry, there was an error.",
        },
      ]);
    }
  };

  if (!mounted) return null;

  return (
    <div className="flex flex-col h-[100dvh] bg-black">
      {/* Navbar */}
      <nav className="w-full bg-black border-b border-white/20 py-4">
        <div className="max-w-3xl mx-auto px-4 flex items-center">
          <a
            href="/"
            className="mr-4 cursor-pointer text-xl font-bold text-white tracking-wide"
          >
            Chat with PDF
          </a>
        </div>
      </nav>
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto py-8 px-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`mb-6 flex ${
                message.role === "assistant" ? "justify-start" : "justify-end"
              }`}
            >
              <div
                className={`rounded-2xl px-4 py-2 max-w-[85%] border border-white/50 ${
                  message.role === "assistant"
                    ? "bg-black text-white"
                    : "bg-white text-black"
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Chat Input */}
      <div className="border-t border-white/50 bg-black p-4">
        <form ref={formRef} onSubmit={onSubmit} className="max-w-3xl mx-auto">
          <div className="relative">
            <input
              value={input}
              onChange={handleInputChange}
              placeholder="Type your message..."
              className="w-full h-[90px] rounded-full bg-zinc-800 pl-6 pr-16 text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-white/50 border border-white/50"
              suppressHydrationWarning
            />
            <Button
              type="submit"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 h-16 w-16 rounded-full bg-white hover:bg-zinc-200 text-black"
            >
              <Send className="h-6 w-6" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

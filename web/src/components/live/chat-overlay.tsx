"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/types/database";

interface ChatOverlayProps {
  streamId: string;
}

const INITIAL_MESSAGES: readonly ChatMessage[] = [
  {
    id: "cm1",
    stream_id: "st1",
    user_id: "u1",
    user_name: "Ahmed_AE",
    user_avatar: null,
    message: "Just joined! What's up for auction?",
    created_at: new Date(Date.now() - 120000).toISOString(),
    is_seller: false,
  },
  {
    id: "cm2",
    stream_id: "st1",
    user_id: "s4",
    user_name: "Pop Haven QA",
    user_avatar: null,
    message: "Welcome everyone! Starting with One Piece cards",
    created_at: new Date(Date.now() - 90000).toISOString(),
    is_seller: true,
  },
  {
    id: "cm3",
    stream_id: "st1",
    user_id: "u2",
    user_name: "DxBCollector",
    user_avatar: null,
    message: "Do you have Gear 5 Luffy alt art?",
    created_at: new Date(Date.now() - 60000).toISOString(),
    is_seller: false,
  },
  {
    id: "cm4",
    stream_id: "st1",
    user_id: "u3",
    user_name: "KarenTCG",
    user_avatar: null,
    message: "That Zoro card is fire!!",
    created_at: new Date(Date.now() - 45000).toISOString(),
    is_seller: false,
  },
  {
    id: "cm5",
    stream_id: "st1",
    user_id: "s4",
    user_name: "Pop Haven QA",
    user_avatar: null,
    message: "Yes! Gear 5 coming up next. Stay tuned",
    created_at: new Date(Date.now() - 30000).toISOString(),
    is_seller: true,
  },
] as const;

function formatChatTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function ChatOverlay({ streamId }: ChatOverlayProps) {
  const [messages, setMessages] = useState<readonly ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const messagesForStream = INITIAL_MESSAGES.map((msg) => ({
      ...msg,
      stream_id: streamId,
    }));
    setMessages(messagesForStream);
  }, [streamId]);

  useEffect(() => {
    const container = scrollRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages]);

  const handleSend = useCallback(() => {
    const trimmed = inputValue.trim();
    if (trimmed.length === 0) return;

    const newMessage: ChatMessage = {
      id: `cm-${Date.now()}`,
      stream_id: streamId,
      user_id: "me",
      user_name: "You",
      user_avatar: null,
      message: trimmed,
      created_at: new Date().toISOString(),
      is_seller: false,
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputValue("");
  }, [inputValue, streamId]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto bg-black/40 rounded-xl p-3 space-y-3"
        role="log"
        aria-label="Live chat messages"
        aria-live="polite"
      >
        {messages.map((msg) => (
          <div key={msg.id} className="flex items-start gap-2">
            {/* Avatar */}
            <div
              className={cn(
                "h-7 w-7 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold",
                msg.is_seller
                  ? "bg-lvl-yellow text-lvl-black"
                  : "bg-lvl-slate text-lvl-white",
              )}
            >
              {msg.user_name.charAt(0).toUpperCase()}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span
                  className={cn(
                    "text-xs font-bold font-body",
                    msg.is_seller ? "text-lvl-yellow" : "text-white",
                  )}
                >
                  {msg.user_name}
                </span>
                {msg.is_seller && (
                  <span className="text-[9px] bg-lvl-yellow text-lvl-black px-1.5 py-0.5 rounded font-bold uppercase">
                    Seller
                  </span>
                )}
                <span className="text-[10px] text-white/40 font-body">
                  {formatChatTime(msg.created_at)}
                </span>
              </div>
              <p className="text-sm text-white/90 font-body leading-snug mt-0.5">
                {msg.message}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="mt-2 flex items-center gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Say something..."
          className="flex-1 bg-lvl-slate rounded-full px-4 py-2.5 text-sm text-white placeholder:text-white/40 font-body focus:outline-none focus:ring-2 focus:ring-lvl-yellow/50"
          aria-label="Chat message input"
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={inputValue.trim().length === 0}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-lvl-yellow text-lvl-black shrink-0 hover:bg-lvl-yellow/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Send message"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}

export { ChatOverlay, type ChatOverlayProps };

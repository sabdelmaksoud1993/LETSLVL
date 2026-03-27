"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import {
  fetchChatMessages,
  subscribeToChatMessages,
  sendChatMessage,
} from "@/lib/realtime";
import type { ChatMessage } from "@/types/database";

interface ChatOverlayProps {
  streamId: string;
}

function formatChatTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function ChatOverlay({ streamId }: ChatOverlayProps) {
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState<readonly ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load initial messages and subscribe to new ones
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    async function init() {
      setLoading(true);
      const initial = await fetchChatMessages(streamId);
      setMessages(initial);
      setLoading(false);

      // Subscribe to new messages
      unsubscribe = subscribeToChatMessages(streamId, (newMsg) => {
        setMessages((prev) => [...prev, newMsg]);
      });
    }

    init();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [streamId]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    const container = scrollRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages]);

  const handleSend = useCallback(async () => {
    const trimmed = inputValue.trim();
    if (trimmed.length === 0 || !user) return;

    setSending(true);
    setInputValue("");

    try {
      await sendChatMessage(streamId, user.id, trimmed);
    } catch (err) {
      console.error("Failed to send message:", err);
      // Restore input on failure
      setInputValue(trimmed);
    } finally {
      setSending(false);
    }
  }, [inputValue, streamId, user]);

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
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 size={20} className="animate-spin text-lvl-smoke" />
          </div>
        ) : messages.length === 0 ? (
          <p className="text-center text-white/40 text-sm font-body py-8">
            No messages yet. Be the first to chat!
          </p>
        ) : (
          messages.map((msg) => (
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
          ))
        )}
      </div>

      {/* Input */}
      <div className="mt-2 flex items-center gap-2">
        {user ? (
          <>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Say something..."
              disabled={sending}
              className="flex-1 bg-lvl-slate rounded-full px-4 py-2.5 text-sm text-white placeholder:text-white/40 font-body focus:outline-none focus:ring-2 focus:ring-lvl-yellow/50 disabled:opacity-60"
              aria-label="Chat message input"
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={inputValue.trim().length === 0 || sending}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-lvl-yellow text-lvl-black shrink-0 hover:bg-lvl-yellow/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Send message"
            >
              {sending ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Send size={18} />
              )}
            </button>
          </>
        ) : (
          <div className="flex-1 bg-lvl-slate/50 rounded-full px-4 py-2.5 text-center">
            <a
              href="/auth/login"
              className="text-sm text-lvl-yellow font-body font-semibold hover:underline"
            >
              Sign in to chat
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export { ChatOverlay, type ChatOverlayProps };

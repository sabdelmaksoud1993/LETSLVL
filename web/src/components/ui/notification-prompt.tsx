"use client";

import { useState, useEffect, useCallback } from "react";
import { Bell, X } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import {
  requestNotificationPermission,
  subscribeToNotifications,
} from "@/lib/notifications";

const DISMISSED_KEY = "lvl_notif_dismissed";

export function NotificationPrompt() {
  const { user } = useAuth();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Only show if notifications are supported, permission is default (not
    // yet decided), and the user hasn't previously dismissed the banner.
    if (typeof window === "undefined") return;
    if (!("Notification" in window)) return;
    if (Notification.permission !== "default") return;
    if (localStorage.getItem(DISMISSED_KEY) === "true") return;

    setVisible(true);
  }, []);

  const handleEnable = useCallback(async () => {
    const granted = await requestNotificationPermission();
    if (granted && user?.id) {
      await subscribeToNotifications(user.id);
    }
    setVisible(false);
    localStorage.setItem(DISMISSED_KEY, "true");
  }, [user]);

  const handleDismiss = useCallback(() => {
    setVisible(false);
    localStorage.setItem(DISMISSED_KEY, "true");
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-16 inset-x-0 z-50 px-4 pb-2 sm:bottom-0">
      <div className="bg-lvl-carbon border-t border-lvl-slate rounded-xl p-4 flex items-center gap-3 max-w-lg mx-auto shadow-lg">
        <div className="w-9 h-9 rounded-lg bg-lvl-yellow/10 flex items-center justify-center shrink-0">
          <Bell className="w-5 h-5 text-lvl-yellow" />
        </div>

        <p className="text-sm font-body text-lvl-smoke flex-1">
          Enable notifications to get alerts for live drops, auctions, and
          orders
        </p>

        <button
          type="button"
          onClick={handleEnable}
          className="bg-lvl-yellow text-lvl-black font-display uppercase tracking-widest text-xs font-bold py-2 px-4 rounded-lg hover:opacity-90 transition-opacity shrink-0"
        >
          Enable
        </button>

        <button
          type="button"
          onClick={handleDismiss}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-lvl-slate/50 transition-colors shrink-0"
          aria-label="Dismiss notification prompt"
        >
          <X className="w-4 h-4 text-lvl-smoke" />
        </button>
      </div>
    </div>
  );
}

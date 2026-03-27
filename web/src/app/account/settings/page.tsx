"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Camera,
  Plus,
  MapPin,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Address {
  readonly id: string;
  readonly label: string;
  readonly line: string;
  readonly city: string;
  readonly country: string;
}

const MOCK_ADDRESSES: readonly Address[] = [
  {
    id: "addr-1",
    label: "Home",
    line: "Villa 42, Jumeirah Beach Residence",
    city: "Dubai",
    country: "UAE",
  },
  {
    id: "addr-2",
    label: "Office",
    line: "DIFC Gate Building, Floor 12",
    city: "Dubai",
    country: "UAE",
  },
];

export default function SettingsPage() {
  const [profile, setProfile] = useState({
    name: "Ahmed Al Maktoum",
    email: "ahmed@letslvl.com",
    phone: "+971 50 123 4567",
  });
  const [language, setLanguage] = useState<"en" | "ar">("en");
  const [notifications, setNotifications] = useState({
    push: true,
    email: true,
    whatsapp: false,
    liveAlerts: true,
  });
  const [isSaving, setIsSaving] = useState(false);

  const updateProfile = <K extends keyof typeof profile>(
    key: K,
    value: string
  ) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
  };

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    setIsSaving(true);
    // TODO: Save to API
    setTimeout(() => setIsSaving(false), 1200);
  };

  const inputClass =
    "w-full bg-lvl-carbon border border-lvl-slate rounded-lg py-3 px-4 text-lvl-white placeholder:text-lvl-smoke/50 font-body text-sm focus:outline-none focus:border-lvl-yellow transition-colors";

  return (
    <div className="min-h-screen bg-lvl-black px-4 py-8 max-w-2xl mx-auto">
      {/* Back */}
      <Link
        href="/account"
        className="inline-flex items-center gap-2 text-lvl-smoke hover:text-lvl-white transition-colors mb-6 font-body text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Account
      </Link>

      <h1 className="font-display text-3xl font-bold tracking-wider mb-8">
        <span className="text-lvl-yellow">SETTINGS</span>
      </h1>

      {/* ---- Profile Section ---- */}
      <section className="mb-8">
        <h2 className="font-display text-lg font-bold tracking-wide mb-4">
          Profile
        </h2>
        <div className="bg-lvl-carbon rounded-xl p-5 space-y-5">
          {/* Avatar upload */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-lvl-slate flex items-center justify-center text-3xl font-display font-bold text-lvl-yellow">
                {profile.name.charAt(0)}
              </div>
              <button
                type="button"
                className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-lvl-yellow flex items-center justify-center"
                aria-label="Upload avatar"
              >
                <Camera className="w-4 h-4 text-lvl-black" />
              </button>
            </div>
            <div>
              <p className="text-sm text-lvl-smoke font-body">
                Tap to upload a new photo
              </p>
              <p className="text-xs text-lvl-smoke/60 font-body mt-0.5">
                JPG or PNG, max 2 MB
              </p>
            </div>
          </div>

          {/* Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-body text-lvl-smoke mb-1.5"
            >
              Full Name
            </label>
            <input
              id="name"
              type="text"
              value={profile.name}
              onChange={(e) => updateProfile("name", e.target.value)}
              className={inputClass}
            />
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="settings-email"
              className="block text-sm font-body text-lvl-smoke mb-1.5"
            >
              Email
            </label>
            <input
              id="settings-email"
              type="email"
              value={profile.email}
              onChange={(e) => updateProfile("email", e.target.value)}
              className={inputClass}
            />
          </div>

          {/* Phone */}
          <div>
            <label
              htmlFor="settings-phone"
              className="block text-sm font-body text-lvl-smoke mb-1.5"
            >
              Phone
            </label>
            <input
              id="settings-phone"
              type="tel"
              value={profile.phone}
              onChange={(e) => updateProfile("phone", e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
      </section>

      {/* ---- Address Book ---- */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-bold tracking-wide">
            Address Book
          </h2>
          <button
            type="button"
            className="flex items-center gap-1.5 text-lvl-yellow text-sm font-body hover:underline"
          >
            <Plus className="w-4 h-4" />
            Add Address
          </button>
        </div>
        <div className="space-y-3">
          {MOCK_ADDRESSES.map((addr) => (
            <div
              key={addr.id}
              className="bg-lvl-carbon rounded-xl p-4 flex items-start gap-3"
            >
              <MapPin className="w-5 h-5 text-lvl-yellow shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="font-display text-sm font-bold tracking-wide">
                  {addr.label}
                </p>
                <p className="text-lvl-smoke text-xs font-body mt-0.5">
                  {addr.line}, {addr.city}, {addr.country}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---- Language ---- */}
      <section className="mb-8">
        <h2 className="font-display text-lg font-bold tracking-wide mb-4">
          Language
        </h2>
        <div className="bg-lvl-carbon rounded-xl p-4 flex gap-3">
          {(["en", "ar"] as const).map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => setLanguage(lang)}
              className={cn(
                "flex-1 py-2.5 rounded-lg font-body text-sm font-medium transition-colors",
                language === lang
                  ? "bg-lvl-yellow text-lvl-black"
                  : "bg-lvl-slate text-lvl-smoke hover:text-lvl-white"
              )}
            >
              {lang === "en" ? "English" : "Arabic"}
            </button>
          ))}
        </div>
      </section>

      {/* ---- Notifications ---- */}
      <section className="mb-10">
        <h2 className="font-display text-lg font-bold tracking-wide mb-4">
          Notifications
        </h2>
        <div className="bg-lvl-carbon rounded-xl divide-y divide-lvl-slate/40">
          {(
            [
              { key: "push", label: "Push Notifications" },
              { key: "email", label: "Email Notifications" },
              { key: "whatsapp", label: "WhatsApp Updates" },
              { key: "liveAlerts", label: "Live Stream Alerts" },
            ] as const
          ).map(({ key, label }) => (
            <label
              key={key}
              className="flex items-center justify-between p-4 cursor-pointer"
            >
              <span className="text-sm font-body">{label}</span>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={notifications[key]}
                  onChange={() => toggleNotification(key)}
                  className="sr-only peer"
                />
                <div className="w-10 h-6 rounded-full bg-lvl-slate peer-checked:bg-lvl-yellow transition-colors" />
                <div className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform peer-checked:translate-x-4" />
              </div>
            </label>
          ))}
        </div>
      </section>

      {/* ---- Action Buttons ---- */}
      <div className="space-y-3 pb-8">
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className={cn(
            "w-full bg-lvl-yellow text-lvl-black font-display text-lg uppercase tracking-widest py-3 rounded-lg font-bold transition-opacity",
            isSaving ? "opacity-60 cursor-not-allowed" : "hover:opacity-90"
          )}
        >
          {isSaving ? "SAVING..." : "SAVE CHANGES"}
        </button>

        <button
          type="button"
          className="w-full border border-lvl-error text-lvl-error font-display text-sm uppercase tracking-widest py-3 rounded-lg font-bold hover:bg-lvl-error/10 transition-colors flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          SIGN OUT
        </button>
      </div>
    </div>
  );
}

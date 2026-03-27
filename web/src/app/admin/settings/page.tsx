"use client";

import { useEffect, useState, useCallback } from "react";
import { Save, Globe, Truck, CreditCard, Percent, Radio } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface PlatformSettings {
  readonly liveAuctions: boolean;
  readonly codEnabled: boolean;
  readonly tabbyBnpl: boolean;
  readonly commissionRate: number;
  readonly shippingRegions: Record<string, boolean>;
  readonly freeShippingThreshold: number;
}

const DEFAULT_SETTINGS: PlatformSettings = {
  liveAuctions: true,
  codEnabled: true,
  tabbyBnpl: true,
  commissionRate: 10,
  shippingRegions: {
    UAE: true,
    KSA: true,
    Kuwait: true,
    Oman: false,
    Bahrain: false,
    Qatar: false,
  },
  freeShippingThreshold: 200,
};

const STORAGE_KEY = "lvl_admin_settings";

/* ------------------------------------------------------------------ */
/*  Toggle Component                                                   */
/* ------------------------------------------------------------------ */

function Toggle({
  label,
  description,
  enabled,
  onChange,
  icon: Icon,
}: {
  readonly label: string;
  readonly description: string;
  readonly enabled: boolean;
  readonly onChange: (val: boolean) => void;
  readonly icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-4 border-b border-lvl-slate/20 last:border-0">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-lvl-slate/30 flex items-center justify-center shrink-0 mt-0.5">
          <Icon className="w-4.5 h-4.5 text-lvl-smoke" />
        </div>
        <div>
          <p className="font-body text-sm font-medium text-lvl-white">
            {label}
          </p>
          <p className="font-body text-xs text-lvl-smoke mt-0.5">
            {description}
          </p>
        </div>
      </div>
      <button
        role="switch"
        aria-checked={enabled}
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 ${
          enabled ? "bg-lvl-yellow" : "bg-lvl-slate"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            enabled ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page Component                                                     */
/* ------------------------------------------------------------------ */

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<PlatformSettings>(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as PlatformSettings;
        setSettings(parsed);
      }
    } catch {
      // Use defaults
    }
  }, []);

  const updateSetting = useCallback(
    <K extends keyof PlatformSettings>(key: K, value: PlatformSettings[K]) => {
      setSettings((prev) => ({ ...prev, [key]: value }));
      setSaved(false);
    },
    []
  );

  const updateRegion = useCallback((region: string, checked: boolean) => {
    setSettings((prev) => ({
      ...prev,
      shippingRegions: { ...prev.shippingRegions, [region]: checked },
    }));
    setSaved(false);
  }, []);

  const handleSave = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      console.error("Failed to save settings");
    }
  }, [settings]);

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold text-lvl-white">
          Platform Settings
        </h1>
        <p className="font-body text-sm text-lvl-smoke mt-1">
          Manage platform configuration and feature toggles.
        </p>
      </div>

      {/* Platform Info */}
      <section className="bg-lvl-carbon rounded-xl border border-lvl-slate/30 p-6">
        <h2 className="font-display text-lg font-bold text-lvl-white mb-4">
          Platform Info
        </h2>
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
            <span className="font-body text-sm text-lvl-smoke w-36 shrink-0">
              Platform Name
            </span>
            <span className="font-body text-sm text-lvl-white font-medium">
              LET&apos;S LVL
            </span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
            <span className="font-body text-sm text-lvl-smoke w-36 shrink-0">
              Tagline
            </span>
            <span className="font-body text-sm text-lvl-white font-medium">
              Built for the Bold
            </span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
            <span className="font-body text-sm text-lvl-smoke w-36 shrink-0">
              Contact Email
            </span>
            <span className="font-body text-sm text-lvl-white font-medium">
              hello@letslvl.com
            </span>
          </div>
        </div>
      </section>

      {/* Feature Toggles */}
      <section className="bg-lvl-carbon rounded-xl border border-lvl-slate/30 p-6">
        <h2 className="font-display text-lg font-bold text-lvl-white mb-2">
          Feature Toggles
        </h2>
        <Toggle
          label="Live Auctions"
          description="Enable the live auction system for sellers to host real-time bidding events."
          enabled={settings.liveAuctions}
          onChange={(val) => updateSetting("liveAuctions", val)}
          icon={Radio}
        />
        <Toggle
          label="Cash on Delivery (COD)"
          description="Allow customers to pay with cash when their order is delivered."
          enabled={settings.codEnabled}
          onChange={(val) => updateSetting("codEnabled", val)}
          icon={CreditCard}
        />
        <Toggle
          label="Tabby Buy Now, Pay Later"
          description="Enable Tabby BNPL as a payment option at checkout."
          enabled={settings.tabbyBnpl}
          onChange={(val) => updateSetting("tabbyBnpl", val)}
          icon={CreditCard}
        />
      </section>

      {/* Commission Rate */}
      <section className="bg-lvl-carbon rounded-xl border border-lvl-slate/30 p-6">
        <h2 className="font-display text-lg font-bold text-lvl-white mb-4 flex items-center gap-2">
          <Percent className="w-5 h-5 text-lvl-yellow" />
          Commission Rate
        </h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-body text-sm text-lvl-smoke">
              Platform commission on each sale
            </span>
            <span className="font-display text-xl font-bold text-lvl-yellow">
              {settings.commissionRate}%
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={30}
            step={1}
            value={settings.commissionRate}
            onChange={(e) =>
              updateSetting("commissionRate", Number(e.target.value))
            }
            className="w-full h-2 rounded-full appearance-none cursor-pointer bg-lvl-slate accent-lvl-yellow"
          />
          <div className="flex justify-between font-body text-xs text-lvl-smoke">
            <span>0%</span>
            <span>15%</span>
            <span>30%</span>
          </div>
        </div>
      </section>

      {/* Shipping Regions */}
      <section className="bg-lvl-carbon rounded-xl border border-lvl-slate/30 p-6">
        <h2 className="font-display text-lg font-bold text-lvl-white mb-4 flex items-center gap-2">
          <Globe className="w-5 h-5 text-lvl-yellow" />
          Shipping Regions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {Object.entries(settings.shippingRegions).map(
            ([region, enabled]) => (
              <label
                key={region}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg border cursor-pointer transition-colors ${
                  enabled
                    ? "bg-lvl-yellow/5 border-lvl-yellow/30"
                    : "bg-lvl-slate/10 border-lvl-slate/30 hover:border-lvl-slate/50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={(e) => updateRegion(region, e.target.checked)}
                  className="w-4 h-4 rounded border-lvl-slate accent-lvl-yellow"
                />
                <span
                  className={`font-body text-sm ${
                    enabled ? "text-lvl-white font-medium" : "text-lvl-smoke"
                  }`}
                >
                  {region}
                </span>
              </label>
            )
          )}
        </div>
      </section>

      {/* Free Shipping Threshold */}
      <section className="bg-lvl-carbon rounded-xl border border-lvl-slate/30 p-6">
        <h2 className="font-display text-lg font-bold text-lvl-white mb-4 flex items-center gap-2">
          <Truck className="w-5 h-5 text-lvl-yellow" />
          Free Shipping Threshold
        </h2>
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <input
              type="number"
              value={settings.freeShippingThreshold}
              onChange={(e) =>
                updateSetting(
                  "freeShippingThreshold",
                  Math.max(0, Number(e.target.value))
                )
              }
              className="w-full bg-lvl-black border border-lvl-slate/30 rounded-lg px-4 py-2.5 text-sm font-body text-lvl-white pr-14 focus:outline-none focus:ring-2 focus:ring-lvl-yellow focus:border-transparent"
              min={0}
              step={10}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 font-body text-sm text-lvl-smoke">
              AED
            </span>
          </div>
          <p className="font-body text-xs text-lvl-smoke">
            Orders above this amount get free shipping.
          </p>
        </div>
      </section>

      {/* Save Button */}
      <div className="flex items-center gap-4 pt-2">
        <button
          onClick={handleSave}
          className="inline-flex items-center gap-2 px-8 py-3 bg-lvl-yellow text-lvl-black font-display font-bold text-sm uppercase tracking-wider rounded-lg hover:bg-lvl-yellow/90 active:bg-lvl-yellow/80 transition-colors"
        >
          <Save className="w-4 h-4" />
          Save Settings
        </button>
        {saved && (
          <span className="font-body text-sm text-green-400 animate-pulse">
            Settings saved successfully!
          </span>
        )}
      </div>
    </div>
  );
}

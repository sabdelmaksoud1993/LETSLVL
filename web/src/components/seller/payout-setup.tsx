"use client";

import { useState, useEffect, useCallback } from "react";
import {
  CheckCircle,
  Loader2,
  CreditCard,
  Wallet,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

type ConnectStatus = "idle" | "not_connected" | "pending" | "connected";

interface AccountStatus {
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
}

export function PayoutSetup() {
  const { user, profile } = useAuth();
  const [status, setStatus] = useState<ConnectStatus>("idle");
  const [accountId, setAccountId] = useState<string | null>(null);
  const [accountStatus, setAccountStatus] = useState<AccountStatus | null>(
    null
  );
  const [loading, setLoading] = useState(false);

  // Check for connect query params on mount (return from Stripe onboarding)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const connect = params.get("connect");
    const acct = params.get("account");

    if (connect === "success" && acct) {
      setAccountId(acct);
      localStorage.setItem("lvl_stripe_account", acct);
      setStatus("connected");
    } else if (connect === "mock") {
      const mockId = "mock_acct_" + Date.now();
      setAccountId(mockId);
      localStorage.setItem("lvl_stripe_account", mockId);
      setStatus("connected");
    }
  }, []);

  // Check stored account on mount
  useEffect(() => {
    const storedAccount = localStorage.getItem("lvl_stripe_account");
    if (storedAccount) {
      setAccountId(storedAccount);
      checkAccountStatus(storedAccount);
    } else {
      setStatus("not_connected");
    }
  }, []);

  const checkAccountStatus = useCallback(async (acctId: string) => {
    try {
      const res = await fetch(
        `/api/stripe-connect/status?accountId=${encodeURIComponent(acctId)}`
      );
      if (!res.ok) {
        setStatus("not_connected");
        return;
      }
      const data: AccountStatus & { mode: string } = await res.json();
      setAccountStatus(data);

      if (data.payoutsEnabled && data.detailsSubmitted) {
        setStatus("connected");
      } else if (data.detailsSubmitted) {
        setStatus("pending");
      } else {
        setStatus("not_connected");
      }
    } catch {
      setStatus("not_connected");
    }
  }, []);

  const handleConnect = useCallback(async () => {
    if (!user?.email) return;
    setLoading(true);

    try {
      const res = await fetch("/api/stripe-connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sellerId: user.id,
          email: user.email,
        }),
      });

      if (!res.ok) {
        console.error("Stripe Connect onboarding failed");
        setLoading(false);
        return;
      }

      const data = await res.json();

      if (data.mode === "development") {
        // Mock mode: simulate successful connection
        setAccountId(data.accountId);
        localStorage.setItem("lvl_stripe_account", data.accountId);
        setStatus("connected");
        setAccountStatus({
          chargesEnabled: true,
          payoutsEnabled: true,
          detailsSubmitted: true,
        });
        setLoading(false);
      } else {
        // Production: redirect to Stripe onboarding
        window.location.href = data.url;
      }
    } catch (err) {
      console.error("Error starting Stripe Connect:", err);
      setLoading(false);
    }
  }, [user]);

  if (status === "idle") {
    return (
      <div className="bg-lvl-carbon rounded-xl p-6 flex items-center justify-center h-32">
        <Loader2 className="w-5 h-5 text-lvl-smoke animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-lvl-carbon rounded-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-lvl-yellow/10 flex items-center justify-center shrink-0">
          <Wallet className="w-5 h-5 text-lvl-yellow" />
        </div>
        <div>
          <h3 className="font-display text-lg font-bold tracking-wide">
            Payouts
          </h3>
          <p className="text-lvl-smoke text-xs font-body">
            Receive earnings from your sales
          </p>
        </div>
      </div>

      {status === "not_connected" && (
        <div className="space-y-4">
          <div className="flex items-start gap-3 text-lvl-smoke">
            <CreditCard className="w-5 h-5 mt-0.5 shrink-0" />
            <p className="text-sm font-body">
              Set up payouts to receive money from your sales. We use Stripe
              to securely process all payments.
            </p>
          </div>
          <button
            type="button"
            onClick={handleConnect}
            disabled={loading}
            className="w-full bg-lvl-yellow text-lvl-black font-display uppercase tracking-widest text-sm font-bold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Connecting...
              </>
            ) : (
              "Connect with Stripe"
            )}
          </button>
        </div>
      )}

      {status === "pending" && (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-lvl-yellow/10 border border-lvl-yellow/20">
          <Loader2 className="w-5 h-5 text-lvl-yellow animate-spin shrink-0" />
          <div>
            <p className="text-sm font-body font-medium text-lvl-yellow">
              Verification in progress
            </p>
            <p className="text-xs font-body text-lvl-smoke mt-0.5">
              Stripe is reviewing your information. This usually takes 1-2
              business days.
            </p>
          </div>
        </div>
      )}

      {status === "connected" && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
            <CheckCircle className="w-5 h-5 text-green-400 shrink-0" />
            <div>
              <p className="text-sm font-body font-medium text-green-400">
                Payouts enabled
              </p>
              <p className="text-xs font-body text-lvl-smoke mt-0.5">
                Your account is verified and can receive payments
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-lvl-slate/30">
            <div>
              <p className="text-xs font-body text-lvl-smoke">Available</p>
              <p className="font-display text-2xl font-bold">2,450 AED</p>
            </div>
            <button
              type="button"
              className="bg-lvl-yellow text-lvl-black font-display uppercase tracking-widest text-xs font-bold py-2.5 px-5 rounded-lg hover:opacity-90 transition-opacity"
            >
              Request Payout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

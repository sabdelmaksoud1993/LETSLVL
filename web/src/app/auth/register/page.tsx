"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock, User, Phone, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

const COUNTRIES = [
  { code: "AE", name: "UAE", dial: "+971" },
  { code: "SA", name: "Saudi Arabia", dial: "+966" },
  { code: "KW", name: "Kuwait", dial: "+965" },
  { code: "OM", name: "Oman", dial: "+968" },
  { code: "BH", name: "Bahrain", dial: "+973" },
  { code: "QA", name: "Qatar", dial: "+974" },
] as const;

export default function RegisterPage() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    country: "AE",
    agreeTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const updateField = <K extends keyof typeof form>(
    key: K,
    value: (typeof form)[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const passwordsMatch =
    form.confirmPassword.length === 0 ||
    form.password === form.confirmPassword;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.agreeTerms || !passwordsMatch) return;
    setIsLoading(true);
    // TODO: Integrate with auth provider
    setTimeout(() => setIsLoading(false), 1500);
  };

  const inputClass =
    "w-full bg-lvl-carbon border border-lvl-slate rounded-lg py-3 pl-10 pr-4 text-lvl-white placeholder:text-lvl-smoke/50 font-body text-sm focus:outline-none focus:border-lvl-yellow transition-colors";

  return (
    <div className="min-h-screen bg-lvl-black flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl font-bold tracking-wider">
            LET&apos;S <span className="text-lvl-yellow">LVL</span>
          </h1>
          <p className="text-lvl-smoke text-sm mt-2 font-body">
            Create your account
          </p>
        </div>

        {/* Card */}
        <div className="bg-lvl-carbon rounded-2xl p-8 border border-lvl-slate/30">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label
                htmlFor="fullName"
                className="block text-sm font-body text-lvl-smoke mb-1.5"
              >
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-lvl-smoke" />
                <input
                  id="fullName"
                  type="text"
                  required
                  value={form.fullName}
                  onChange={(e) => updateField("fullName", e.target.value)}
                  placeholder="Your full name"
                  className={inputClass}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-body text-lvl-smoke mb-1.5"
              >
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-lvl-smoke" />
                <input
                  id="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  placeholder="you@example.com"
                  className={inputClass}
                />
              </div>
            </div>

            {/* Country Selector */}
            <div>
              <label
                htmlFor="country"
                className="block text-sm font-body text-lvl-smoke mb-1.5"
              >
                Country
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-lvl-smoke" />
                <select
                  id="country"
                  value={form.country}
                  onChange={(e) => updateField("country", e.target.value)}
                  className="w-full bg-lvl-carbon border border-lvl-slate rounded-lg py-3 pl-10 pr-4 text-lvl-white font-body text-sm focus:outline-none focus:border-lvl-yellow transition-colors appearance-none"
                >
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Phone */}
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-body text-lvl-smoke mb-1.5"
              >
                Phone
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-lvl-smoke" />
                <input
                  id="phone"
                  type="tel"
                  required
                  value={form.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  placeholder={
                    COUNTRIES.find((c) => c.code === form.country)?.dial ??
                    "+971"
                  }
                  className={inputClass}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-body text-lvl-smoke mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-lvl-smoke" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  value={form.password}
                  onChange={(e) => updateField("password", e.target.value)}
                  placeholder="Min 8 characters"
                  className={cn(inputClass, "pr-12")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-lvl-smoke hover:text-lvl-white transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-body text-lvl-smoke mb-1.5"
              >
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-lvl-smoke" />
                <input
                  id="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  required
                  value={form.confirmPassword}
                  onChange={(e) =>
                    updateField("confirmPassword", e.target.value)
                  }
                  placeholder="Re-enter your password"
                  className={cn(
                    inputClass,
                    "pr-12",
                    !passwordsMatch && "border-lvl-error"
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-lvl-smoke hover:text-lvl-white transition-colors"
                  aria-label={
                    showConfirm ? "Hide password" : "Show password"
                  }
                >
                  {showConfirm ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {!passwordsMatch && (
                <p className="text-lvl-error text-xs mt-1 font-body">
                  Passwords do not match
                </p>
              )}
            </div>

            {/* Terms */}
            <label className="flex items-start gap-3 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={form.agreeTerms}
                onChange={(e) => updateField("agreeTerms", e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-lvl-slate bg-lvl-carbon accent-lvl-yellow"
              />
              <span className="text-sm text-lvl-smoke font-body leading-snug">
                I agree to the{" "}
                <Link
                  href="/terms"
                  className="text-lvl-yellow hover:underline"
                >
                  Terms &amp; Conditions
                </Link>
              </span>
            </label>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading || !form.agreeTerms}
              className={cn(
                "w-full bg-lvl-yellow text-lvl-black font-display text-lg uppercase tracking-widest py-3 rounded-lg font-bold transition-opacity mt-2",
                isLoading || !form.agreeTerms
                  ? "opacity-60 cursor-not-allowed"
                  : "hover:opacity-90"
              )}
            >
              {isLoading ? "CREATING..." : "CREATE ACCOUNT"}
            </button>
          </form>
        </div>

        {/* Login link */}
        <p className="text-center mt-6 text-lvl-smoke font-body text-sm">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="text-lvl-yellow font-semibold hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

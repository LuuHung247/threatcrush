"use client";

import { useState, useEffect } from "react";

type PaymentMethod = "stripe" | "crypto" | null;

export default function WaitlistModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [email, setEmail] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(null);
  const [referralCode, setReferralCode] = useState("");
  const [signedUp, setSignedUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [payLoading, setPayLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [result, setResult] = useState<{
    referral_code?: string;
    price?: number;
    discount?: boolean;
    existing?: boolean;
    payment?: { address?: string; checkout_url?: string; amount_usd?: number };
  } | null>(null);

  // Check URL for referral code
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get("ref");
      if (ref) setReferralCode(ref);
    }
  }, []);

  if (!open) return null;

  const price = referralCode ? 249 : 499;

  // Step 1: Email-only signup
  const handleSignup = async () => {
    if (!email) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          referral_code: referralCode || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        // If already purchased, still show referral code
        if (data.paid && data.referral_code) {
          setResult({ referral_code: data.referral_code });
          setSignedUp(true);
          return;
        }
        throw new Error(data.error || "Something went wrong");
      }

      setResult(data);
      setSignedUp(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Initiate payment
  const handlePay = async () => {
    if (!paymentMethod) return;
    setPayLoading(true);
    setError("");

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          payment_method: paymentMethod,
          referral_code: referralCode || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      // Redirect to checkout if available
      if (data.payment?.checkout_url) {
        window.location.href = data.payment.checkout_url;
        return;
      }

      // Show crypto address if available
      if (data.payment?.address) {
        setResult((prev) => ({ ...prev, payment: data.payment }));
        return;
      }

      // Fallback message
      setError(data.message || "Payment method coming soon.");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setPayLoading(false);
    }
  };

  const handleClose = () => {
    setEmail("");
    setPaymentMethod(null);
    setSignedUp(false);
    setError("");
    setResult(null);
    setCopied(false);
    onClose();
  };

  const copyReferralLink = () => {
    if (result?.referral_code) {
      const link = `${window.location.origin}?ref=${result.referral_code}`;
      navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={handleClose}
      />

      <div className="relative w-full max-w-md rounded-2xl border border-tc-border bg-tc-card p-8 max-h-[90vh] overflow-y-auto">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-tc-text-dim hover:text-tc-text transition-colors"
        >
          ✕
        </button>

        {signedUp ? (
          <div>
            {/* Success header */}
            <div className="text-center mb-6">
              <div className="text-5xl mb-4">🔒</div>
              <h3 className="text-2xl font-bold text-tc-green glow-green mb-2">
                {result?.existing ? "Welcome Back!" : "You're In!"}
              </h3>
              <p className="text-tc-text-dim text-sm">
                {result?.existing
                  ? "Your spot is saved. Here's your referral link."
                  : "Your spot on the waitlist is secured."}
              </p>
            </div>

            {/* Referral sharing */}
            {result?.referral_code && (
              <div className="p-4 border border-tc-green/20 rounded-lg bg-tc-green/5 mb-6">
                <p className="text-sm text-tc-green font-medium mb-2">
                  🎁 Share & Save — Both get lifetime for $249
                </p>
                <div className="flex gap-2">
                  <input
                    readOnly
                    value={`${typeof window !== "undefined" ? window.location.origin : ""}?ref=${result.referral_code}`}
                    className="flex-1 bg-tc-darker border border-tc-border rounded px-3 py-2 text-xs font-mono text-tc-text"
                  />
                  <button
                    onClick={copyReferralLink}
                    className="px-3 py-2 rounded bg-tc-green/10 text-tc-green text-xs font-medium hover:bg-tc-green/20 transition-colors"
                  >
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>
            )}

            {/* Crypto address if shown */}
            {result?.payment?.address && (
              <div className="mb-6 p-4 border border-tc-border rounded-lg">
                <p className="text-tc-text-dim text-sm mb-3">
                  Send <strong className="text-tc-green">${result.payment.amount_usd} USDC</strong> to:
                </p>
                <code className="block bg-tc-darker border border-tc-border rounded-lg p-3 text-xs text-tc-green font-mono break-all select-all">
                  {result.payment.address}
                </code>
              </div>
            )}

            {/* Payment section (Step 2) */}
            {!result?.payment?.address && (
              <div className="border-t border-tc-border pt-6">
                <h4 className="text-sm font-medium text-tc-text-dim mb-1">
                  Ready to pay? Choose payment method below
                </h4>
                <p className="text-xs text-tc-text-dim/60 mb-4">
                  Optional — your spot and referral code are saved. You can pay later.
                </p>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <button
                    onClick={() => setPaymentMethod("stripe")}
                    className={`rounded-lg border p-3 text-center transition-all ${
                      paymentMethod === "stripe"
                        ? "border-tc-green bg-tc-green/5 text-tc-green"
                        : "border-tc-border text-tc-text-dim hover:border-tc-green/30 hover:text-tc-text"
                    }`}
                  >
                    <div className="text-lg mb-0.5">💳</div>
                    <div className="text-sm font-medium">Card</div>
                    <div className="text-xs opacity-60">Stripe</div>
                  </button>
                  <button
                    onClick={() => setPaymentMethod("crypto")}
                    className={`rounded-lg border p-3 text-center transition-all ${
                      paymentMethod === "crypto"
                        ? "border-tc-green bg-tc-green/5 text-tc-green"
                        : "border-tc-border text-tc-text-dim hover:border-tc-green/30 hover:text-tc-text"
                    }`}
                  >
                    <div className="text-lg mb-0.5">₿</div>
                    <div className="text-sm font-medium">Crypto</div>
                    <div className="text-xs opacity-60">CoinPayPortal</div>
                  </button>
                </div>

                {error && (
                  <p className="text-red-400 text-sm mb-4">{error}</p>
                )}

                <button
                  onClick={handlePay}
                  disabled={!paymentMethod || payLoading}
                  className="w-full rounded-lg bg-tc-green px-6 py-3 font-bold text-black transition-all hover:bg-tc-green-dim disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {payLoading ? "Processing..." : `Complete Payment — $${result?.price || price}`}
                </button>
              </div>
            )}

            <button
              onClick={handleClose}
              className="mt-6 w-full px-6 py-2 rounded-lg border border-tc-border text-tc-text-dim hover:text-tc-text hover:border-tc-green/30 transition-all text-sm"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-tc-green glow-green mb-1">
                Join the Waitlist
              </h3>
              {referralCode ? (
                <div>
                  <p className="text-tc-green text-sm font-medium">
                    🎁 Referral discount applied!
                  </p>
                  <p className="text-tc-text-dim text-sm">
                    <span className="line-through text-tc-text-dim/50">$499</span>{" "}
                    <span className="text-tc-green font-bold">$249</span> one-time — access forever.
                  </p>
                </div>
              ) : (
                <p className="text-tc-text-dim text-sm">
                  Secure your spot. Pay later when you&apos;re ready.
                </p>
              )}
            </div>

            {/* Email */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-tc-text-dim mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operator@example.com"
                onKeyDown={(e) => e.key === "Enter" && handleSignup()}
                className="w-full rounded-lg border border-tc-border bg-tc-darker px-4 py-3 text-tc-text placeholder:text-tc-text-dim/50 focus:border-tc-green/50 focus:outline-none focus:ring-1 focus:ring-tc-green/30 transition-all font-mono text-sm"
              />
            </div>

            {/* Referral Code Input (if not from URL) */}
            {!referralCode && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-tc-text-dim mb-1.5">
                  Referral Code <span className="text-tc-text-dim/50">(optional — saves $250)</span>
                </label>
                <input
                  type="text"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value)}
                  placeholder="Enter code"
                  className="w-full rounded-lg border border-tc-border bg-tc-darker px-4 py-3 text-tc-text placeholder:text-tc-text-dim/50 focus:border-tc-green/50 focus:outline-none focus:ring-1 focus:ring-tc-green/30 transition-all font-mono text-sm"
                />
              </div>
            )}

            {error && (
              <p className="text-red-400 text-sm mb-4">{error}</p>
            )}

            <button
              onClick={handleSignup}
              disabled={!email || loading}
              className="w-full rounded-lg bg-tc-green px-6 py-3 font-bold text-black transition-all hover:bg-tc-green-dim disabled:opacity-40 disabled:cursor-not-allowed pulse-glow"
            >
              {loading ? "Securing your spot..." : "Join Waitlist →"}
            </button>

            <p className="text-center text-xs text-tc-text-dim mt-3">
              🔒 No payment required. Get your referral link instantly.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

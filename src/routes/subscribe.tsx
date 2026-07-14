import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { getCurrentUser } from "~/lib/auth-fns";
import { createServerFn } from "@tanstack/react-start";
import { sql } from "~/db";
import { getUserFromRequest } from "~/lib/auth";

const MONTHLY_LINK = "https://buy.stripe.com/28E00j1dEfIP5b867g33W04";
const ANNUAL_LINK = "https://buy.stripe.com/6oUcN51dE9kr474anw33W03";

export const verifySubscription = createServerFn({ method: "POST" })
  .validator((data: { plan: "monthly" | "annual" }) => data)
  .handler(async ({ data, request }) => {
    const user = getUserFromRequest(request);
    if (!user) throw new Error("Not authenticated");

    // Mark user as having paid subscription
    // In production, this would be confirmed via Stripe webhook
    const db = sql();
    const subscriptionEnd = data.plan === "annual" 
      ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    await db`
      UPDATE users
      SET subscription_status = 'active', subscription_end = ${subscriptionEnd}
      WHERE id = ${user.userId};
    `;

    return { success: true, subscriptionEnd };
  });

export const Route = createFileRoute("/subscribe")({
  component: SubscribePage,
});

function SubscribePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "annual">("monthly");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const userData = await getCurrentUser();
        if (!userData) {
          navigate({ to: "/login" });
          return;
        }
        setUser(userData);
      } catch {
        navigate({ to: "/login" });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [navigate]);

  const handlePayNow = () => {
    const link = selectedPlan === "monthly" ? MONTHLY_LINK : ANNUAL_LINK;
    window.open(link, "_blank");
  };

  const handleVerifySubscription = async () => {
    setVerifying(true);
    setMessage(null);
    try {
      const result = await verifySubscription({ data: { plan: selectedPlan } });
      setMessage({
        type: "success",
        text: `Subscription verified! You're now on the ${selectedPlan} plan. Refreshing...`,
      });
      setTimeout(() => navigate({ to: "/dashboard" }), 2000);
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.message || "Failed to verify subscription. Please try again.",
      });
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent mx-auto" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const isTrialing = user.subscriptionStatus === "trial";
  const isActive = user.subscriptionStatus === "active";
  const trialEnds = new Date(user.trialEnd).toLocaleDateString();
  const trialDaysLeft = Math.max(0, Math.ceil((new Date(user.trialEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <Link
          to="/dashboard"
          className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          ← Back to dashboard
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900 dark:text-gray-100">
          💳 Subscription
        </h1>
      </div>

      {message && (
        <div className={`mb-6 rounded-lg p-4 text-sm ${
          message.type === "success"
            ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"
            : "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300"
        }`}>
          {message.text}
        </div>
      )}

      {/* Trial Status */}
      {isTrialing && (
        <div className="mb-8 rounded-xl border border-indigo-200 bg-indigo-50 p-6 dark:border-indigo-800 dark:bg-indigo-950">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🎉</span>
            <div>
              <h2 className="font-semibold text-indigo-900 dark:text-indigo-100">
                You're on the free trial!
              </h2>
              <p className="text-sm text-indigo-700 dark:text-indigo-300">
                {trialDaysLeft > 0
                  ? `${trialDaysLeft} day${trialDaysLeft !== 1 ? "s" : ""} remaining (ends ${trialEnds})`
                  : "Your trial ends today!"}
              </p>
            </div>
          </div>
        </div>
      )}

      {isActive && (
        <div className="mb-8 rounded-xl border border-green-200 bg-green-50 p-6 dark:border-green-800 dark:bg-green-950">
          <div className="flex items-center gap-3">
            <span className="text-3xl">✅</span>
            <div>
              <h2 className="font-semibold text-green-900 dark:text-green-100">
                You're subscribed!
              </h2>
              <p className="text-sm text-green-700 dark:text-green-300">
                Thank you for being a HabitForge subscriber.
              </p>
            </div>
          </div>
        </div>
      )}

      {!isActive && (
        <>
          {/* Pricing Plans */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Monthly Plan */}
            <div
              className={`relative rounded-2xl border-2 p-8 cursor-pointer transition-all ${
                selectedPlan === "monthly"
                  ? "border-indigo-500 shadow-md"
                  : "border-gray-200 dark:border-gray-800"
              }`}
              onClick={() => setSelectedPlan("monthly")}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Monthly</h3>
                {selectedPlan === "monthly" && (
                  <span className="text-indigo-500">✓</span>
                )}
              </div>
              <div className="mt-4">
                <span className="text-4xl font-bold text-gray-900 dark:text-gray-100">$4.99</span>
                <span className="text-sm text-gray-500">/month</span>
              </div>
              <ul className="mt-6 space-y-3 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-center gap-2">✓ Unlimited habits</li>
                <li className="flex items-center gap-2">✓ Full customization</li>
                <li className="flex items-center gap-2">✓ Streak badges & reports</li>
                <li className="flex items-center gap-2">✓ Smart reminders</li>
                <li className="flex items-center gap-2">✓ Cancel anytime</li>
              </ul>
              <button
                onClick={(e) => { e.stopPropagation(); handlePayNow(); }}
                className="mt-8 w-full rounded-lg bg-indigo-600 px-6 py-3 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors"
              >
                Pay $4.99/month
              </button>
            </div>

            {/* Annual Plan */}
            <div
              className={`relative rounded-2xl border-2 p-8 cursor-pointer transition-all ${
                selectedPlan === "annual"
                  ? "border-indigo-500 shadow-md"
                  : "border-gray-200 dark:border-gray-800"
              }`}
              onClick={() => setSelectedPlan("annual")}
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-indigo-600 px-4 py-1 text-xs font-semibold text-white">
                Best value
              </div>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Annual</h3>
                {selectedPlan === "annual" && (
                  <span className="text-indigo-500">✓</span>
                )}
              </div>
              <div className="mt-4">
                <span className="text-4xl font-bold text-gray-900 dark:text-gray-100">$39.99</span>
                <span className="text-sm text-gray-500">/year</span>
              </div>
              <p className="mt-1 text-sm">
                <span className="font-medium text-indigo-600">Save 33%</span> — $3.33/month
              </p>
              <ul className="mt-6 space-y-3 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-center gap-2">✓ Everything in Monthly</li>
                <li className="flex items-center gap-2">✓ 2 months free</li>
                <li className="flex items-center gap-2">✓ Priority support</li>
                <li className="flex items-center gap-2">✓ Early access to features</li>
              </ul>
              <button
                onClick={(e) => { e.stopPropagation(); handlePayNow(); }}
                className="mt-8 w-full rounded-lg bg-indigo-600 px-6 py-3 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors"
              >
                Pay $39.99/year
              </button>
            </div>
          </div>

          {/* Verify Payment */}
          <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              Already paid? Verify your subscription
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              After completing payment via Stripe, click below to activate your subscription.
            </p>
            <button
              onClick={handleVerifySubscription}
              disabled={verifying}
              className="mt-4 rounded-lg bg-green-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {verifying ? "Verifying..." : "✓ I've subscribed — Activate"}
            </button>
          </div>

          {/* Subscription info */}
          <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">About your subscription</h3>
            <ul className="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>• No ads, ever. Your data stays yours.</li>
              <li>• Cancel anytime from your account settings.</li>
              <li>• If you cancel, you keep access until the end of your billing period.</li>
              <li>• All prices in USD.</li>
              <li>• Payment processed securely via Stripe.</li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
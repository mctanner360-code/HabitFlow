import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1.5 text-sm font-medium text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
            <span className="h-2 w-2 rounded-full bg-indigo-500" />
            1-week free trial — no credit card required
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl dark:text-gray-100">
            Build better habits.
            <br />
            <span className="text-indigo-600 dark:text-indigo-400">Your way.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600 dark:text-gray-400">
            A fully customizable habit tracker that adapts to <em>your</em> life — not the other way
            around. Track unlimited habits, set your own success criteria, earn streak badges, and
            watch your progress with beautiful visual reports.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Link
              to="/signup"
              className="rounded-lg bg-indigo-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors"
            >
              Start your free trial
            </Link>
            <Link
              to="/login"
              className="rounded-lg border border-gray-300 px-6 py-3 text-base font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
            >
              Log in
            </Link>
          </div>
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-500">
            Free for 7 days &bull; $4.99/month or $39.99/year after &bull; Cancel anytime
          </p>
        </div>

        {/* Decorative gradient */}
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-indigo-200 to-purple-200 opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 px-4 py-20 dark:bg-gray-900/50 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              Everything you need to build lasting habits
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
              No rigid categories. No habit limits. Just tools that flex to how you live.
            </p>
          </div>
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon="📋"
              title="Unlimited Habits"
              description="Track as many habits as you want — no caps, no upgrades needed. From daily meditation to weekly meal prep, it all fits."
            />
            <FeatureCard
              icon="🎯"
              title="Your Own Rules"
              description="Set custom frequencies (daily, weekly, or your own schedule) and target counts. You define what 'done' looks like."
            />
            <FeatureCard
              icon="🏆"
              title="Streak Badges"
              description="Earn badges at milestones: 3, 7, 14, 21, 30, 60, 90, and 365 days. Visual rewards that keep you motivated."
            />
            <FeatureCard
              icon="📊"
              title="Visual Reports"
              description="See your progress with beautiful charts, completion rates, streak history, and a heatmap calendar."
            />
            <FeatureCard
              icon="🔔"
              title="Smart Reminders"
              description="Set reminder times per habit with in-app notifications. Never lose track of a habit day again."
            />
            <FeatureCard
              icon="🎨"
              title="Fully Customizable"
              description="Colors, icons, descriptions — make each habit your own. Your dashboard, your way."
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              Simple, transparent pricing
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
              Start with a 1-week free trial. No ads. No data selling. Cancel anytime.
            </p>
          </div>
          <div className="mt-12 grid gap-8 lg:grid-cols-2">
            {/* Monthly Plan */}
            <div className="relative flex flex-col rounded-2xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Monthly</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                  $4.99
                </span>
                <span className="text-sm text-gray-500">/month</span>
              </div>
              <p className="mt-1 text-sm text-gray-500">Billed monthly</p>
              <ul className="mt-6 space-y-3 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-center gap-2">
                  <span className="text-indigo-500">✓</span> Unlimited habits
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-indigo-500">✓</span> Full customization
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-indigo-500">✓</span> Streak badges &amp; reports
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-indigo-500">✓</span> Smart reminders
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-indigo-500">✓</span> Cancel anytime
                </li>
              </ul>
              <Link
                to="/signup"
                className="mt-8 w-full rounded-lg bg-indigo-600 px-6 py-3 text-center text-base font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors"
              >
                Start free trial
              </Link>
            </div>

            {/* Annual Plan */}
            <div className="relative flex flex-col rounded-2xl border-2 border-indigo-500 bg-white p-8 shadow-md dark:bg-gray-900">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-indigo-600 px-4 py-1 text-xs font-semibold text-white">
                Best value
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Annual</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                  $39.99
                </span>
                <span className="text-sm text-gray-500">/year</span>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                <span className="text-indigo-600 font-medium">Save 33%</span> — just $3.33/month
              </p>
              <ul className="mt-6 space-y-3 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-center gap-2">
                  <span className="text-indigo-500">✓</span> Everything in Monthly
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-indigo-500">✓</span> 2 months free
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-indigo-500">✓</span> Priority support
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-indigo-500">✓</span> Early access to new features
                </li>
              </ul>
              <Link
                to="/signup"
                className="mt-8 w-full rounded-lg bg-indigo-600 px-6 py-3 text-center text-base font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors"
              >
                Start free trial
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-indigo-600 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to forge better habits?
          </h2>
          <p className="mt-4 text-lg text-indigo-100">
            Join HabitForge today and start building the habits that matter to you. Free for 7 days.
          </p>
          <div className="mt-8">
            <Link
              to="/signup"
              className="rounded-lg bg-white px-8 py-3 text-base font-semibold text-indigo-600 shadow-sm hover:bg-indigo-50 transition-colors"
            >
              Start your free trial
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="text-3xl">{icon}</div>
      <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  );
}

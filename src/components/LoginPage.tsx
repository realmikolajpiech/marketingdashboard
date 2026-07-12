import { useState, type FormEvent } from "react";
import { MapPin, Lock } from "lucide-react";
import { useAuth } from "../lib/auth";

export default function LoginPage() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await signIn(email.trim(), password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign in");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full px-3 py-2.5 text-sm bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500";

  return (
    <div className="min-h-dvh bg-stone-50 dark:bg-stone-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        <div className="bg-white dark:bg-stone-900 rounded-2xl ring-1 ring-stone-200 dark:ring-stone-800 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-1">
            <Lock className="w-4 h-4 text-stone-400 dark:text-stone-500" />
            <h2 className="text-base font-semibold text-stone-900 dark:text-stone-100">Sign in</h2>
          </div>

          <br></br>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-stone-600 dark:text-stone-400 mb-1.5">Email</label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                placeholder="you@company.com"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-600 dark:text-stone-400 mb-1.5">Password</label>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-xs text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 ring-1 ring-rose-200 dark:ring-rose-800 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full px-4 py-2.5 text-sm font-medium text-white bg-teal-700 hover:bg-teal-800 disabled:opacity-60 rounded-lg transition-colors"
            >
              {submitting ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

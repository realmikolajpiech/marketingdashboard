import { MapPin } from "lucide-react";
import { CONFIG_ERROR } from "../lib/config";

export default function ConfigErrorPage() {
  return (
    <div className="min-h-dvh bg-stone-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl ring-1 ring-stone-200 shadow-sm p-6 text-center">
        <div className="w-10 h-10 rounded-xl bg-teal-700 flex items-center justify-center mx-auto mb-4">
          <MapPin className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-base font-semibold text-stone-900">Configuration required</h1>
        <p className="text-sm text-stone-600 mt-2 leading-relaxed">{CONFIG_ERROR}</p>
        <p className="text-xs text-stone-500 mt-4 leading-relaxed">
          On production, set <code className="text-stone-700">VITE_SUPABASE_URL</code> and{" "}
          <code className="text-stone-700">VITE_SUPABASE_ANON_KEY</code> in your hosting
          environment (or <code className="text-stone-700">SUPABASE_URL</code> /{" "}
          <code className="text-stone-700">SUPABASE_ANON_KEY</code> for runtime config).
        </p>
      </div>
    </div>
  );
}

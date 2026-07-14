import { useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { Platform } from "../types";
import { extractHandleFromInput } from "../utils";

interface InstagramViewsFetchProps {
  handle: string;
  platform: Platform;
  onApply: (avgViews: number) => void;
}

export default function InstagramViewsFetch({
  handle,
  platform,
  onApply,
}: InstagramViewsFetchProps) {
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  if (platform !== "Instagram") return null;

  const fetchViews = async () => {
    const username = extractHandleFromInput(handle, platform);
    if (!username) {
      setFeedback({ type: "error", text: "Enter a handle first" });
      return;
    }

    setLoading(true);
    setFeedback(null);

    try {
      const params = new URLSearchParams({ handle: username });
      const response = await fetch(`/api/instagram-views?${params}`);
      const data = await response.json();

      if (!response.ok) {
        setFeedback({ type: "error", text: data.error || "Could not fetch views" });
        return;
      }

      onApply(data.avgViews);
      setFeedback({
        type: "success",
        text: `Averaged ${data.sampleSize} video${data.sampleSize === 1 ? "" : "s"} → ${data.avgViews.toLocaleString()} views`,
      });
    } catch {
      setFeedback({ type: "error", text: "Could not reach Instagram" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-1.5">
      <button
        type="button"
        onClick={fetchViews}
        disabled={loading}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-teal-700 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300 disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : (
          <RefreshCw className="w-3 h-3" />
        )}
        {loading ? "Fetching from Instagram…" : "Fetch avg views from Instagram"}
      </button>
      {feedback && (
        <p
          className={`text-[11px] leading-relaxed ${
            feedback.type === "success" ? "text-teal-700 dark:text-teal-400" : "text-stone-500 dark:text-stone-400"
          }`}
        >
          {feedback.text}
        </p>
      )}
    </div>
  );
}

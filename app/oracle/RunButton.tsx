'use client';
import { useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Client-only button that triggers the server-side /api/run-oracle endpoint.
 */
export default function RunButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  return (
    <button
      onClick={async () => {
        setLoading(true);
        try {
          const res = await fetch("/api/run-oracle", { method: "POST" });
          if (!res.ok) {
            const data = await res.json().catch(() => ({ error: "Unknown error" }));
            alert("Run failed: " + (data.error || "Unknown error"));
          } else {
            router.refresh();
          }
        } catch (err: any) {
          alert("Error: " + String(err.message || err));
        } finally {
          setLoading(false);
        }
      }}
      className="group relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-2xl transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 overflow-hidden"
      disabled={loading}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur"></div>
      <div className="relative">
      {loading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="animate-pulse">Running...</span>
        </span>
      ) : (
        <span className="flex items-center gap-2">
          <span className="text-xl">🔮</span>
          <span>Run Oracle Now</span>
        </span>
      )}
      </div>
    </button>
  );
}
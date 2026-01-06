'use client';
import { useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Client-only button that triggers the server-side /api/run-oracle endpoint.
 * Minimal UI and error handling.
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
            const txt = await res.text();
            alert("Run failed: " + txt);
          } else {
            // refresh server components to show new run
            router.refresh();
          }
        } catch (err: any) {
          alert(String(err));
        } finally {
          setLoading(false);
        }
      }}
      className="bg-black text-white px-4 py-2 rounded"
      disabled={loading}
    >
      {loading ? "Running..." : "Run Oracle (server)"}
    </button>
  );
}
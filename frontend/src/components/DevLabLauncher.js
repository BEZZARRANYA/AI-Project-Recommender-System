// frontend/src/components/DevLabLauncher.js
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../utils/api";

function DevLabLauncher() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem("devLabToken");
    setUnlocked(Boolean(token));
  }, []);

  async function unlock() {
    if (!password.trim()) {
      setStatus("Enter the developer password.");
      return;
    }

    try {
      setLoading(true);
      setStatus("");

      const response = await fetch(`${API_BASE_URL}/dev-auth/unlock`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ password })
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.error || "Failed to unlock Dev Lab.");
      }

      const token = data.token || data.devToken || data.accessToken || "";

      if (!token) {
        throw new Error("Dev auth endpoint did not return a token.");
      }

      sessionStorage.setItem("devLabToken", token);
      setUnlocked(true);
      setPassword("");
      setStatus("");
    } catch (error) {
      setStatus(error.message || "Failed to unlock Dev Lab.");
    } finally {
      setLoading(false);
    }
  }

  function lock() {
    sessionStorage.removeItem("devLabToken");
    setUnlocked(false);
    setOpen(false);
    navigate("/");
  }

  function go(path) {
    setOpen(false);
    navigate(path);
  }

  return (
    <div className="fixed bottom-5 right-5 z-[120] flex flex-col items-end gap-3">
      {open ? (
        <div className="w-[310px] rounded-3xl border border-white/10 bg-[#0b0d10]/95 p-4 shadow-soft backdrop-blur-xl">
          {!unlocked ? (
            <>
              <p className="text-[11px] uppercase tracking-[0.24em] text-brand-300">
                Developer Access
              </p>

              <p className="mt-2 text-sm leading-6 text-white/55">
                Enter the Dev Lab password to access evaluation and audit tools.
              </p>

              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") unlock();
                }}
                placeholder="Developer password"
                className="mt-4 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30"
              />

              {status ? (
                <p className="mt-3 text-sm font-semibold text-red-200">
                  {status}
                </p>
              ) : null}

              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="btn-secondary cursor-target"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={unlock}
                  disabled={loading}
                  className="btn-primary cursor-target disabled:opacity-60"
                >
                  {loading ? "Unlocking..." : "Unlock"}
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-[11px] uppercase tracking-[0.24em] text-brand-300">
                Dev Lab
              </p>

              <div className="mt-4 grid gap-2">
                <button
                  type="button"
                  onClick={() => go("/research-insights")}
                  className="btn-secondary cursor-target justify-center"
                >
                  Insights
                </button>

                <button
                  type="button"
                  onClick={() => go("/evaluation-lab")}
                  className="btn-secondary cursor-target justify-center"
                >
                  Evaluation Lab
                </button>

                <button
                  type="button"
                  onClick={() => go("/dataset-audit")}
                  className="btn-secondary cursor-target justify-center"
                >
                  Audit
                </button>

                <button
                  type="button"
                  onClick={() => go("/dataset-editor")}
                  className="btn-secondary cursor-target justify-center"
                >
                  Editor
                </button>

                <button
                  type="button"
                  onClick={lock}
                  className="rounded-full border border-red-400/25 bg-red-400/10 px-4 py-2 text-sm font-bold text-red-100"
                >
                  Lock
                </button>
              </div>
            </>
          )}
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="rounded-full bg-brand-500 px-6 py-3 text-sm font-black text-white shadow-soft transition hover:bg-brand-400"
      >
        Dev Lab
      </button>
    </div>
  );
}

export default DevLabLauncher;
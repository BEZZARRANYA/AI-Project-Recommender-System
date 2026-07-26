import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { unlockDevLab } from "../utils/devLabAuth";

function DevLabAccessModal({
  isOpen,
  onClose,
  redirectPath = "/evaluation-lab"
}) {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setSubmitting(true);
      setError("");

      await unlockDevLab(password);
      setPassword("");
      onClose?.();
      navigate(redirectPath);
    } catch (err) {
      setError(err.message || "Access denied.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 px-4 backdrop-blur-md">
      <div className="glass-panel w-full max-w-md rounded-[2rem] p-6 shadow-soft">
        <div className="mb-5">
          <p className="text-xs uppercase tracking-[0.28em] text-brand-400">
            Developer Access
          </p>
          <h2 className="mt-3 text-2xl font-black text-white">
            Unlock Dev Lab
          </h2>
          <p className="mt-3 text-sm leading-7 text-white/60">
            Enter the developer password to access internal testing pages.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Developer password"
            className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none placeholder:text-white/30"
          />

          {error ? (
            <p className="mt-3 text-sm text-red-300">{error}</p>
          ) : null}

          <div className="mt-5 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary cursor-target flex-1"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary cursor-target flex-1"
            >
              {submitting ? "Checking..." : "Unlock"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default DevLabAccessModal;
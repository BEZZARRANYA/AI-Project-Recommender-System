// frontend/src/components/RecommendationFeedbackBar.js
import { useState } from "react";
import { submitRecommendationFeedback } from "../utils/feedbackApi";

function safeString(value) {
  return String(value || "").trim();
}

function numberValue(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function getOrCreateFeedbackSessionId() {
  const existing = localStorage.getItem("recommendationFeedbackSessionId");

  if (existing) {
    return existing;
  }

  const next = `session_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  localStorage.setItem("recommendationFeedbackSessionId", next);
  return next;
}

function getSavedRunId() {
  try {
    const metadata = JSON.parse(
      localStorage.getItem("recommendationRunMetadata") || "{}"
    );

    return safeString(metadata.runId);
  } catch {
    return "";
  }
}

function getProjectIdentity(project = {}, explicitProjectKey = "") {
  const displayTitle =
    safeString(project.displayTitle) ||
    safeString(project.personalizedTitle) ||
    safeString(project.title) ||
    safeString(project.baseTitle);

  const baseTitle =
    safeString(project.baseTitle) ||
    safeString(project.title) ||
    displayTitle;

  const projectKey =
    safeString(explicitProjectKey) ||
    safeString(project.projectKey) ||
    safeString(project._id) ||
    safeString(project.id) ||
    baseTitle ||
    displayTitle;

  return {
    projectKey,
    projectTitle: displayTitle || baseTitle || projectKey,
    baseTitle,
    personalizedTitle:
      safeString(project.personalizedTitle) ||
      safeString(project.displayTitle) ||
      ""
  };
}

function FeedbackButton({ active, children, onClick, tone = "neutral", disabled }) {
  const activeClass =
    tone === "positive"
      ? "border-emerald-400/35 bg-emerald-400/10 text-emerald-100"
      : tone === "negative"
        ? "border-red-400/35 bg-red-400/10 text-red-100"
        : tone === "favorite"
          ? "border-brand-500/45 bg-brand-500/10 text-brand-100"
          : "border-white/10 bg-white/5 text-white/75";

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${
        active
          ? activeClass
          : "border-white/10 bg-white/5 text-white/75 hover:border-white/25"
      }`}
    >
      {children}
    </button>
  );
}

function RecommendationFeedbackBar({
  project,
  recommendation,
  projectId,
  projectKey,
  userPreferences
}) {
  const targetProject = project || recommendation || {};

  const [selectedType, setSelectedType] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(feedbackType) {
    const identity = getProjectIdentity(targetProject, projectKey);

    if (!identity.projectKey || !identity.projectTitle) {
      setErrorMessage("Missing project identity. Cannot save feedback.");
      setStatusMessage("");
      return;
    }

    const payload = {
      runId: getSavedRunId(),
      sessionId: getOrCreateFeedbackSessionId(),

      projectId:
        safeString(projectId) ||
        safeString(targetProject._id) ||
        safeString(targetProject.id),

      projectKey: identity.projectKey,
      projectTitle: identity.projectTitle,
      baseTitle: identity.baseTitle,
      personalizedTitle: identity.personalizedTitle,

      projectType: safeString(targetProject.projectType),
      difficulty: safeString(targetProject.difficulty),

      feedbackType,
      note,

      score: numberValue(targetProject.score, 0),
      deterministicScore: numberValue(
        targetProject.deterministicScore || targetProject.score,
        0
      ),
      geminiScore: numberValue(targetProject.geminiScore, 0),

      aiConfidence: numberValue(
        targetProject.aiConfidence || targetProject.geminiConfidence,
        0
      ),

      geminiConfidence: numberValue(
        targetProject.geminiConfidence || targetProject.aiConfidence,
        0
      ),

      aiEnhanced: Boolean(targetProject.aiEnhanced || targetProject.geminiAvailable),
      geminiAvailable: Boolean(targetProject.geminiAvailable || targetProject.aiEnhanced),

      userPreferences: userPreferences || {},
      project: targetProject,
      recommendation: targetProject
    };

    try {
      setSaving(true);
      setErrorMessage("");
      setStatusMessage("");

      await submitRecommendationFeedback(payload);

      setSelectedType(feedbackType);
      setStatusMessage("Feedback saved.");
    } catch (error) {
      console.error("Feedback save failed:", error);
      setErrorMessage(error.message || "Failed to save feedback.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
      <p className="mb-4 text-[11px] uppercase tracking-[0.22em] text-white/38">
        Recommendation feedback
      </p>

      <div className="flex flex-wrap gap-3">
        <FeedbackButton
          active={selectedType === "helpful"}
          tone="positive"
          disabled={saving}
          onClick={() => handleSubmit("helpful")}
        >
          Helpful
        </FeedbackButton>

        <FeedbackButton
          active={selectedType === "not_relevant"}
          tone="negative"
          disabled={saving}
          onClick={() => handleSubmit("not_relevant")}
        >
          Not relevant
        </FeedbackButton>

        <FeedbackButton
          active={selectedType === "favorite"}
          tone="favorite"
          disabled={saving}
          onClick={() => handleSubmit("favorite")}
        >
          Save favorite
        </FeedbackButton>
      </div>

      <textarea
        value={note}
        onChange={(event) => setNote(event.target.value)}
        placeholder="Optional note about why this recommendation was or wasn’t useful."
        className="mt-4 min-h-[90px] w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30"
      />

      {saving ? (
        <p className="mt-3 text-sm text-white/50">Saving feedback...</p>
      ) : null}

      {statusMessage ? (
        <p className="mt-3 text-sm font-semibold text-emerald-200">
          {statusMessage}
        </p>
      ) : null}

      {errorMessage ? (
        <p className="mt-3 text-sm font-semibold text-red-200">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}

export default RecommendationFeedbackBar;
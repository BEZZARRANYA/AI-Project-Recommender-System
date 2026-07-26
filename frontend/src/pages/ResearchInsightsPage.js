// frontend/src/pages/ResearchInsightsPage.js
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchRecommendationFeedbackSummary
} from "../utils/feedbackApi";
import {
  fetchRecommendationRun,
  fetchRecommendationRuns
} from "../utils/recommendationRunsApi";

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function safeString(value) {
  return String(value || "").trim();
}

function numberValue(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function readJsonFromLocalStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function formatPercent(value) {
  return `${numberValue(value, 0).toFixed(1)}%`;
}

function formatNumber(value) {
  return numberValue(value, 0).toFixed(0);
}

function formatDate(value) {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return date.toLocaleString();
}

function isGeminiProject(project = {}) {
  return Boolean(project.geminiAvailable || project.aiEnhanced);
}

function getProjectTitle(project = {}) {
  return (
    safeString(project.displayTitle) ||
    safeString(project.personalizedTitle) ||
    safeString(project.title) ||
    safeString(project.baseTitle) ||
    safeString(project.projectTitle) ||
    "Untitled project"
  );
}

function getBaseTitle(project = {}) {
  return (
    safeString(project.baseTitle) ||
    safeString(project.title) ||
    getProjectTitle(project)
  );
}

function getProjectKey(project = {}) {
  return (
    safeString(project.projectKey) ||
    safeString(project._id) ||
    safeString(project.id) ||
    safeString(project.projectId) ||
    getBaseTitle(project) ||
    getProjectTitle(project)
  );
}

function getScore(project = {}) {
  if (isGeminiProject(project)) {
    return numberValue(project.score, 0);
  }

  return numberValue(project.deterministicScore || project.score, 0);
}

function getConfidence(project = {}) {
  if (!isGeminiProject(project)) return 0;

  return numberValue(project.geminiConfidence || project.aiConfidence, 0);
}

function normalizePreferenceSnapshot(currentRun, fallbackPreferences) {
  const source =
    currentRun?.normalizedPreferences ||
    currentRun?.userPreferences ||
    fallbackPreferences ||
    {};

  return {
    skill:
      safeString(source.skill) ||
      safeString(source.skillLevel) ||
      "Not specified",

    difficulty:
      safeString(source.difficulty) ||
      "Not specified",

    projectType:
      safeString(source.projectType) ||
      "Not specified",

    industry:
      safeString(source.preferredIndustry) ||
      safeString(source.industry) ||
      "No preference",

    interests:
      safeArray(source.interests).length
        ? safeArray(source.interests)
        : safeArray(source.selectedInterests),

    languages:
      safeArray(source.languagesTools).length
        ? safeArray(source.languagesTools)
        : safeArray(source.languages).length
          ? safeArray(source.languages)
          : safeArray(source.technologies)
  };
}

function buildFeedbackLookup(feedbackSummary = {}) {
  const rows = safeArray(
    feedbackSummary.projectStats ||
      feedbackSummary.projects ||
      feedbackSummary.rows
  );

  const map = new Map();

  rows.forEach((row) => {
    const keys = [
      safeString(row.projectKey),
      safeString(row.projectId),
      safeString(row.projectTitle),
      safeString(row.baseTitle),
      safeString(row.personalizedTitle)
    ].filter(Boolean);

    keys.forEach((key) => {
      map.set(key, row);
    });
  });

  return map;
}

function getFeedbackForProject(project, feedbackMap) {
  const keys = [
    getProjectKey(project),
    safeString(project._id),
    safeString(project.id),
    safeString(project.projectKey),
    safeString(project.title),
    safeString(project.baseTitle),
    safeString(project.personalizedTitle),
    safeString(project.displayTitle)
  ].filter(Boolean);

  for (const key of keys) {
    if (feedbackMap.has(key)) {
      return feedbackMap.get(key);
    }
  }

  return null;
}

function MetricCard({ label, value, note }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-6">
      <p className="text-[11px] uppercase tracking-[0.24em] text-brand-300">
        {label}
      </p>
      <p className="mt-3 text-4xl font-black text-white">{value}</p>
      {note ? (
        <p className="mt-2 text-sm leading-6 text-white/55">{note}</p>
      ) : null}
    </div>
  );
}

function SnapshotField({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">
        {label}
      </p>
      <p className="mt-2 text-sm font-bold text-white">{value || "Not specified"}</p>
    </div>
  );
}

function ModeBadge({ mode }) {
  const isGemini = mode === "Gemini";

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] ${
        isGemini
          ? "border-emerald-400/35 bg-emerald-400/10 text-emerald-200"
          : "border-yellow-400/35 bg-yellow-400/10 text-yellow-200"
      }`}
    >
      {mode}
    </span>
  );
}

function WarningBox({ children }) {
  return (
    <div className="rounded-2xl border border-yellow-400/25 bg-yellow-400/10 px-5 py-4 text-sm font-semibold text-yellow-100">
      {children}
    </div>
  );
}

function ErrorBox({ children }) {
  return (
    <div className="rounded-2xl border border-red-400/25 bg-red-400/10 px-5 py-4 text-sm font-semibold text-red-100">
      {children}
    </div>
  );
}

function ResearchInsightsPage() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentRun, setCurrentRun] = useState(null);
  const [runsPayload, setRunsPayload] = useState({ count: 0, runs: [] });
  const [feedbackSummary, setFeedbackSummary] = useState(null);
  const [warningMessage, setWarningMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const savedRunMetadata = useMemo(
    () => readJsonFromLocalStorage("recommendationRunMetadata", null),
    []
  );

  const savedRecommendations = useMemo(
    () => readJsonFromLocalStorage("recommendedProjects", []),
    []
  );

  const savedPreferences = useMemo(
    () => readJsonFromLocalStorage("userPreferences", null),
    []
  );

  const currentRunId = safeString(savedRunMetadata?.runId);

  const loadData = useCallback(async () => {
    setErrorMessage("");
    setWarningMessage("");

    try {
      const runsResult = await fetchRecommendationRuns(20);
      setRunsPayload(runsResult);

      let runResult = null;

      if (currentRunId) {
        try {
          runResult = await fetchRecommendationRun(currentRunId);
          setCurrentRun(runResult);
        } catch (runError) {
          setWarningMessage(
            `Current run could not be loaded from backend. Showing local recommendation data only. ${runError.message}`
          );
          setCurrentRun(null);
        }
      } else {
        setWarningMessage(
          "No current runId found in localStorage. Showing local recommendation data only."
        );
      }

      try {
        const summaryResult = await fetchRecommendationFeedbackSummary({
          runId: currentRunId
        });

        setFeedbackSummary(summaryResult);
      } catch (summaryError) {
        setWarningMessage(
          `Feedback summary request failed. Showing recommendation data without run feedback. ${summaryError.message}`
        );
        setFeedbackSummary(null);
      }
    } catch (error) {
      setErrorMessage(error.message || "Failed to load research insights.");
    }
  }, [currentRunId]);

  useEffect(() => {
    async function initialLoad() {
      setLoading(true);
      await loadData();
      setLoading(false);
    }

    initialLoad();
  }, [loadData]);

  async function handleRefresh() {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }

  const recommendations = useMemo(() => {
    const backendRecommendations = safeArray(currentRun?.recommendations);

    if (backendRecommendations.length) {
      return backendRecommendations;
    }

    return safeArray(savedRecommendations);
  }, [currentRun, savedRecommendations]);

  const preferenceSnapshot = useMemo(
    () => normalizePreferenceSnapshot(currentRun, savedPreferences),
    [currentRun, savedPreferences]
  );

  const feedbackMap = useMemo(
    () => buildFeedbackLookup(feedbackSummary || {}),
    [feedbackSummary]
  );

  const enrichedRecommendations = useMemo(() => {
    return recommendations.map((project, index) => {
      const feedback = getFeedbackForProject(project, feedbackMap);
      const gemini = isGeminiProject(project);

      return {
        ...project,
        displayRank: numberValue(project.displayRank || project.uiRank || index + 1, index + 1),
        displayTitle: getProjectTitle(project),
        baseTitle: getBaseTitle(project),
        projectKey: getProjectKey(project),
        mode: gemini ? "Gemini" : "Fallback",
        score: getScore(project),
        confidence: getConfidence(project),
        feedbackResponses: numberValue(feedback?.responses || feedback?.totalResponses, 0),
        helpful: numberValue(feedback?.helpful || feedback?.helpfulCount, 0),
        notRelevant: numberValue(feedback?.notRelevant || feedback?.notRelevantCount, 0),
        favorites: numberValue(feedback?.favorites || feedback?.favoriteCount, 0)
      };
    });
  }, [recommendations, feedbackMap]);

  const geminiProjects = enrichedRecommendations.filter(
    (project) => project.mode === "Gemini"
  );

  const fallbackProjects = enrichedRecommendations.filter(
    (project) => project.mode === "Fallback"
  );

  const averageConfidence = useMemo(() => {
    const confidenceRows = geminiProjects
      .map((project) => project.confidence)
      .filter((value) => value > 0);

    if (!confidenceRows.length) return 0;

    const total = confidenceRows.reduce((sum, value) => sum + value, 0);
    return total / confidenceRows.length;
  }, [geminiProjects]);

  const summary = feedbackSummary?.summary || feedbackSummary || {};

  const totalResponses = numberValue(summary.totalResponses, 0);
  const helpful = numberValue(summary.helpful, 0);
  const notRelevant = numberValue(summary.notRelevant, 0);
  const favorites = numberValue(summary.favorites, 0);
  const helpfulRate = numberValue(summary.helpfulRate, 0);
  const favoriteRate = numberValue(summary.favoriteRate, 0);
  const projectsWithFeedback = numberValue(summary.projectsWithFeedback, 0);

  const historicalRuns = safeArray(runsPayload.runs);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#050608] px-6 py-24 text-white">
        <div className="mx-auto max-w-4xl rounded-[2rem] border border-white/10 bg-white/[0.035] p-8">
          <p className="text-lg font-bold text-white/70">
            Loading run-based research insights...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050608] px-6 py-24 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.34em] text-brand-300">
              Research Insights
            </p>

            <h1 className="mt-4 text-5xl font-black leading-none text-white md:text-7xl">
              Run-based
              <span className="block text-white/45">
                evaluation dashboard.
              </span>
            </h1>

            <p className="mt-5 max-w-3xl text-sm leading-7 text-white/60">
              This page evaluates the current recommendation run, its saved backend
              session, Gemini/fallback split, and feedback signals linked to the
              exact runId.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => navigate("/results")}
              className="btn-secondary cursor-target"
            >
              Back to Results
            </button>

            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              className="btn-secondary cursor-target disabled:opacity-60"
            >
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/questionnaire")}
              className="btn-primary cursor-target"
            >
              New Test Run
            </button>
          </div>
        </div>

        <div className="mt-8 grid gap-4">
          {errorMessage ? <ErrorBox>{errorMessage}</ErrorBox> : null}
          {warningMessage ? <WarningBox>{warningMessage}</WarningBox> : null}
        </div>

        <section className="mt-8 rounded-[2rem] border border-white/10 bg-white/[0.035] p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.24em] text-brand-300">
                Current Recommendation Run
              </p>

              <h2 className="mt-2 text-2xl font-black text-white">
                {currentRunId || "No active run"}
              </h2>

              <p className="mt-2 text-sm text-white/50">
                Generated:{" "}
                {formatDate(
                  currentRun?.createdAt ||
                    savedRunMetadata?.generatedAt ||
                    savedRunMetadata?.createdAt
                )}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <SnapshotField label="Skill" value={preferenceSnapshot.skill} />
              <SnapshotField label="Difficulty" value={preferenceSnapshot.difficulty} />
              <SnapshotField label="Project type" value={preferenceSnapshot.projectType} />
              <SnapshotField label="Industry" value={preferenceSnapshot.industry} />
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Total recommendations"
            value={formatNumber(enrichedRecommendations.length)}
            note="Projects returned for the current run"
          />

          <MetricCard
            label="Gemini personalized"
            value={formatNumber(geminiProjects.length)}
            note="Recommendations enhanced by Gemini"
          />

          <MetricCard
            label="Fallback matches"
            value={formatNumber(fallbackProjects.length)}
            note="Rule-based deterministic backup results"
          />

          <MetricCard
            label="Avg AI confidence"
            value={formatPercent(averageConfidence)}
            note="Average across Gemini-personalized rows"
          />
        </section>

        <section className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <MetricCard
            label="Current run feedback"
            value={formatNumber(totalResponses)}
            note="Feedback events tied to this runId"
          />

          <MetricCard
            label="Helpful"
            value={formatNumber(helpful)}
            note={`${formatPercent(helpfulRate)} helpful rate`}
          />

          <MetricCard
            label="Not relevant"
            value={formatNumber(notRelevant)}
            note="Negative relevance signals"
          />

          <MetricCard
            label="Favorites"
            value={formatNumber(favorites)}
            note={`${formatPercent(favoriteRate)} favorite rate`}
          />

          <MetricCard
            label="Projects with feedback"
            value={formatNumber(projectsWithFeedback)}
            note="Projects receiving at least one signal"
          />
        </section>

        <section className="mt-8 rounded-[2rem] border border-white/10 bg-white/[0.035] p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.24em] text-brand-300">
                Current Run Table
              </p>
              <h2 className="mt-2 text-3xl font-black text-white">
                Recommendation performance by project
              </h2>
            </div>

            <p className="text-sm text-white/45">
              {enrichedRecommendations.length} tracked projects
            </p>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[980px] border-separate border-spacing-y-3">
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-[0.2em] text-white/35">
                  <th className="px-4 py-2">Rank</th>
                  <th className="px-4 py-2">Project</th>
                  <th className="px-4 py-2">Mode</th>
                  <th className="px-4 py-2">Score/Fit</th>
                  <th className="px-4 py-2">Responses</th>
                  <th className="px-4 py-2">Helpful</th>
                  <th className="px-4 py-2">Not relevant</th>
                  <th className="px-4 py-2">Favorites</th>
                  <th className="px-4 py-2">Confidence</th>
                </tr>
              </thead>

              <tbody>
                {enrichedRecommendations.map((project) => (
                  <tr
                    key={`${project.displayRank}-${project.projectKey}`}
                    className="rounded-2xl bg-black/25 text-sm text-white/75"
                  >
                    <td className="rounded-l-2xl px-4 py-4 font-black text-brand-200">
                      #{project.displayRank}
                    </td>

                    <td className="px-4 py-4">
                      <p className="font-black text-white">{project.displayTitle}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.12em] text-white/35">
                        Base: {project.baseTitle}
                      </p>
                      <p className="mt-1 text-xs text-white/45">
                        {safeString(project.projectType) || "Project"}
                      </p>
                    </td>

                    <td className="px-4 py-4">
                      <ModeBadge mode={project.mode} />
                    </td>

                    <td className="px-4 py-4 font-black text-white">
                      {numberValue(project.score).toFixed(1)}
                    </td>

                    <td className="px-4 py-4 font-bold">
                      {project.feedbackResponses}
                    </td>

                    <td className="px-4 py-4 font-bold text-emerald-200">
                      {project.helpful}
                    </td>

                    <td className="px-4 py-4 font-bold text-red-200">
                      {project.notRelevant}
                    </td>

                    <td className="px-4 py-4 font-bold text-brand-200">
                      {project.favorites}
                    </td>

                    <td className="rounded-r-2xl px-4 py-4 font-black text-white">
                      {project.mode === "Gemini"
                        ? `${numberValue(project.confidence).toFixed(1)}%`
                        : "Not used"}
                    </td>
                  </tr>
                ))}

                {!enrichedRecommendations.length ? (
                  <tr>
                    <td
                      colSpan="9"
                      className="rounded-2xl border border-white/10 bg-black/20 px-4 py-8 text-center text-white/50"
                    >
                      No recommendations available for this run.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-8 rounded-[2rem] border border-white/10 bg-white/[0.035] p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.24em] text-brand-300">
                Historical Runs
              </p>
              <h2 className="mt-2 text-3xl font-black text-white">
                Saved recommendation sessions
              </h2>
            </div>

            <p className="text-sm text-white/45">
              {historicalRuns.length} recent runs
            </p>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[950px] border-separate border-spacing-y-3">
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-[0.2em] text-white/35">
                  <th className="px-4 py-2">Created</th>
                  <th className="px-4 py-2">Top recommendation</th>
                  <th className="px-4 py-2">Preferences</th>
                  <th className="px-4 py-2">Gemini</th>
                  <th className="px-4 py-2">Fallback</th>
                  <th className="px-4 py-2">Total</th>
                </tr>
              </thead>

              <tbody>
                {historicalRuns.map((run) => {
                  const top = run.topRecommendation || {};
                  const prefs = run.normalizedPreferences || {};

                  return (
                    <tr
                      key={run.runId}
                      className={`bg-black/25 text-sm text-white/75 ${
                        run.runId === currentRunId
                          ? "outline outline-1 outline-brand-500/35"
                          : ""
                      }`}
                    >
                      <td className="rounded-l-2xl px-4 py-4">
                        <p className="font-bold text-white">
                          {formatDate(run.createdAt)}
                        </p>
                        <p className="mt-1 max-w-[220px] truncate text-xs text-white/35">
                          {run.runId}
                        </p>
                      </td>

                      <td className="px-4 py-4">
                        <p className="font-black text-white">
                          {getProjectTitle(top)}
                        </p>
                        <p className="mt-1 text-xs uppercase tracking-[0.12em] text-white/35">
                          Base: {getBaseTitle(top)}
                        </p>
                      </td>

                      <td className="px-4 py-4">
                        <p className="font-bold text-white">
                          {safeString(prefs.skill) || "Not specified"} ·{" "}
                          {safeString(prefs.difficulty) || "Not specified"}
                        </p>
                        <p className="mt-1 text-xs text-white/45">
                          {safeString(prefs.projectType) || "Not specified"}
                        </p>
                      </td>

                      <td className="px-4 py-4 font-black text-emerald-200">
                        {numberValue(run.geminiRecommendations, 0)}
                      </td>

                      <td className="px-4 py-4 font-black text-yellow-200">
                        {numberValue(run.fallbackRecommendations, 0)}
                      </td>

                      <td className="rounded-r-2xl px-4 py-4 font-black text-white">
                        {numberValue(run.totalRecommendations, 0)}
                      </td>
                    </tr>
                  );
                })}

                {!historicalRuns.length ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="rounded-2xl border border-white/10 bg-black/20 px-4 py-8 text-center text-white/50"
                    >
                      No saved recommendation runs found yet.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}

export default ResearchInsightsPage;
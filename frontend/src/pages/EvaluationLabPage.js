import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { fetchRecommendations } from "../utils/api";
import { evaluationProfiles } from "../utils/evaluationProfiles";
import {
  buildEvaluationOverview,
  evaluateRecommendationRun
} from "../utils/evaluationRunner";

function SummaryCard({ label, value, subtext = "" }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-black/25 p-5">
      <p className="text-[10px] uppercase tracking-[0.22em] text-white/38">
        {label}
      </p>
      <p className="mt-3 text-4xl font-black text-white">{value}</p>
      {subtext ? (
        <p className="mt-2 text-sm text-white/55">{subtext}</p>
      ) : null}
    </div>
  );
}

function EvaluationLabPage() {
  const [runResults, setRunResults] = useState([]);
  const [selectedRunId, setSelectedRunId] = useState("");
  const [loadingProfileId, setLoadingProfileId] = useState("");
  const [runningAll, setRunningAll] = useState(false);
  const [notice, setNotice] = useState("");

  async function runSingleProfile(profile) {
    try {
      setLoadingProfileId(profile.id);
      setNotice("");

      const results = await fetchRecommendations(profile.payload);
      const evaluatedRun = evaluateRecommendationRun(profile, results);

      setRunResults((prev) => {
        const filtered = prev.filter((item) => item.profileId !== profile.id);
        return [...filtered, evaluatedRun];
      });

      setSelectedRunId(profile.id);
    } catch (error) {
      setNotice(error.message || `Failed to run profile: ${profile.label}`);
    } finally {
      setLoadingProfileId("");
    }
  }

  async function runAllProfiles() {
    try {
      setRunningAll(true);
      setNotice(
        "Running all profiles. On free-tier Gemini, this can consume quota quickly."
      );

      const collected = [];

      for (const profile of evaluationProfiles) {
        setLoadingProfileId(profile.id);

        const results = await fetchRecommendations(profile.payload);
        const evaluatedRun = evaluateRecommendationRun(profile, results);
        collected.push(evaluatedRun);

        // keep UI responsive between runs
        await new Promise((resolve) => setTimeout(resolve, 400));
      }

      setRunResults(collected);
      setSelectedRunId(collected[0]?.profileId || "");
      setNotice("Evaluation run complete.");
    } catch (error) {
      setNotice(error.message || "Failed while running the evaluation matrix.");
    } finally {
      setRunningAll(false);
      setLoadingProfileId("");
    }
  }

  const sortedRuns = useMemo(() => {
    return [...runResults].sort((a, b) => a.label.localeCompare(b.label));
  }, [runResults]);

  const overview = useMemo(() => {
    return buildEvaluationOverview(sortedRuns);
  }, [sortedRuns]);

  const selectedRun =
    sortedRuns.find((item) => item.profileId === selectedRunId) || sortedRuns[0] || null;

  return (
    <main className="relative min-h-screen overflow-hidden pb-20 pt-10">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-[-10%] top-[8%] h-72 w-72 rounded-full bg-brand-500/10 blur-3xl" />
        <div className="absolute bottom-[12%] right-[-6%] h-80 w-80 rounded-full bg-orange-400/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,77,0,0.10),transparent_28%),linear-gradient(to_bottom,rgba(255,255,255,0.02),transparent_30%)]" />
      </div>

      <div className="container-shell">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="mb-3 text-xs uppercase tracking-[0.3em] text-brand-400">
                Evaluation Lab
              </p>
              <h1 className="text-4xl font-black leading-none text-white sm:text-5xl lg:text-6xl">
                Recommendation quality
                <span className="block text-white/45">test matrix.</span>
              </h1>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-white/60 sm:text-base">
                Run fixed user personas against the recommender, inspect top matches,
                and score how well the results align with the intended profile.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={runAllProfiles}
                disabled={runningAll}
                className="btn-primary cursor-target"
              >
                {runningAll ? "Running..." : "Run Full Matrix"}
              </button>

              <Link to="/research-insights" className="btn-secondary cursor-target">
                Research Insights
              </Link>
            </div>
          </div>

          {notice ? (
            <div className="mb-6 rounded-2xl border border-brand-500/25 bg-brand-500/10 px-4 py-3 text-sm text-brand-100">
              {notice}
            </div>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              label="Test Runs"
              value={overview.totalRuns}
              subtext="Completed persona evaluations"
            />
            <SummaryCard
              label="Avg Top Fit"
              value={`${overview.avgTopFitScore}%`}
              subtext="Heuristic fit score of top result"
            />
            <SummaryCard
              label="Avg Top 3 Fit"
              value={`${overview.avgTopThreeFit}%`}
              subtext="Average relevance across top three"
            />
            <SummaryCard
              label="Avg Gemini Confidence"
              value={`${overview.avgGeminiConfidence}%`}
              subtext="Average AI confidence across runs"
            />
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <SummaryCard
              label="Strong"
              value={overview.strongCount}
              subtext="Runs with high fit + confidence"
            />
            <SummaryCard
              label="Acceptable"
              value={overview.acceptableCount}
              subtext="Runs that are usable but need review"
            />
            <SummaryCard
              label="Needs Review"
              value={overview.reviewCount}
              subtext="Profiles where the ranking looks weak"
            />
          </div>

          <div className="mt-10 grid gap-8 xl:grid-cols-[0.95fr_1.05fr]">
            <div className="glass-panel rounded-[2rem] p-6 shadow-soft sm:p-8">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Test personas</h2>
                <p className="text-sm text-white/40">
                  {evaluationProfiles.length} profiles
                </p>
              </div>

              <div className="space-y-4">
                {evaluationProfiles.map((profile) => {
                  const existingRun = sortedRuns.find(
                    (item) => item.profileId === profile.id
                  );

                  return (
                    <div
                      key={profile.id}
                      className="rounded-3xl border border-white/10 bg-black/20 p-5"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-semibold text-white">
                            {profile.label}
                          </h3>
                          <p className="mt-2 text-sm leading-6 text-white/58">
                            {profile.description}
                          </p>

                          <div className="mt-3 flex flex-wrap gap-2">
                            {profile.payload.languages.map((tech) => (
                              <span key={tech} className="tag-pill">
                                {tech}
                              </span>
                            ))}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => runSingleProfile(profile)}
                          disabled={runningAll || loadingProfileId === profile.id}
                          className="btn-secondary cursor-target shrink-0"
                        >
                          {loadingProfileId === profile.id ? "Running..." : "Run"}
                        </button>
                      </div>

                      {existingRun ? (
                        <div className="mt-4 grid gap-3 sm:grid-cols-3">
                          <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                            <p className="text-[10px] uppercase tracking-[0.16em] text-white/35">
                              Assessment
                            </p>
                            <p className="mt-2 text-sm font-semibold text-white">
                              {existingRun.assessment}
                            </p>
                          </div>

                          <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                            <p className="text-[10px] uppercase tracking-[0.16em] text-white/35">
                              Top Fit
                            </p>
                            <p className="mt-2 text-sm font-semibold text-white">
                              {existingRun.topFitScore}%
                            </p>
                          </div>

                          <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                            <p className="text-[10px] uppercase tracking-[0.16em] text-white/35">
                              Gemini
                            </p>
                            <p className="mt-2 text-sm font-semibold text-white">
                              {existingRun.geminiUsedCount}/{existingRun.totalResults}
                            </p>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="glass-panel rounded-[2rem] p-6 shadow-soft sm:p-8">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Run details</h2>
                <p className="text-sm text-white/40">
                  Select a profile by running it
                </p>
              </div>

              {!selectedRun ? (
                <div className="rounded-2xl border border-white/10 bg-black/20 p-6 text-white/60">
                  No evaluation run yet. Run one persona to inspect the recommendation quality.
                </div>
              ) : (
                <>
                  <div className="grid gap-4 md:grid-cols-2">
                    <SummaryCard
                      label="Profile"
                      value={selectedRun.label}
                      subtext={selectedRun.assessment}
                    />
                    <SummaryCard
                      label="Top Match"
                      value={selectedRun.topMatchTitle}
                      subtext={`Score ${selectedRun.topMatchScore.toFixed(1)}`}
                    />
                    <SummaryCard
                      label="Top Fit Score"
                      value={`${selectedRun.topFitScore}%`}
                      subtext="Heuristic match of the #1 result"
                    />
                    <SummaryCard
                      label="Avg Gemini Confidence"
                      value={`${selectedRun.avgGeminiConfidence}%`}
                      subtext={`${selectedRun.geminiCoverage}% Gemini coverage`}
                    />
                  </div>

                  <div className="mt-8 rounded-3xl border border-white/10 bg-black/20 p-5">
                    <p className="mb-3 text-[11px] uppercase tracking-[0.22em] text-white/38">
                      Top-3 results
                    </p>

                    <div className="space-y-3">
                      {selectedRun.topThreeTitles.map((title, index) => (
                        <div
                          key={`${title}-${index}`}
                          className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/75"
                        >
                          #{index + 1} — {title}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-5 rounded-3xl border border-white/10 bg-black/20 p-5">
                    <p className="mb-3 text-[11px] uppercase tracking-[0.22em] text-white/38">
                      Top match diagnostics
                    </p>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                        <p className="text-[10px] uppercase tracking-[0.16em] text-white/35">
                          Difficulty
                        </p>
                        <p className="mt-2 text-sm font-semibold text-white">
                          {selectedRun.topDiagnostics?.difficultyMatch ? "Matched" : "Not matched"}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                        <p className="text-[10px] uppercase tracking-[0.16em] text-white/35">
                          Project Type
                        </p>
                        <p className="mt-2 text-sm font-semibold text-white">
                          {selectedRun.topDiagnostics?.projectTypeMatch ? "Matched" : "Not matched"}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                        <p className="text-[10px] uppercase tracking-[0.16em] text-white/35">
                          Language Overlap
                        </p>
                        <p className="mt-2 text-sm font-semibold text-white">
                          {selectedRun.topDiagnostics?.languageMatches ?? 0}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                        <p className="text-[10px] uppercase tracking-[0.16em] text-white/35">
                          Interest Overlap
                        </p>
                        <p className="mt-2 text-sm font-semibold text-white">
                          {selectedRun.topDiagnostics?.interestMatches ?? 0}
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </motion.section>
      </div>
    </main>
  );
}

export default EvaluationLabPage;
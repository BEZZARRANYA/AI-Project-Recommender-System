// frontend/src/pages/ResultsPage.js
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import ProjectCard from "../components/ProjectCard";
import ProjectModal from "../components/ProjectModal";
import RecommendationFeedbackBar from "../components/RecommendationFeedbackBar";
import {
  fetchRecommendations,
  getSavedPreferences,
  getSavedRecommendations,
  saveRecommendations
} from "../utils/api";

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

function getDisplayTitle(project = {}) {
  return (
    safeString(project.personalizedTitle) ||
    safeString(project.title) ||
    "Untitled Project"
  );
}

function getBaseTitle(project = {}) {
  return (
    safeString(project.baseTitle) ||
    safeString(project.title) ||
    "Untitled Project"
  );
}

function getDisplayBrief(project = {}) {
  return (
    safeString(project.personalizedBrief) ||
    safeString(project.description) ||
    "No project description available."
  );
}

function getFitSummary(project = {}) {
  return (
    safeString(project.geminiFitSummary) ||
    safeString(project.fitSummary) ||
    safeString(project.aiFitSummary) ||
    "No AI fit summary available."
  );
}

function getPortfolioAngle(project = {}) {
  return (
    safeString(project.portfolioAngle) ||
    safeString(project.geminiFitSummary) ||
    safeString(project.fitSummary) ||
    "No portfolio angle available."
  );
}

function normalizeProject(project = {}, index = 0) {
  const score = numberValue(project.score, 0);
  const deterministicScore = numberValue(project.deterministicScore, score);
  const geminiScore = numberValue(project.geminiScore, 0);
  const geminiConfidence = numberValue(
    project.geminiConfidence ?? project.aiConfidence,
    0
  );

  const isGemini = Boolean(project.geminiAvailable || project.aiEnhanced);

  return {
    ...project,
    _stableKey:
      safeString(project._id) ||
      safeString(project.id) ||
      `${safeString(project.title)}-${index}`,

    score,
    deterministicScore,
    geminiScore,
    geminiConfidence,
    aiConfidence: geminiConfidence,

    geminiAvailable: isGemini,
    aiEnhanced: isGemini,

    displayTitle: getDisplayTitle(project),
    baseTitle: getBaseTitle(project),
    displayBrief: getDisplayBrief(project),
    fitSummaryDisplay: getFitSummary(project),
    portfolioAngleDisplay: getPortfolioAngle(project),

    technologies: safeArray(project.technologies),
    categories: safeArray(project.categories),
    customFeatures: safeArray(project.customFeatures),
    suggestedMilestones: safeArray(project.suggestedMilestones),
    whyRecommended: safeArray(project.whyRecommended),
    deterministicSignals: safeArray(project.deterministicSignals)
  };
}

function rankProjects(projects = []) {
  const normalized = safeArray(projects).map(normalizeProject);

  const geminiProjects = normalized
    .filter((project) => project.geminiAvailable)
    .sort((a, b) => {
      const scoreDiff = numberValue(b.score) - numberValue(a.score);
      if (scoreDiff !== 0) return scoreDiff;

      return numberValue(b.geminiConfidence) - numberValue(a.geminiConfidence);
    });

  const fallbackProjects = normalized
    .filter((project) => !project.geminiAvailable)
    .sort((a, b) => {
      const fitDiff =
        numberValue(b.deterministicScore || b.score) -
        numberValue(a.deterministicScore || a.score);

      if (fitDiff !== 0) return fitDiff;

      return safeString(a.displayTitle).localeCompare(safeString(b.displayTitle));
    });

  return [...geminiProjects, ...fallbackProjects].map((project, index) => ({
    ...project,
    displayRank: index + 1,
    uiRank: index + 1
  }));
}

function HeroProject({ project, userPreferences, onOpen }) {
  if (!project) return null;

  const isGemini = Boolean(project.geminiAvailable || project.aiEnhanced);

  const showBaseProject =
    project.baseTitle &&
    project.displayTitle &&
    project.baseTitle !== project.displayTitle;

  return (
    <section className="glass-panel rounded-[2rem] p-6 shadow-soft sm:p-8">
      <div className="grid gap-8 lg:grid-cols-[1.35fr_0.9fr] lg:items-start">
        <div>
          <div className="mb-4 flex flex-wrap gap-2">
            <span className="rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-brand-200">
              Top Match
            </span>

            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-white/45">
              {project.projectType || "Project"}
            </span>

            <span
              className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] ${
                isGemini
                  ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
                  : "border-yellow-400/30 bg-yellow-400/10 text-yellow-200"
              }`}
            >
              {isGemini ? "Gemini Personalized" : "Deterministic Fallback"}
            </span>
          </div>

          <h2 className="max-w-3xl text-3xl font-black leading-tight text-white sm:text-4xl">
            {project.displayTitle}
          </h2>

          {showBaseProject ? (
            <p className="mt-3 text-xs uppercase tracking-[0.2em] text-white/35">
              Base project: {project.baseTitle}
            </p>
          ) : null}

          <p className="mt-5 max-w-3xl text-base leading-7 text-white/65">
            {project.displayBrief}
          </p>

          <div className="mt-5 rounded-3xl border border-white/10 bg-black/20 p-5">
            <p className="mb-2 text-[11px] uppercase tracking-[0.22em] text-white/38">
              {isGemini ? "Gemini fit summary" : "Deterministic fit summary"}
            </p>
            <p className="text-sm leading-6 text-white/68">
              {project.fitSummaryDisplay}
            </p>
          </div>

          <div className="mt-5 rounded-3xl border border-white/10 bg-black/20 p-5">
            <p className="mb-2 text-[11px] uppercase tracking-[0.22em] text-white/38">
              Portfolio angle
            </p>
            <p className="text-sm leading-6 text-white/68">
              {project.portfolioAngleDisplay}
            </p>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {project.technologies.slice(0, 8).map((tech) => (
              <span key={tech} className="tag-pill">
                {tech}
              </span>
            ))}
          </div>

          {!isGemini ? (
            <div className="mt-5 rounded-3xl border border-yellow-400/15 bg-yellow-400/5 p-5">
              <p className="text-sm leading-6 text-yellow-100/80">
                This top result was selected by deterministic scoring only. Gemini
                personalization was not applied to this item.
              </p>
            </div>
          ) : null}

          <div className="mt-6">
            <RecommendationFeedbackBar
              project={project}
              recommendation={project}
              projectId={project._id}
              projectKey={project._id || project.baseTitle || project.displayTitle}
              userPreferences={userPreferences}
            />
          </div>
        </div>

        <div className="grid gap-4">
          <div className="rounded-[1.5rem] border border-white/10 bg-black/25 p-6">
            <p className="text-[11px] uppercase tracking-[0.22em] text-white/38">
              {isGemini ? "AI Score" : "Deterministic Fit"}
            </p>
            <p className="mt-3 text-5xl font-black text-white">
              {numberValue(
                isGemini ? project.score : project.deterministicScore || project.score
              ).toFixed(1)}
            </p>
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-black/25 p-6">
            <p className="text-[11px] uppercase tracking-[0.22em] text-white/38">
              {isGemini ? "AI Confidence" : "AI Personalization"}
            </p>

            {isGemini ? (
              <p className="mt-3 text-5xl font-black text-white">
                {numberValue(project.geminiConfidence).toFixed(0)}%
              </p>
            ) : (
              <p className="mt-3 text-3xl font-black text-white/70">
                Not used
              </p>
            )}
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-black/25 p-6">
            <p className="text-[11px] uppercase tracking-[0.22em] text-white/38">
              Action
            </p>
            <button
              type="button"
              onClick={() => onOpen(project)}
              className="btn-secondary cursor-target mt-4"
            >
              Open full brief
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function SectionHeader({ eyebrow, title, description, count }) {
  return (
    <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow ? (
          <p className="mb-2 text-xs uppercase tracking-[0.26em] text-brand-400">
            {eyebrow}
          </p>
        ) : null}

        <h2 className="text-2xl font-black text-white">{title}</h2>

        {description ? (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/50">
            {description}
          </p>
        ) : null}
      </div>

      <p className="text-sm text-white/45">
        {count} item{count !== 1 ? "s" : ""}
      </p>
    </div>
  );
}

function ResultsPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [userPreferences, setUserPreferences] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const savedProjects = getSavedRecommendations();
    const savedPreferences = getSavedPreferences();

    setProjects(safeArray(savedProjects));
    setUserPreferences(savedPreferences);
  }, []);

  const rankedProjects = useMemo(() => rankProjects(projects), [projects]);

  const topProject = rankedProjects[0] || null;
  const gridProjects = rankedProjects.slice(1);

  const geminiGridProjects = gridProjects.filter((project) => project.geminiAvailable);
  const fallbackGridProjects = gridProjects.filter(
    (project) => !project.geminiAvailable
  );

  async function handleRegenerate() {
    if (!userPreferences) {
      setNotice("No saved preferences found. Return to the questionnaire first.");
      return;
    }

    try {
      setLoading(true);
      setNotice("");

      const freshResults = await fetchRecommendations(userPreferences);
      const rankedFreshResults = rankProjects(freshResults);

      saveRecommendations(rankedFreshResults);
      setProjects(rankedFreshResults);
    } catch (error) {
      setNotice(error.message || "Failed to regenerate recommendations.");
    } finally {
      setLoading(false);
    }
  }

  function handleRefinePreferences() {
    navigate("/questionnaire");
  }

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
            <div className="max-w-4xl">
              <p className="mb-3 text-xs uppercase tracking-[0.3em] text-brand-400">
                Recommendation Output
              </p>
              <h1 className="text-4xl font-black leading-none text-white sm:text-5xl lg:text-6xl">
                Projects matched
                <span className="block text-white/45">
                  to your creative direction.
                </span>
              </h1>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-white/60 sm:text-base">
                Personalized recommendations are ranked first. Deterministic
                fallback matches are shown separately as backup options.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleRegenerate}
                disabled={loading}
                className="btn-primary cursor-target"
              >
                {loading ? "Regenerating..." : "Regenerate Results"}
              </button>

              <button
                  type="button"
                  onClick={() => navigate("/report")}
                  className="btn-secondary cursor-target"
                >
                  Export Report
                </button>

              <button
                type="button"
                onClick={handleRefinePreferences}
                className="btn-secondary cursor-target"
              >
                Refine Preferences
              </button>
            </div>
          </div>

          {notice ? (
            <div className="mb-6 rounded-2xl border border-brand-500/25 bg-brand-500/10 px-4 py-3 text-sm text-brand-100">
              {notice}
            </div>
          ) : null}

          {!rankedProjects.length ? (
            <div className="glass-panel rounded-[2rem] p-10 text-center shadow-soft">
              <h2 className="text-3xl font-black text-white">
                No recommendations found
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-white/60">
                Go back to the questionnaire and generate recommendations first.
              </p>
              <button
                type="button"
                onClick={handleRefinePreferences}
                className="btn-primary cursor-target mt-8"
              >
                Open Questionnaire
              </button>
            </div>
          ) : (
            <>
              <HeroProject
                project={topProject}
                userPreferences={userPreferences}
                onOpen={setSelectedProject}
              />

              {geminiGridProjects.length ? (
                <>
                  <SectionHeader
                    eyebrow="Personalized"
                    title="Gemini-personalized recommendations"
                    description="These projects were reranked and reshaped by Gemini using your personal context."
                    count={geminiGridProjects.length}
                  />

                  <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {geminiGridProjects.map((project) => (
                      <ProjectCard
                        key={project._stableKey}
                        project={project}
                        rank={project.displayRank}
                        onOpen={setSelectedProject}
                      />
                    ))}
                  </div>
                </>
              ) : null}

              {fallbackGridProjects.length ? (
                <>
                  <SectionHeader
                    eyebrow="Backup matches"
                    title="Deterministic fallback matches"
                    description="These are rule-based backup options. They are useful for coverage, but they were not personalized by Gemini."
                    count={fallbackGridProjects.length}
                  />

                  <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {fallbackGridProjects.map((project) => (
                      <ProjectCard
                        key={project._stableKey}
                        project={project}
                        rank={project.displayRank}
                        onOpen={setSelectedProject}
                      />
                    ))}
                  </div>
                </>
              ) : null}
            </>
          )}
        </motion.section>
      </div>

      {selectedProject ? (
        <ProjectModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      ) : null}
    </main>
  );
}

export default ResultsPage;
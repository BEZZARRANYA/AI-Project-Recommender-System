// frontend/src/components/ProjectCard.js

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
    safeString(project.displayTitle) ||
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
    safeString(project.displayBrief) ||
    safeString(project.personalizedBrief) ||
    safeString(project.description) ||
    "No description available."
  );
}

function getPortfolioAngle(project = {}) {
  return (
    safeString(project.portfolioAngleDisplay) ||
    safeString(project.portfolioAngle) ||
    safeString(project.geminiFitSummary) ||
    "No portfolio angle available."
  );
}

function ProjectCard({
  project,
  rank,
  index = 0,
  onOpen,
  onSelect,
  onViewDetails,
  onClick
}) {
  if (!project) return null;

  const displayRank = Number.isFinite(Number(rank))
    ? Number(rank)
    : Number.isFinite(Number(project.displayRank))
      ? Number(project.displayRank)
      : index + 1;

  const displayTitle = getDisplayTitle(project);
  const baseTitle = getBaseTitle(project);
  const showBaseTitle = baseTitle && displayTitle !== baseTitle;

  const isGemini = Boolean(project.geminiAvailable || project.aiEnhanced);

  const score = numberValue(
    isGemini
      ? project.score
      : project.deterministicScore || project.score
  );

  const confidence = numberValue(project.geminiConfidence || project.aiConfidence);

  function handleOpen() {
    if (typeof onOpen === "function") return onOpen(project);
    if (typeof onViewDetails === "function") return onViewDetails(project);
    if (typeof onSelect === "function") return onSelect(project);
    if (typeof onClick === "function") return onClick(project);
    return null;
  }

  return (
    <article
      className={`glass-panel flex h-full flex-col rounded-[2rem] p-6 shadow-soft ${
        isGemini ? "" : "border-yellow-400/10"
      }`}
    >
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1 text-xs font-bold text-brand-200">
            #{displayRank}
          </span>

          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold uppercase text-white/45">
            {project.difficulty || "project"}
          </span>

          <span
            className={`rounded-full border px-3 py-1 text-xs font-bold uppercase ${
              isGemini
                ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
                : "border-yellow-400/30 bg-yellow-400/10 text-yellow-200"
            }`}
          >
            {isGemini ? "Gemini" : "Fallback"}
          </span>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-right">
          <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">
            {isGemini ? "AI Score" : "Fit"}
          </p>
          <p className="text-xl font-black text-white">{score.toFixed(1)}</p>
        </div>
      </div>

      <h3 className="text-2xl font-black leading-tight text-white">
        {displayTitle}
      </h3>

      {showBaseTitle ? (
        <p className="mt-2 text-xs uppercase tracking-[0.18em] text-white/35">
          Base project: {baseTitle}
        </p>
      ) : null}

      <p className="mt-4 text-sm leading-6 text-white/60">
        {getDisplayBrief(project)}
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
          <p className="text-[10px] uppercase tracking-[0.16em] text-white/35">
            {isGemini ? "AI Confidence" : "AI Personalization"}
          </p>

          {isGemini ? (
            <p className="mt-2 text-lg font-black text-white">
              {confidence.toFixed(0)}%
            </p>
          ) : (
            <p className="mt-2 text-sm font-black text-white/65">
              Not used
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
          <p className="text-[10px] uppercase tracking-[0.16em] text-white/35">
            Type
          </p>
          <p className="mt-2 text-sm font-semibold text-white">
            {project.projectType || "Project"}
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
        <p className="mb-2 text-[10px] uppercase tracking-[0.18em] text-white/35">
          Portfolio angle
        </p>
        <p className="text-sm leading-6 text-white/62">
          {getPortfolioAngle(project)}
        </p>
      </div>

      {!isGemini ? (
        <div className="mt-4 rounded-2xl border border-yellow-400/20 bg-yellow-400/5 p-4">
          <p className="text-xs font-semibold leading-5 text-yellow-100/80">
            Rule-based backup match. This project was not personalized by Gemini.
          </p>
        </div>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-2">
        {safeArray(project.technologies).slice(0, 6).map((tech) => (
          <span key={tech} className="tag-pill">
            {tech}
          </span>
        ))}
      </div>

      <div className="mt-auto flex justify-end pt-8">
        <button
          type="button"
          onClick={handleOpen}
          className="btn-secondary cursor-target"
        >
          View Details
        </button>
      </div>
    </article>
  );
}

export default ProjectCard;
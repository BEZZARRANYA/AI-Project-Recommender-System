// frontend/src/components/ProjectModal.js

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
    "No project description available."
  );
}

function getPortfolioAngle(project = {}) {
  return (
    safeString(project.portfolioAngleDisplay) ||
    safeString(project.portfolioAngle) ||
    safeString(project.geminiFitSummary) ||
    safeString(project.fitSummary) ||
    "No portfolio angle available."
  );
}

function getFitSummary(project = {}) {
  return (
    safeString(project.fitSummaryDisplay) ||
    safeString(project.geminiFitSummary) ||
    safeString(project.fitSummary) ||
    safeString(project.aiFitSummary) ||
    "No fit summary available."
  );
}

function Section({ title, children }) {
  return (
    <section className="rounded-3xl border border-white/10 bg-black/20 p-5">
      <p className="mb-3 text-[11px] uppercase tracking-[0.22em] text-white/38">
        {title}
      </p>
      {children}
    </section>
  );
}

function ProjectModal({ project, onClose }) {
  if (!project) return null;

  const isGemini = Boolean(project.geminiAvailable || project.aiEnhanced);

  const displayTitle = getDisplayTitle(project);
  const baseTitle = getBaseTitle(project);
  const showBaseTitle = baseTitle && displayTitle !== baseTitle;

  const displayedScore = numberValue(
    isGemini ? project.score : project.deterministicScore || project.score
  );

  const confidence = numberValue(project.geminiConfidence || project.aiConfidence);

  const customFeatures = safeArray(project.customFeatures);
  const milestones = safeArray(project.suggestedMilestones);
  const whyRecommended = safeArray(project.whyRecommended);
  const technologies = safeArray(project.technologies);

  return (
    <div className="fixed inset-0 z-[140] overflow-y-auto bg-black/75 px-4 py-8 backdrop-blur-md">
      <div className="mx-auto max-w-5xl rounded-[2rem] border border-white/10 bg-[#0b0d10] p-6 shadow-soft sm:p-8">
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="mb-3 flex flex-wrap gap-2">
              <span className="rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1 text-xs font-bold text-brand-200">
                Rank #{project.displayRank || project.uiRank || "—"}
              </span>

              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold uppercase text-white/45">
                {project.projectType || "Project"}
              </span>

              <span
                className={`rounded-full border px-3 py-1 text-xs font-bold uppercase ${
                  isGemini
                    ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
                    : "border-yellow-400/30 bg-yellow-400/10 text-yellow-200"
                }`}
              >
                {isGemini ? "Gemini enhanced" : "Deterministic fallback"}
              </span>
            </div>

            <h2 className="max-w-3xl text-4xl font-black leading-tight text-white sm:text-5xl">
              {displayTitle}
            </h2>

            {showBaseTitle ? (
              <p className="mt-3 text-sm uppercase tracking-[0.18em] text-white/35">
                Base project: {baseTitle}
              </p>
            ) : null}

            <p className="mt-5 max-w-3xl text-base leading-7 text-white/65">
              {getDisplayBrief(project)}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="btn-secondary cursor-target shrink-0"
          >
            Close
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Section title={isGemini ? "AI Score" : "Deterministic Fit"}>
            <p className="text-4xl font-black text-white">
              {displayedScore.toFixed(1)}
            </p>
          </Section>

          <Section title={isGemini ? "AI Confidence" : "AI Personalization"}>
            {isGemini ? (
              <p className="text-4xl font-black text-white">
                {confidence.toFixed(0)}%
              </p>
            ) : (
              <p className="text-3xl font-black text-white/70">Not used</p>
            )}
          </Section>

          <Section title="Difficulty">
            <p className="text-2xl font-black text-white">
              {project.difficulty || "—"}
            </p>
          </Section>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <Section title={isGemini ? "Personalized build brief" : "Project brief"}>
            <p className="text-sm leading-7 text-white/68">
              {getDisplayBrief(project)}
            </p>
          </Section>

          <Section title="Portfolio angle">
            <p className="text-sm leading-7 text-white/68">
              {getPortfolioAngle(project)}
            </p>
          </Section>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <Section title="Fit summary">
            <p className="text-sm leading-7 text-white/68">
              {getFitSummary(project)}
            </p>
          </Section>

          <Section title={isGemini ? "Personalization status" : "Fallback status"}>
            <p className="text-sm leading-7 text-white/68">
              {isGemini
                ? "This recommendation was reranked and reshaped by Gemini using the user's selected preferences and personalization context."
                : "This recommendation was selected by rule-based deterministic scoring only. Gemini did not personalize this item."}
            </p>
          </Section>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <Section title={isGemini ? "Custom features" : "Core features"}>
            <ul className="space-y-3">
              {customFeatures.length ? (
                customFeatures.map((item, index) => (
                  <li key={`${item}-${index}`} className="text-sm leading-6 text-white/68">
                    {index + 1}. {item}
                  </li>
                ))
              ) : (
                <li className="text-sm text-white/50">
                  No feature breakdown available.
                </li>
              )}
            </ul>
          </Section>

          <Section title="Suggested milestones">
            <ul className="space-y-3">
              {milestones.length ? (
                milestones.map((item, index) => (
                  <li key={`${item}-${index}`} className="text-sm leading-6 text-white/68">
                    {index + 1}. {item}
                  </li>
                ))
              ) : (
                <li className="text-sm text-white/50">
                  No milestones available.
                </li>
              )}
            </ul>
          </Section>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <Section title="Why recommended">
            <ul className="space-y-3">
              {whyRecommended.length ? (
                whyRecommended.map((item, index) => (
                  <li key={`${item}-${index}`} className="text-sm leading-6 text-white/68">
                    {index + 1}. {item}
                  </li>
                ))
              ) : (
                <li className="text-sm text-white/50">
                  No explanation available.
                </li>
              )}
            </ul>
          </Section>

          <Section title="Technologies">
            <div className="flex flex-wrap gap-2">
              {technologies.length ? (
                technologies.map((tech) => (
                  <span key={tech} className="tag-pill">
                    {tech}
                  </span>
                ))
              ) : (
                <p className="text-sm text-white/50">No technologies listed.</p>
              )}
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}

export default ProjectModal;
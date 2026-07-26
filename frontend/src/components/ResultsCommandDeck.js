import { motion } from "framer-motion";

const filterOptions = [
  { value: "all", label: "All Matches" },
  { value: "strong", label: "Strong Match" },
  { value: "tech", label: "Tech Aligned" },
  { value: "interest", label: "Interest Fit" },
  { value: "easy", label: "Beginner Friendly" }
];

const sortOptions = [
  { value: "score-desc", label: "Best Score" },
  { value: "score-asc", label: "Lowest Score" },
  { value: "difficulty", label: "By Difficulty" },
  { value: "name", label: "A–Z" }
];

function toneClasses(tone) {
  if (tone === "strong") {
    return "border-brand-500/40 bg-brand-500/12 text-brand-100";
  }

  if (tone === "medium") {
    return "border-orange-300/25 bg-orange-300/10 text-orange-100";
  }

  return "border-white/10 bg-white/5 text-white/65";
}

function prettyLabel(value) {
  return String(value || "")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function PreferencePill({ label, value }) {
  if (!value) return null;

  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
      <p className="text-[10px] uppercase tracking-[0.22em] text-white/35">
        {label}
      </p>
      <p className="mt-2 text-sm font-medium text-white capitalize">
        {prettyLabel(value)}
      </p>
    </div>
  );
}

function ResultsCommandDeck({
  topProject,
  explanation,
  preferences,
  totalResults,
  visibleResults,
  activeFilter,
  setActiveFilter,
  sortMode,
  setSortMode,
  onOpenTopProject,
  onRegenerate
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 18, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="glass-panel relative overflow-hidden rounded-[2rem] p-6 shadow-soft sm:p-8"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-brand-500/10 via-transparent to-white/[0.03]" />

      <div className="relative grid gap-8 xl:grid-cols-[1.25fr_0.75fr]">
        <div>
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-2 text-[11px] uppercase tracking-[0.24em] text-brand-200">
              Top Match Spotlight
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[11px] uppercase tracking-[0.2em] text-white/45">
              {visibleResults} visible / {totalResults} total
            </span>
          </div>

          <h2 className="max-w-4xl text-3xl font-black leading-tight text-white sm:text-4xl">
            {topProject.title}
          </h2>

          <p className="mt-4 max-w-3xl text-sm leading-7 text-white/62 sm:text-base">
            {topProject.description}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            {explanation.scoreBreakdown.map((item) => (
              <div
                key={item.label}
                className={`rounded-full border px-4 py-2 text-sm font-medium ${toneClasses(item.tone)}`}
              >
                {item.label}: {item.value}%
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-[1.75rem] border border-white/10 bg-black/25 p-5">
            <p className="text-[10px] uppercase tracking-[0.22em] text-white/35">
              Why this recommendation stands out
            </p>

            <p className="mt-3 text-sm leading-7 text-white/66">
              {explanation.fitSummary}
            </p>

            <ul className="mt-4 space-y-3">
              {explanation.reasons.slice(0, 4).map((reason) => (
                <li
                  key={reason}
                  className="flex items-start gap-3 text-sm leading-7 text-white/62"
                >
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-brand-400" />
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={onOpenTopProject}
              className="btn-primary cursor-target"
            >
              Open Top Project
            </button>
            <button
              onClick={onRegenerate}
              className="btn-secondary cursor-target"
            >
              Re-score Matches
            </button>
          </div>

          <div className="mt-8 flex flex-wrap gap-2">
            {(topProject.technologies || []).slice(0, 6).map((tech) => (
              <span key={tech} className="tag-pill">
                {tech}
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
            <div className="rounded-[1.75rem] border border-white/10 bg-black/30 p-5">
              <p className="text-[10px] uppercase tracking-[0.22em] text-white/35">
                Recommendation Strength
              </p>
              <div className="mt-3 flex items-end justify-between gap-4">
                <p className="text-4xl font-black text-white">
                  {explanation.averageSignal}%
                </p>
                <span
                  className={`rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.18em] ${
                    explanation.matchTier === "strong"
                      ? "border-brand-500/35 bg-brand-500/10 text-brand-100"
                      : explanation.matchTier === "warm"
                        ? "border-orange-300/25 bg-orange-300/10 text-orange-100"
                        : "border-white/10 bg-white/5 text-white/60"
                  }`}
                >
                  {explanation.matchTier}
                </span>
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-white/10 bg-black/30 p-5">
              <p className="text-[10px] uppercase tracking-[0.22em] text-white/35">
                Backend Score
              </p>
              <p className="mt-3 text-4xl font-black text-white">
                {typeof topProject.score === "number"
                  ? topProject.score.toFixed(1)
                  : topProject.score || 0}
              </p>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-white/10 bg-black/30 p-5">
            <p className="text-[10px] uppercase tracking-[0.22em] text-white/35">
              View Controls
            </p>

            <div className="mt-4">
              <p className="mb-3 text-xs uppercase tracking-[0.16em] text-white/40">
                Filter
              </p>
              <div className="flex flex-wrap gap-2">
                {filterOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setActiveFilter(option.value)}
                    className={`cursor-target rounded-full border px-4 py-2 text-xs uppercase tracking-[0.16em] transition ${
                      activeFilter === option.value
                        ? "border-brand-500/40 bg-brand-500/10 text-brand-100 shadow-glow"
                        : "border-white/10 bg-white/5 text-white/55 hover:border-white/20 hover:text-white"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5">
              <p className="mb-3 text-xs uppercase tracking-[0.16em] text-white/40">
                Sort
              </p>
              <div className="flex flex-wrap gap-2">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setSortMode(option.value)}
                    className={`cursor-target rounded-full border px-4 py-2 text-xs uppercase tracking-[0.16em] transition ${
                      sortMode === option.value
                        ? "border-brand-500/40 bg-brand-500/10 text-brand-100 shadow-glow"
                        : "border-white/10 bg-white/5 text-white/55 hover:border-white/20 hover:text-white"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-white/10 bg-black/30 p-5">
            <p className="text-[10px] uppercase tracking-[0.22em] text-white/35">
              Current Preference Snapshot
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <PreferencePill label="Skill" value={preferences.skill} />
              <PreferencePill
                label="Difficulty"
                value={preferences.difficulty}
              />
              <PreferencePill label="Project Type" value={preferences.projectType} />
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {(preferences.languages || []).slice(0, 4).map((item) => (
                <span key={item} className="tag-pill">
                  {item}
                </span>
              ))}
              {(preferences.interests || []).slice(0, 4).map((item) => (
                <span key={item} className="tag-pill">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

export default ResultsCommandDeck;
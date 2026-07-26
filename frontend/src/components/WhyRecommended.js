import { motion } from "framer-motion";

function PreferencePill({ label, value }) {
  if (!value || (Array.isArray(value) && !value.length)) return null;

  return (
    <div className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3">
      <p className="text-[10px] uppercase tracking-[0.22em] text-white/38">
        {label}
      </p>
      <p className="mt-2 text-sm font-medium text-white">
        {Array.isArray(value) ? value.join(", ") : value}
      </p>
    </div>
  );
}

function WhyRecommended({ project, preferences, explanation }) {
  return (
    <motion.article
      whileHover={{ y: -3 }}
      className="glass-panel relative overflow-hidden rounded-[2rem] p-6 shadow-soft sm:p-8"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-brand-500/12 via-transparent to-white/[0.03]" />

      <div className="relative">
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <span className="rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-brand-300">
            Why this project was recommended
          </span>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-white/55">
            Top Match
          </span>
        </div>

        <h2 className="text-2xl font-black text-white sm:text-3xl">
          {project.title}
        </h2>

        <p className="mt-4 max-w-3xl text-sm leading-7 text-white/64">
          {explanation.fitSummary}
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <PreferencePill label="Skill Level" value={preferences.skill} />
          <PreferencePill label="Preferred Difficulty" value={preferences.difficulty} />
          <PreferencePill label="Project Type" value={preferences.projectType} />
          <PreferencePill
            label="Selected Technologies"
            value={(preferences.languages || []).slice(0, 4)}
          />
          <PreferencePill
            label="Selected Interests"
            value={(preferences.interests || []).slice(0, 4)}
          />
          <PreferencePill
            label="Matched Technologies"
            value={explanation.languageMatches.slice(0, 4)}
          />
        </div>

        <div className="mt-8">
          <p className="text-[11px] uppercase tracking-[0.24em] text-white/38">
            Recommendation signals
          </p>

          <div className="mt-4 space-y-3">
            {explanation.reasons.map((reason, index) => (
              <motion.div
                key={`${reason}-${index}`}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.08 * index, duration: 0.45 }}
                className="flex items-start gap-3 rounded-2xl border border-white/10 bg-black/25 px-4 py-4"
              >
                <div className="mt-1 h-2.5 w-2.5 rounded-full bg-brand-500 shadow-[0_0_14px_rgba(255,77,0,0.55)]" />
                <p className="text-sm leading-7 text-white/68">{reason}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.article>
  );
}

export default WhyRecommended;
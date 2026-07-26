import { motion } from "framer-motion";

function toneClasses(tone) {
  if (tone === "strong") {
    return "border-brand-500/35 bg-brand-500/12 text-brand-100";
  }

  if (tone === "medium") {
    return "border-orange-300/20 bg-orange-300/10 text-orange-100";
  }

  return "border-white/10 bg-white/5 text-white/72";
}

function ScoreBreakdown({ score, breakdown, fitSummary }) {
  return (
    <motion.aside
      whileHover={{ y: -3 }}
      className="glass-panel rounded-[2rem] p-6 shadow-soft sm:p-8"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.24em] text-white/38">
            Score Breakdown
          </p>
          <h3 className="mt-2 text-2xl font-bold text-white">Project fit analysis</h3>
        </div>

        <div className="rounded-3xl border border-white/10 bg-black/30 px-5 py-4 text-right">
          <p className="text-[10px] uppercase tracking-[0.18em] text-white/40">
            Final Score
          </p>
          <p className="mt-2 text-3xl font-black text-white">
            {Number(score || 0).toFixed(1)}
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        {breakdown.map((item) => (
          <div
            key={item.label}
            className={`rounded-full border px-4 py-2 text-sm font-medium ${toneClasses(item.tone)}`}
          >
            {item.label}: {item.value}%
          </div>
        ))}
      </div>

      <div className="mt-8 space-y-4">
        {breakdown.map((item, index) => (
          <div key={item.label}>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-white/68">{item.label}</span>
              <span className="font-medium text-white">{item.value}%</span>
            </div>

            <div className="h-2.5 rounded-full bg-white/10">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${item.value}%` }}
                transition={{ duration: 0.75, delay: 0.06 * index }}
                className="h-2.5 rounded-full bg-gradient-to-r from-brand-500 via-orange-400 to-orange-200"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-3xl border border-white/10 bg-black/25 p-5">
        <p className="text-[10px] uppercase tracking-[0.22em] text-white/38">
          Fit Summary
        </p>
        <p className="mt-3 text-sm leading-7 text-white/66">{fitSummary}</p>
      </div>
    </motion.aside>
  );
}

export default ScoreBreakdown;
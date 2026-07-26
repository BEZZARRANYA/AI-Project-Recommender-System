import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { fetchProjectAudit } from "../utils/projectsApi";

function SummaryCard({ label, value, subtext = "" }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-black/25 p-5">
      <p className="text-[10px] uppercase tracking-[0.22em] text-white/38">
        {label}
      </p>
      <p className="mt-3 text-4xl font-black text-white">{value}</p>
      {subtext ? <p className="mt-2 text-sm text-white/55">{subtext}</p> : null}
    </div>
  );
}

function DatasetAuditPage() {
  const [summary, setSummary] = useState({
    totalProjects: 0,
    strongCount: 0,
    needsImprovementCount: 0,
    weakCount: 0,
    avgMetadataScore: 0
  });
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    let mounted = true;

    async function loadAudit() {
      try {
        setLoading(true);
        setNotice("");

        const data = await fetchProjectAudit();

        if (!mounted) return;

        setSummary(data.summary);
        setProjects(data.projects);
      } catch (error) {
        if (!mounted) return;
        setNotice(error.message || "Failed to load dataset audit.");
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadAudit();

    return () => {
      mounted = false;
    };
  }, []);

  const filteredProjects = useMemo(() => {
    if (filter === "all") return projects;
    return projects.filter((project) => project.qualityBand === filter);
  }, [projects, filter]);

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
                Dataset Audit
              </p>
              <h1 className="text-4xl font-black leading-none text-white sm:text-5xl lg:text-6xl">
                Project metadata
                <span className="block text-white/45">quality control.</span>
              </h1>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-white/60 sm:text-base">
                Audit the project dataset before tuning the recommender. Weak metadata
                creates weak rankings, even if Gemini is working.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link to="/evaluation-lab" className="btn-secondary cursor-target">
                Evaluation Lab
              </Link>
              <Link to="/results" className="btn-primary cursor-target">
                Back to Results
              </Link>
            </div>
          </div>

          {notice ? (
            <div className="mb-6 rounded-2xl border border-brand-500/25 bg-brand-500/10 px-4 py-3 text-sm text-brand-100">
              {notice}
            </div>
          ) : null}

          {loading ? (
            <div className="glass-panel rounded-[2rem] p-10 text-center text-white/65">
              Loading dataset audit...
            </div>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <SummaryCard
                  label="Projects"
                  value={summary.totalProjects}
                  subtext="Total records in dataset"
                />
                <SummaryCard
                  label="Avg Metadata Score"
                  value={`${summary.avgMetadataScore}%`}
                  subtext="Overall metadata quality"
                />
                <SummaryCard
                  label="Strong"
                  value={summary.strongCount}
                  subtext="Projects with solid metadata"
                />
                <SummaryCard
                  label="Weak"
                  value={summary.weakCount}
                  subtext="Projects most likely hurting recommendations"
                />
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setFilter("all")}
                  className={`rounded-full px-4 py-2 text-sm ${
                    filter === "all"
                      ? "border border-brand-500/35 bg-brand-500/15 text-brand-200"
                      : "border border-white/10 bg-white/5 text-white"
                  }`}
                >
                  All
                </button>

                <button
                  type="button"
                  onClick={() => setFilter("Weak")}
                  className={`rounded-full px-4 py-2 text-sm ${
                    filter === "Weak"
                      ? "border border-red-400/35 bg-red-400/15 text-red-200"
                      : "border border-white/10 bg-white/5 text-white"
                  }`}
                >
                  Weak
                </button>

                <button
                  type="button"
                  onClick={() => setFilter("Needs improvement")}
                  className={`rounded-full px-4 py-2 text-sm ${
                    filter === "Needs improvement"
                      ? "border border-amber-400/35 bg-amber-400/15 text-amber-200"
                      : "border border-white/10 bg-white/5 text-white"
                  }`}
                >
                  Needs improvement
                </button>

                <button
                  type="button"
                  onClick={() => setFilter("Strong")}
                  className={`rounded-full px-4 py-2 text-sm ${
                    filter === "Strong"
                      ? "border border-emerald-400/35 bg-emerald-400/15 text-emerald-200"
                      : "border border-white/10 bg-white/5 text-white"
                  }`}
                >
                  Strong
                </button>
              </div>

              <div className="glass-panel mt-8 rounded-[2rem] p-6 shadow-soft sm:p-8">
                <div className="mb-5 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white">
                    Project audit table
                  </h2>
                  <p className="text-sm text-white/40">
                    {filteredProjects.length} project
                    {filteredProjects.length !== 1 ? "s" : ""}
                  </p>
                </div>

                {!filteredProjects.length ? (
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-6 text-white/60">
                    No projects found for this filter.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full border-separate border-spacing-y-3">
                      <thead>
                        <tr className="text-left text-xs uppercase tracking-[0.18em] text-white/35">
                          <th className="px-4 py-2">Project</th>
                          <th className="px-4 py-2">Score</th>
                          <th className="px-4 py-2">Band</th>
                          <th className="px-4 py-2">Difficulty</th>
                          <th className="px-4 py-2">Type</th>
                          <th className="px-4 py-2">Missing Fields</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredProjects.map((project) => (
                          <tr
                            key={project.projectId}
                            className="rounded-2xl border border-white/10 bg-black/20 text-white"
                          >
                            <td className="rounded-l-2xl px-4 py-4 align-top">
                              <div className="font-semibold">{project.title}</div>
                              <div className="mt-1 text-sm text-white/50">
                                {project.technologies?.slice(0, 4).join(", ") || "No technologies"}
                              </div>
                            </td>
                            <td className="px-4 py-4 text-white/80">
                              {project.metadataScore}%
                            </td>
                            <td className="px-4 py-4 text-white/80">
                              {project.qualityBand}
                            </td>
                            <td className="px-4 py-4 text-white/80">
                              {project.difficulty || "—"}
                            </td>
                            <td className="px-4 py-4 text-white/80">
                              {project.projectType || "—"}
                            </td>
                            <td className="rounded-r-2xl px-4 py-4 text-white/80">
                              {project.missingFields?.length
                                ? project.missingFields.join(", ")
                                : "None"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </motion.section>
      </div>
    </main>
  );
}

export default DatasetAuditPage;
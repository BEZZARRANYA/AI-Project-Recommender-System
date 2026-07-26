import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  fetchProjects,
  fetchProjectById,
  updateProject
} from "../utils/projectsApi";

function normalizeCsv(value) {
  return Array.isArray(value) ? value.join(", ") : "";
}

function buildFormFromProject(project = {}) {
  return {
    title: project.title || "",
    description: project.description || "",
    difficulty: project.difficulty || "",
    projectType: project.projectType || "",
    technologies: normalizeCsv(project.technologies),
    categories: normalizeCsv(project.categories),
    features: project.features || "",
    learning: project.learning || ""
  };
}

function DatasetEditorPage() {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [selectedProject, setSelectedProject] = useState(null);
  const [form, setForm] = useState(buildFormFromProject());
  const [loadingList, setLoadingList] = useState(true);
  const [loadingProject, setLoadingProject] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadProjects() {
      try {
        setLoadingList(true);
        setNotice("");

        const data = await fetchProjects();

        if (!mounted) return;

        setProjects(data);

        if (data.length > 0) {
          const firstId = String(data[0]._id);
          setSelectedProjectId(firstId);
        }
      } catch (error) {
        if (!mounted) return;
        setNotice(error.message || "Failed to load projects.");
      } finally {
        if (mounted) {
          setLoadingList(false);
        }
      }
    }

    loadProjects();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadProject() {
      if (!selectedProjectId) return;

      try {
        setLoadingProject(true);
        setNotice("");

        const data = await fetchProjectById(selectedProjectId);

        if (!mounted) return;

        setSelectedProject(data);
        setForm(buildFormFromProject(data));
      } catch (error) {
        if (!mounted) return;
        setNotice(error.message || "Failed to load project details.");
      } finally {
        if (mounted) {
          setLoadingProject(false);
        }
      }
    }

    loadProject();

    return () => {
      mounted = false;
    };
  }, [selectedProjectId]);

  const sortedProjects = useMemo(() => {
    return [...projects].sort((a, b) =>
      String(a?.title || "").localeCompare(String(b?.title || ""))
    );
  }, [projects]);

  function handleFieldChange(field, value) {
    setForm((prev) => ({
      ...prev,
      [field]: value
    }));
  }

  async function handleSave(e) {
    e.preventDefault();

    if (!selectedProjectId) return;

    try {
      setSaving(true);
      setNotice("");

      const payload = {
        ...form,
        technologies: form.technologies,
        categories: form.categories
      };

      const updated = await updateProject(selectedProjectId, payload);

      setSelectedProject(updated);
      setForm(buildFormFromProject(updated));

      setProjects((prev) =>
        prev.map((project) =>
          String(project._id) === String(selectedProjectId) ? updated : project
        )
      );

      setNotice("Project updated successfully.");
    } catch (error) {
      setNotice(error.message || "Failed to save project.");
    } finally {
      setSaving(false);
    }
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
            <div className="max-w-3xl">
              <p className="mb-3 text-xs uppercase tracking-[0.3em] text-brand-400">
                Dataset Editor
              </p>
              <h1 className="text-4xl font-black leading-none text-white sm:text-5xl lg:text-6xl">
                Edit project metadata
                <span className="block text-white/45">without leaving the app.</span>
              </h1>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-white/60 sm:text-base">
                Fix weak titles, descriptions, categories, stacks, and learning paths so the
                recommender stops ranking on trash metadata.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link to="/dataset-audit" className="btn-secondary cursor-target">
                Dataset Audit
              </Link>
              <Link to="/evaluation-lab" className="btn-primary cursor-target">
                Evaluation Lab
              </Link>
            </div>
          </div>

          {notice ? (
            <div className="mb-6 rounded-2xl border border-brand-500/25 bg-brand-500/10 px-4 py-3 text-sm text-brand-100">
              {notice}
            </div>
          ) : null}

          <div className="grid gap-8 xl:grid-cols-[0.8fr_1.2fr]">
            <div className="glass-panel rounded-[2rem] p-6 shadow-soft sm:p-8">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Projects</h2>
                <p className="text-sm text-white/40">
                  {sortedProjects.length} record{sortedProjects.length !== 1 ? "s" : ""}
                </p>
              </div>

              {loadingList ? (
                <div className="rounded-2xl border border-white/10 bg-black/20 p-6 text-white/60">
                  Loading project list...
                </div>
              ) : (
                <div className="max-h-[70vh] space-y-3 overflow-y-auto pr-1">
                  {sortedProjects.map((project) => {
                    const active = String(project._id) === String(selectedProjectId);

                    return (
                      <button
                        key={project._id}
                        type="button"
                        onClick={() => setSelectedProjectId(String(project._id))}
                        className={`w-full rounded-2xl border px-4 py-4 text-left transition ${
                          active
                            ? "border-brand-500/35 bg-brand-500/10 text-white"
                            : "border-white/10 bg-black/20 text-white/80 hover:bg-white/[0.04]"
                        }`}
                      >
                        <div className="font-semibold">{project.title}</div>
                        <div className="mt-1 text-sm text-white/45">
                          {project.projectType || "Project"} • {project.difficulty || "—"}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="glass-panel rounded-[2rem] p-6 shadow-soft sm:p-8">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Editor</h2>
                <p className="text-sm text-white/40">
                  {selectedProject?.title || "No project selected"}
                </p>
              </div>

              {loadingProject ? (
                <div className="rounded-2xl border border-white/10 bg-black/20 p-6 text-white/60">
                  Loading project details...
                </div>
              ) : !selectedProject ? (
                <div className="rounded-2xl border border-white/10 bg-black/20 p-6 text-white/60">
                  Select a project from the left to edit it.
                </div>
              ) : (
                <form onSubmit={handleSave} className="space-y-5">
                  <div>
                    <label className="mb-2 block text-sm text-white/70">Title</label>
                    <input
                      type="text"
                      value={form.title}
                      onChange={(e) => handleFieldChange("title", e.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-white/70">Description</label>
                    <textarea
                      value={form.description}
                      onChange={(e) => handleFieldChange("description", e.target.value)}
                      className="min-h-[120px] w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none"
                    />
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm text-white/70">Difficulty</label>
                      <input
                        type="text"
                        value={form.difficulty}
                        onChange={(e) => handleFieldChange("difficulty", e.target.value)}
                        className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm text-white/70">Project Type</label>
                      <input
                        type="text"
                        value={form.projectType}
                        onChange={(e) => handleFieldChange("projectType", e.target.value)}
                        className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm text-white/70">
                        Technologies (comma separated)
                      </label>
                      <textarea
                        value={form.technologies}
                        onChange={(e) => handleFieldChange("technologies", e.target.value)}
                        className="min-h-[90px] w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm text-white/70">
                        Categories (comma separated)
                      </label>
                      <textarea
                        value={form.categories}
                        onChange={(e) => handleFieldChange("categories", e.target.value)}
                        className="min-h-[90px] w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-white/70">Features</label>
                    <textarea
                      value={form.features}
                      onChange={(e) => handleFieldChange("features", e.target.value)}
                      className="min-h-[120px] w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-white/70">Learning Path</label>
                    <textarea
                      value={form.learning}
                      onChange={(e) => handleFieldChange("learning", e.target.value)}
                      className="min-h-[120px] w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={saving}
                      className="btn-primary cursor-target"
                    >
                      {saving ? "Saving..." : "Save Project"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </motion.section>
      </div>
    </main>
  );
}

export default DatasetEditorPage;
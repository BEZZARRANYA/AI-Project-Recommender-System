// frontend/src/pages/QuestionnairePage.js
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  fetchRecommendations,
  savePreferences,
  saveRecommendations
} from "../utils/api";

const skillOptions = ["beginner", "intermediate", "advanced"];
const difficultyOptions = ["easy", "medium", "hard"];
const projectTypeOptions = [
  "web application",
  "mobile application",
  "ai tool",
  "data dashboard",
  "game",
  "research project",
  "automation tool"
];

const interestOptions = [
  "web",
  "ai",
  "machine learning",
  "mobile",
  "games",
  "cybersecurity",
  "education",
  "e-commerce",
  "data visualization",
  "finance",
  "health",
  "productivity",
  "automation",
  "analytics"
];

const languageOptions = [
  "javascript",
  "python",
  "react",
  "node.js",
  "html",
  "css",
  "flutter",
  "dart",
  "c#",
  "unity",
  "mongodb",
  "postgresql"
];

const industryOptions = [
  "education",
  "finance",
  "health",
  "e-commerce",
  "gaming",
  "cybersecurity",
  "productivity",
  "social media",
  "local business",
  "personal use"
];

const portfolioGoalOptions = [
  "impress recruiters",
  "learn fundamentals",
  "build something useful",
  "prepare for thesis/demo",
  "start a business idea",
  "practice full-stack development"
];

const timeAvailableOptions = [
  "1 week",
  "2-3 weeks",
  "1 month",
  "2+ months"
];

const buildStyleOptions = [
  "frontend-heavy",
  "backend-heavy",
  "AI-heavy",
  "data-heavy",
  "mobile-heavy",
  "balanced"
];

const initialForm = {
  skill: "beginner",
  difficulty: "easy",
  projectType: "web application",
  interests: ["web"],
  languages: ["javascript"],

  preferredIndustry: "",
  portfolioGoal: "",
  timeAvailable: "",
  buildStyle: "",
  personalContext: ""
};

function ToggleButton({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition ${
        active
          ? "border-brand-500/50 bg-brand-500/15 text-white shadow-[0_0_24px_rgba(255,77,0,0.16)]"
          : "border-white/10 bg-white/[0.03] text-white/62 hover:border-white/20 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

function FieldSection({ eyebrow, title, children }) {
  return (
    <section className="glass-panel rounded-[2rem] p-6 shadow-soft sm:p-8">
      <p className="mb-3 text-xs uppercase tracking-[0.28em] text-brand-400">
        {eyebrow}
      </p>
      <h2 className="mb-5 text-2xl font-black text-white">{title}</h2>
      {children}
    </section>
  );
}

function QuestionnairePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function setSingle(field, value) {
    setForm((prev) => ({
      ...prev,
      [field]: value
    }));
  }

  function toggleArray(field, value) {
    setForm((prev) => {
      const current = Array.isArray(prev[field]) ? prev[field] : [];
      const exists = current.includes(value);

      const next = exists
        ? current.filter((item) => item !== value)
        : [...current, value];

      return {
        ...prev,
        [field]: next
      };
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.interests.length || !form.languages.length) {
      setError("Select at least one interest and one language.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      savePreferences(form);

      const results = await fetchRecommendations(form);
      saveRecommendations(results);

      navigate("/results");
    } catch (err) {
      setError(err.message || "Failed to fetch recommendations.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden pb-20 pt-10">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-[-10%] top-[8%] h-72 w-72 rounded-full bg-brand-500/10 blur-3xl" />
        <div className="absolute bottom-[12%] right-[-6%] h-80 w-80 rounded-full bg-orange-400/10 blur-3xl" />
      </div>

      <div className="container-shell">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <div className="mb-8 max-w-4xl">
            <p className="mb-3 text-xs uppercase tracking-[0.3em] text-brand-400">
              Project Matching
            </p>
            <h1 className="text-4xl font-black leading-none text-white sm:text-5xl lg:text-6xl">
              Build a recommendation
              <span className="block text-white/45">that actually fits you.</span>
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-white/60 sm:text-base">
              Choose your technical preferences, then add optional personal context so the
              AI can shape the project brief around your goals.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <FieldSection eyebrow="Core Fit" title="Skill and project level">
              <div className="grid gap-4 md:grid-cols-3">
                {skillOptions.map((item) => (
                  <ToggleButton
                    key={item}
                    active={form.skill === item}
                    onClick={() => setSingle("skill", item)}
                  >
                    {item}
                  </ToggleButton>
                ))}
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-3">
                {difficultyOptions.map((item) => (
                  <ToggleButton
                    key={item}
                    active={form.difficulty === item}
                    onClick={() => setSingle("difficulty", item)}
                  >
                    {item}
                  </ToggleButton>
                ))}
              </div>
            </FieldSection>

            <FieldSection eyebrow="Format" title="Project type">
              <div className="grid gap-4 md:grid-cols-3">
                {projectTypeOptions.map((item) => (
                  <ToggleButton
                    key={item}
                    active={form.projectType === item}
                    onClick={() => setSingle("projectType", item)}
                  >
                    {item}
                  </ToggleButton>
                ))}
              </div>
            </FieldSection>

            <FieldSection eyebrow="Domain" title="Interests">
              <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
                {interestOptions.map((item) => (
                  <ToggleButton
                    key={item}
                    active={form.interests.includes(item)}
                    onClick={() => toggleArray("interests", item)}
                  >
                    {item}
                  </ToggleButton>
                ))}
              </div>
            </FieldSection>

            <FieldSection eyebrow="Stack" title="Languages and tools">
              <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
                {languageOptions.map((item) => (
                  <ToggleButton
                    key={item}
                    active={form.languages.includes(item)}
                    onClick={() => toggleArray("languages", item)}
                  >
                    {item}
                  </ToggleButton>
                ))}
              </div>
            </FieldSection>

            <FieldSection eyebrow="Personalization" title="Make the brief unique">
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm text-white/70">
                    Preferred industry
                  </label>
                  <select
                    value={form.preferredIndustry}
                    onChange={(e) => setSingle("preferredIndustry", e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none"
                  >
                    <option value="">No preference</option>
                    {industryOptions.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm text-white/70">
                    Portfolio goal
                  </label>
                  <select
                    value={form.portfolioGoal}
                    onChange={(e) => setSingle("portfolioGoal", e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none"
                  >
                    <option value="">No preference</option>
                    {portfolioGoalOptions.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm text-white/70">
                    Time available
                  </label>
                  <select
                    value={form.timeAvailable}
                    onChange={(e) => setSingle("timeAvailable", e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none"
                  >
                    <option value="">No preference</option>
                    {timeAvailableOptions.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm text-white/70">
                    Build style
                  </label>
                  <select
                    value={form.buildStyle}
                    onChange={(e) => setSingle("buildStyle", e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none"
                  >
                    <option value="">No preference</option>
                    {buildStyleOptions.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-5">
                <label className="mb-2 block text-sm text-white/70">
                  Personal context
                </label>
                <textarea
                  value={form.personalContext}
                  onChange={(e) => setSingle("personalContext", e.target.value)}
                  placeholder="Example: I want something useful for students, or I want a project that looks good for internships."
                  className="min-h-[120px] w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none placeholder:text-white/30"
                />
              </div>
            </FieldSection>

            {error ? (
              <div className="rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                {error}
              </div>
            ) : null}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary cursor-target"
              >
                {submitting ? "Generating..." : "Generate Recommendations"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </main>
  );
}

export default QuestionnairePage;
// frontend/src/pages/ReportPage.js
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { buildReportData, numberValue, safeArray } from "../utils/reportBuilder";

function Pill({ children }) {
  return (
    <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/70 print:border-gray-300 print:bg-white print:text-gray-700">
      {children}
    </span>
  );
}

function ReportSection({ title, eyebrow, children, breakBefore = false }) {
  return (
    <section
      className={`report-section rounded-3xl border border-white/10 bg-white/[0.035] p-6 print:rounded-none print:border-gray-300 print:bg-white print:p-0 ${
        breakBefore ? "print:break-before-page" : ""
      }`}
    >
      {eyebrow ? (
        <p className="mb-2 text-[11px] uppercase tracking-[0.24em] text-brand-300 print:text-gray-500">
          {eyebrow}
        </p>
      ) : null}

      <h2 className="text-2xl font-black text-white print:text-xl print:text-gray-950">
        {title}
      </h2>

      <div className="mt-5">{children}</div>
    </section>
  );
}

function Field({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4 print:rounded-none print:border-gray-200 print:bg-white print:p-3">
      <p className="text-[10px] uppercase tracking-[0.18em] text-white/35 print:text-gray-500">
        {label}
      </p>
      <p className="mt-2 text-sm font-bold text-white print:text-gray-950">
        {value || "Not specified"}
      </p>
    </div>
  );
}

function NumberCard({ label, value, note }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-5 print:rounded-none print:border-gray-200 print:bg-white print:p-4">
      <p className="text-[10px] uppercase tracking-[0.18em] text-white/35 print:text-gray-500">
        {label}
      </p>
      <p className="mt-2 text-4xl font-black text-white print:text-3xl print:text-gray-950">
        {value}
      </p>
      {note ? (
        <p className="mt-2 text-sm text-white/50 print:text-gray-600">{note}</p>
      ) : null}
    </div>
  );
}

function ListBlock({ items, fallback }) {
  const cleanItems = safeArray(items).filter(Boolean);

  if (!cleanItems.length) {
    return <p className="text-sm leading-7 text-white/60 print:text-gray-700">{fallback}</p>;
  }

  return (
    <ol className="space-y-3">
      {cleanItems.map((item, index) => (
        <li
          key={`${item}-${index}`}
          className="text-sm leading-7 text-white/70 print:text-gray-800"
        >
          <span className="font-black text-white print:text-gray-950">
            {index + 1}.
          </span>{" "}
          {item}
        </li>
      ))}
    </ol>
  );
}

function EmptyReportState({ error, onBack }) {
  return (
    <main className="min-h-screen bg-[#050608] px-6 py-24 text-white">
      <div className="mx-auto max-w-3xl rounded-[2rem] border border-white/10 bg-white/[0.035] p-8 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-brand-300">
          Report Export
        </p>
        <h1 className="mt-4 text-4xl font-black">No report data available</h1>
        <p className="mt-4 text-sm leading-7 text-white/60">
          {error || "Generate recommendations first, then export the report."}
        </p>
        <button
          type="button"
          onClick={onBack}
          className="btn-primary cursor-target mt-8"
        >
          Back to Results
        </button>
      </div>
    </main>
  );
}

function ReportPage() {
  const navigate = useNavigate();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const data = buildReportData();
      setReport(data);
    } catch (err) {
      setError(err.message || "Failed to build report.");
    } finally {
      setLoading(false);
    }
  }, []);

  function handlePrint() {
    window.print();
  }

  function handleDownloadJSON() {
    if (!report) return;

    const json = JSON.stringify(report, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `recommendation-report-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#050608] px-6 py-24 text-white">
        <div className="mx-auto max-w-3xl rounded-[2rem] border border-white/10 bg-white/[0.035] p-8 text-center">
          <p className="text-lg font-semibold text-white/70">Loading report...</p>
        </div>
      </main>
    );
  }

  if (error || !report) {
    return <EmptyReportState error={error} onBack={() => navigate("/results")} />;
  }

  const top = report.topRecommendation;
  const metadata = report.evaluationMetadata;

  return (
    <main className="report-page min-h-screen bg-[#050608] px-6 py-10 text-white print:bg-white print:px-0 print:py-0 print:text-gray-950">
      <style>
        {`
          @media print {
            @page {
              size: A4;
              margin: 16mm;
            }

            html,
            body,
            #root {
              background: white !important;
              color: #111827 !important;
            }

            nav,
            .print-hidden,
            .target-cursor,
            .cursor-target,
            .fixed,
            button {
              display: none !important;
            }

            .report-page {
              background: white !important;
            }

            .report-container {
              max-width: none !important;
              width: 100% !important;
              padding: 0 !important;
              margin: 0 !important;
            }

            .report-section {
              margin-bottom: 18px !important;
              box-shadow: none !important;
              page-break-inside: avoid;
            }

            .report-grid {
              display: grid !important;
              grid-template-columns: 1fr 1fr !important;
              gap: 12px !important;
            }

            .report-full {
              grid-column: 1 / -1 !important;
            }
          }
        `}
      </style>

      <div className="report-container mx-auto max-w-6xl">
        <div className="print-hidden mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => navigate("/results")}
            className="btn-secondary cursor-target"
          >
            Back to Results
          </button>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleDownloadJSON}
              className="btn-secondary cursor-target"
            >
              Download JSON
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="btn-primary cursor-target"
            >
              Print / Save as PDF
            </button>
          </div>
        </div>

        <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 shadow-soft print:rounded-none print:border-0 print:bg-white print:p-0 print:shadow-none">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.32em] text-brand-300 print:text-gray-500">
                AI Project Recommender
              </p>

              <h1 className="mt-4 text-5xl font-black leading-none text-white print:text-4xl print:text-gray-950">
                Recommendation
                <span className="block text-white/45 print:text-gray-600">
                  Development Report
                </span>
              </h1>

              <p className="mt-5 max-w-3xl text-sm leading-7 text-white/60 print:text-gray-700">
                A structured project brief generated from the user’s technical
                preferences, personalization context, deterministic scoring, and
                Gemini-assisted recommendation layer.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-black/20 p-5 print:rounded-none print:border-gray-300 print:bg-white">
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/35 print:text-gray-500">
                Generated
              </p>
              <p className="mt-2 text-sm font-bold text-white print:text-gray-950">
                {metadata.generatedDateFormatted}
              </p>

              <p className="mt-4 text-[10px] uppercase tracking-[0.2em] text-white/35 print:text-gray-500">
                Method
              </p>
              <p className="mt-2 text-sm font-bold text-white print:text-gray-950">
                {metadata.method}
              </p>
            </div>
          </div>
        </section>

        <div className="report-grid mt-6 grid gap-6 lg:grid-cols-2">
          <ReportSection title="User Profile" eyebrow="Input">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Skill level" value={report.user.skillLevel} />
              <Field label="Difficulty" value={report.user.difficulty} />
              <Field label="Project type" value={report.user.projectType} />

              <div className="rounded-2xl border border-white/10 bg-black/20 p-4 print:rounded-none print:border-gray-200 print:bg-white print:p-3">
                <p className="text-[10px] uppercase tracking-[0.18em] text-white/35 print:text-gray-500">
                  Tools
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {report.user.languagesTools.length ? (
                    report.user.languagesTools.map((item) => (
                      <Pill key={item}>{item}</Pill>
                    ))
                  ) : (
                    <p className="text-sm text-white/55 print:text-gray-700">
                      Not specified
                    </p>
                  )}
                </div>
              </div>

              <div className="sm:col-span-2 rounded-2xl border border-white/10 bg-black/20 p-4 print:rounded-none print:border-gray-200 print:bg-white print:p-3">
                <p className="text-[10px] uppercase tracking-[0.18em] text-white/35 print:text-gray-500">
                  Interests
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {report.user.interests.length ? (
                    report.user.interests.map((item) => <Pill key={item}>{item}</Pill>)
                  ) : (
                    <p className="text-sm text-white/55 print:text-gray-700">
                      Not specified
                    </p>
                  )}
                </div>
              </div>
            </div>
          </ReportSection>

          <ReportSection title="Personalization Context" eyebrow="User Goal">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Industry" value={report.personalization.industry} />
              <Field label="Portfolio goal" value={report.personalization.portfolioGoal} />
              <Field label="Build style" value={report.personalization.buildStyle} />
              <Field label="Time available" value={report.personalization.timeAvailable} />

              <div className="sm:col-span-2 rounded-2xl border border-white/10 bg-black/20 p-4 print:rounded-none print:border-gray-200 print:bg-white print:p-3">
                <p className="text-[10px] uppercase tracking-[0.18em] text-white/35 print:text-gray-500">
                  Personal context
                </p>
                <p className="mt-2 text-sm leading-7 text-white/70 print:text-gray-800">
                  {report.personalization.personalContext}
                </p>
              </div>
            </div>
          </ReportSection>

          <ReportSection
            title="Top Recommendation"
            eyebrow="Primary Output"
            breakBefore
          >
            <div className="mb-5 flex flex-wrap gap-2">
              <Pill>{top.projectType}</Pill>
              <Pill>{top.difficulty}</Pill>
              <Pill>{top.method}</Pill>
            </div>

            <h3 className="text-3xl font-black text-white print:text-2xl print:text-gray-950">
              {top.personalizedTitle}
            </h3>

            {top.baseProject !== top.personalizedTitle ? (
              <p className="mt-2 text-xs uppercase tracking-[0.18em] text-white/35 print:text-gray-500">
                Base project: {top.baseProject}
              </p>
            ) : null}

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <NumberCard
                label={top.isGemini ? "AI Score" : "Deterministic Fit"}
                value={numberValue(top.score).toFixed(1)}
              />

              <NumberCard
                label={top.isGemini ? "AI Confidence" : "AI Personalization"}
                value={top.isGemini ? `${numberValue(top.aiConfidence).toFixed(0)}%` : "Not used"}
              />
            </div>

            <div className="mt-5">
              <p className="text-[10px] uppercase tracking-[0.18em] text-white/35 print:text-gray-500">
                Technologies
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {safeArray(top.technologies).length ? (
                  safeArray(top.technologies).map((tech) => (
                    <Pill key={tech}>{tech}</Pill>
                  ))
                ) : (
                  <p className="text-sm text-white/55 print:text-gray-700">
                    No technologies listed.
                  </p>
                )}
              </div>
            </div>
          </ReportSection>

          <ReportSection title="Project Brief" eyebrow="Development Direction">
            <div className="space-y-5">
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-white/35 print:text-gray-500">
                  Description
                </p>
                <p className="mt-2 text-sm leading-7 text-white/70 print:text-gray-800">
                  {top.description}
                </p>
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-white/35 print:text-gray-500">
                  Portfolio angle
                </p>
                <p className="mt-2 text-sm leading-7 text-white/70 print:text-gray-800">
                  {top.portfolioAngle}
                </p>
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-white/35 print:text-gray-500">
                  Fit summary
                </p>
                <p className="mt-2 text-sm leading-7 text-white/70 print:text-gray-800">
                  {top.fitSummary}
                </p>
              </div>
            </div>
          </ReportSection>

          <ReportSection title="Implementation Plan" eyebrow="Build Plan" breakBefore>
            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <h3 className="mb-4 text-lg font-black text-white print:text-gray-950">
                  Custom Features
                </h3>
                <ListBlock
                  items={report.implementationPlan.customFeatures}
                  fallback="Suggested features will be generated based on project scope."
                />
              </div>

              <div>
                <h3 className="mb-4 text-lg font-black text-white print:text-gray-950">
                  Suggested Milestones
                </h3>
                <ListBlock
                  items={report.implementationPlan.suggestedMilestones}
                  fallback="Suggested milestones will be generated based on project scope."
                />
              </div>
            </div>
          </ReportSection>

          <ReportSection title="Why Recommended" eyebrow="Reasoning">
            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <h3 className="mb-4 text-lg font-black text-white print:text-gray-950">
                  Deterministic Reasoning
                </h3>
                <ListBlock
                  items={report.whyRecommended.deterministicReasoning}
                  fallback="The project matches the selected technical preferences."
                />
              </div>

              <div>
                <h3 className="mb-4 text-lg font-black text-white print:text-gray-950">
                  Gemini Reasoning
                </h3>
                <p className="text-sm leading-7 text-white/70 print:text-gray-800">
                  {report.whyRecommended.geminiReasoning}
                </p>
              </div>
            </div>
          </ReportSection>

          <ReportSection title="Alternative Recommendations" eyebrow="Top 3 Alternatives">
            {report.alternatives.length ? (
              <div className="grid gap-4">
                {report.alternatives.map((project) => (
                  <div
                    key={`${project.rank}-${project.personalizedTitle}`}
                    className="rounded-2xl border border-white/10 bg-black/20 p-4 print:rounded-none print:border-gray-200 print:bg-white"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.18em] text-brand-300 print:text-gray-500">
                          Rank #{project.rank} · {project.method}
                        </p>
                        <h3 className="mt-2 text-xl font-black text-white print:text-gray-950">
                          {project.personalizedTitle}
                        </h3>
                        {project.baseProject !== project.personalizedTitle ? (
                          <p className="mt-1 text-xs uppercase tracking-[0.14em] text-white/35 print:text-gray-500">
                            Base: {project.baseProject}
                          </p>
                        ) : null}
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 print:rounded-none print:border-gray-200 print:bg-white">
                        <p className="text-[10px] uppercase tracking-[0.18em] text-white/35 print:text-gray-500">
                          Score/Fit
                        </p>
                        <p className="text-xl font-black text-white print:text-gray-950">
                          {numberValue(project.score).toFixed(1)}
                        </p>
                      </div>
                    </div>

                    <p className="mt-4 text-sm leading-7 text-white/60 print:text-gray-700">
                      {project.description}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm leading-7 text-white/60 print:text-gray-700">
                No alternative recommendations available.
              </p>
            )}
          </ReportSection>

          <ReportSection title="Evaluation Summary" eyebrow="Metadata">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Field label="Primary method" value={metadata.method} />
              <Field
                label="Total recommendations"
                value={String(metadata.totalRecommendations)}
              />
              <Field
                label="Gemini recommendations"
                value={String(metadata.geminiRecommendations)}
              />
              <Field
                label="Fallback recommendations"
                value={String(metadata.fallbackRecommendations)}
              />
            </div>

            <p className="mt-5 text-sm leading-7 text-white/60 print:text-gray-700">
              Feedback analytics are available in the Research Insights page. This
              report is generated from the current local recommendation state and is
              intended as a printable project development brief.
            </p>
          </ReportSection>
        </div>
      </div>
    </main>
  );
}

export default ReportPage;
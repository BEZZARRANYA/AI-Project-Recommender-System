function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function toArray(value) {
  return Array.isArray(value) ? value : [];
}

function clampScore(value, max = 100) {
  return Math.max(18, Math.min(value, max));
}

function getDifficultyBand(skill) {
  const map = {
    beginner: "easy",
    intermediate: "medium",
    advanced: "hard"
  };

  return map[normalize(skill)] || "";
}

export function formatProjectScore(project) {
  if (typeof project?.score === "number") {
    return project.score.toFixed(1);
  }

  return project?.score || 0;
}

export function formatAiConfidence(confidence) {
  return Number.isFinite(Number(confidence)) ? `${Number(confidence)}%` : "Unavailable";
}

export function sortRecommendedProjects(projects = []) {
  return [...projects].sort((a, b) => {
    const aAiRank = Number.isFinite(Number(a?.aiRank)) ? Number(a.aiRank) : null;
    const bAiRank = Number.isFinite(Number(b?.aiRank)) ? Number(b.aiRank) : null;

    if (aAiRank !== null && bAiRank !== null && aAiRank !== bAiRank) {
      return aAiRank - bAiRank;
    }

    if (aAiRank !== null && bAiRank === null) {
      return -1;
    }

    if (aAiRank === null && bAiRank !== null) {
      return 1;
    }

    return (b?.score || 0) - (a?.score || 0);
  });
}

export function buildLocalExplanation(project, preferences = {}) {
  const normalizedLanguages = toArray(preferences.languages).map(normalize);
  const normalizedInterests = toArray(preferences.interests).map(normalize);

  const projectTechnologies = toArray(project?.technologies);
  const projectCategories = toArray(project?.categories);

  const languageMatches = projectTechnologies.filter((tech) =>
    normalizedLanguages.includes(normalize(tech))
  );

  const interestMatches = projectCategories.filter((category) =>
    normalizedInterests.includes(normalize(category))
  );

  const difficultyMatch =
    normalize(project?.difficulty) === normalize(preferences?.difficulty);

  const skillAligned =
    getDifficultyBand(preferences?.skill) === normalize(project?.difficulty);

  const projectTypeMatch =
    normalize(project?.projectType) === normalize(preferences?.projectType);

  const scoreBreakdown = [
    {
      label: "Skill Match",
      value: clampScore(skillAligned ? 94 : 52),
      tone: skillAligned ? "strong" : "soft"
    },
    {
      label: "Difficulty Fit",
      value: clampScore(difficultyMatch ? 96 : 56),
      tone: difficultyMatch ? "strong" : "medium"
    },
    {
      label: "Tech Alignment",
      value: clampScore(
        normalizedLanguages.length
          ? Math.round((languageMatches.length / normalizedLanguages.length) * 100)
          : 45
      ),
      tone:
        languageMatches.length >= 2
          ? "strong"
          : languageMatches.length
            ? "medium"
            : "soft"
    },
    {
      label: "Interest Fit",
      value: clampScore(
        normalizedInterests.length
          ? Math.round((interestMatches.length / normalizedInterests.length) * 100)
          : 45
      ),
      tone:
        interestMatches.length >= 2
          ? "strong"
          : interestMatches.length
            ? "medium"
            : "soft"
    },
    {
      label: "Project Type",
      value: clampScore(projectTypeMatch ? 94 : 55),
      tone: projectTypeMatch ? "strong" : "soft"
    }
  ];

  const reasons = [];

  if (difficultyMatch) {
    reasons.push(
      `Its difficulty level matches your preference for ${preferences?.difficulty}.`
    );
  }

  if (skillAligned) {
    reasons.push(
      `It aligns well with your ${preferences?.skill} skill level.`
    );
  }

  if (projectTypeMatch) {
    reasons.push(
      `The concept fits your preferred ${preferences?.projectType} project direction.`
    );
  }

  if (languageMatches.length) {
    reasons.push(
      `It uses technologies you selected, including ${languageMatches.slice(0, 3).join(", ")}.`
    );
  }

  if (interestMatches.length) {
    reasons.push(
      `Its focus overlaps with your interests, especially ${interestMatches.slice(0, 3).join(", ")}.`
    );
  }

  if (!reasons.length) {
    reasons.push(
      "It still ranks as a strong option based on your selected direction."
    );
  }

  const strongestSignals = scoreBreakdown
    .filter((item) => item.value >= 70)
    .sort((a, b) => b.value - a.value)
    .slice(0, 3)
    .map((item) => item.label);

  const fitSummary = strongestSignals.length
    ? `Strong local match on ${strongestSignals.join(", ").toLowerCase()}.`
    : "Balanced local match across your profile.";

  const averageSignal =
    scoreBreakdown.reduce((sum, item) => sum + item.value, 0) /
    scoreBreakdown.length;

  return {
    source: "local",
    isAiEnhanced: false,
    confidence: null,
    scoreBreakdown,
    fitSummary,
    primaryReason: reasons[0] || fitSummary,
    strengths: reasons.slice(0, 3),
    concerns: [],
    averageSignal: Math.round(averageSignal)
  };
}

export function getProjectInsight(project, preferences = {}) {
  const fallback = buildLocalExplanation(project, preferences);

  const hasAiSummary =
    typeof project?.aiFitSummary === "string" && project.aiFitSummary.trim();
  const hasAiReason =
    typeof project?.aiReason === "string" && project.aiReason.trim();
  const aiStrengths = toArray(project?.aiStrengths).filter(Boolean);
  const aiConcerns = toArray(project?.aiConcerns).filter(Boolean);
  const hasAiConfidence = Number.isFinite(Number(project?.aiConfidence));

  const isAiEnhanced =
    Boolean(project?.aiEnhanced) ||
    hasAiSummary ||
    hasAiReason ||
    aiStrengths.length > 0 ||
    aiConcerns.length > 0 ||
    hasAiConfidence;

  return {
    ...fallback,
    source: isAiEnhanced ? "gemini" : "fallback",
    isAiEnhanced,
    confidence: hasAiConfidence ? Number(project.aiConfidence) : null,
    fitSummary: hasAiSummary ? project.aiFitSummary : "AI summary unavailable. Showing deterministic shortlist.",
    primaryReason: hasAiReason ? project.aiReason : "Gemini was unavailable for this request.",
    strengths: aiStrengths.length ? aiStrengths : fallback.strengths,
    concerns: aiConcerns.length ? aiConcerns : fallback.concerns
  };
}
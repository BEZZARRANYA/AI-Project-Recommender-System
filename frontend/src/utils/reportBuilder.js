// frontend/src/utils/reportBuilder.js

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

function readJsonFromLocalStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function getDisplayTitle(project = {}) {
  return (
    safeString(project.displayTitle) ||
    safeString(project.personalizedTitle) ||
    safeString(project.title) ||
    safeString(project.baseTitle) ||
    "Untitled Project"
  );
}

function getBaseProject(project = {}) {
  return (
    safeString(project.baseTitle) ||
    safeString(project.title) ||
    getDisplayTitle(project)
  );
}

function getDescription(project = {}) {
  return (
    safeString(project.displayBrief) ||
    safeString(project.personalizedBrief) ||
    safeString(project.description) ||
    "No project description available."
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

function getPortfolioAngle(project = {}) {
  return (
    safeString(project.portfolioAngleDisplay) ||
    safeString(project.portfolioAngle) ||
    safeString(project.geminiFitSummary) ||
    "No portfolio angle available."
  );
}

function normalizeProject(project = {}, index = 0) {
  const isGemini = Boolean(project.geminiAvailable || project.aiEnhanced);

  const score = numberValue(project.score, 0);
  const deterministicScore = numberValue(
    project.deterministicScore || project.score,
    score
  );

  const aiConfidence = isGemini
    ? numberValue(project.geminiConfidence || project.aiConfidence, 0)
    : 0;

  const explicitRank = Number(project.displayRank || project.uiRank || project.rank);

  return {
    raw: project,
    originalIndex: index,

    id:
      safeString(project._id) ||
      safeString(project.id) ||
      safeString(project.projectKey) ||
      `${getDisplayTitle(project)}-${index}`,

    rank: Number.isFinite(explicitRank) ? explicitRank : null,

    personalizedTitle: getDisplayTitle(project),
    baseProject: getBaseProject(project),
    score,
    deterministicScore,
    aiConfidence,
    description: getDescription(project),
    portfolioAngle: getPortfolioAngle(project),
    fitSummary: getFitSummary(project),
    isGemini,
    method: isGemini ? "Gemini" : "Fallback",

    projectType: safeString(project.projectType) || "Project",
    difficulty: safeString(project.difficulty) || "Not specified",

    technologies: safeArray(project.technologies),
    customFeatures: safeArray(project.customFeatures),
    suggestedMilestones: safeArray(project.suggestedMilestones),
    whyRecommended: safeArray(project.whyRecommended),
    deterministicSignals: safeArray(project.deterministicSignals)
  };
}

function sortProjects(projects = []) {
  return safeArray(projects)
    .map(normalizeProject)
    .sort((a, b) => {
      const aHasRank = Number.isFinite(Number(a.rank));
      const bHasRank = Number.isFinite(Number(b.rank));

      if (aHasRank && bHasRank && a.rank !== b.rank) {
        return a.rank - b.rank;
      }

      if (aHasRank !== bHasRank) {
        return aHasRank ? -1 : 1;
      }

      if (a.isGemini !== b.isGemini) {
        return a.isGemini ? -1 : 1;
      }

      const aComparableScore = a.isGemini ? a.score : a.deterministicScore;
      const bComparableScore = b.isGemini ? b.score : b.deterministicScore;

      if (aComparableScore !== bComparableScore) {
        return bComparableScore - aComparableScore;
      }

      return a.originalIndex - b.originalIndex;
    })
    .map((project, index) => ({
      ...project,
      rank: index + 1
    }));
}

function normalizePreferences(preferences = {}) {
  return {
    user: {
      skillLevel:
        safeString(preferences.skillLevel) ||
        safeString(preferences.skill) ||
        "Not specified",

      difficulty: safeString(preferences.difficulty) || "Not specified",

      projectType: safeString(preferences.projectType) || "Not specified",

      interests:
        safeArray(preferences.interests).length
          ? safeArray(preferences.interests)
          : safeArray(preferences.selectedInterests),

      languagesTools:
        safeArray(preferences.languagesTools).length
          ? safeArray(preferences.languagesTools)
          : safeArray(preferences.technologies).length
            ? safeArray(preferences.technologies)
            : safeArray(preferences.languages).length
              ? safeArray(preferences.languages)
              : safeArray(preferences.tools)
    },

    personalization: {
      industry:
        safeString(preferences.preferredIndustry) ||
        safeString(preferences.industry) ||
        "No preference",

      portfolioGoal:
        safeString(preferences.portfolioGoal) ||
        safeString(preferences.goal) ||
        "Not specified",

      buildStyle: safeString(preferences.buildStyle) || "No preference",

      timeAvailable:
        safeString(preferences.timeAvailable) ||
        safeString(preferences.time) ||
        "No preference",

      personalContext:
        safeString(preferences.personalContext) ||
        safeString(preferences.context) ||
        "No additional context provided."
    }
  };
}

function buildImplementationPlan(topProject) {
  return {
    customFeatures: topProject?.customFeatures?.length
      ? topProject.customFeatures
      : ["Suggested features will be refined based on the selected project scope."],

    suggestedMilestones: topProject?.suggestedMilestones?.length
      ? topProject.suggestedMilestones
      : [
          "Define project scope and data model.",
          "Build the core frontend and backend structure.",
          "Implement main recommendation or dashboard logic.",
          "Test, polish, and prepare the final demo."
        ]
  };
}

function buildWhyRecommended(topProject) {
  return {
    deterministicReasoning: topProject?.deterministicSignals?.length
      ? topProject.deterministicSignals
      : topProject?.whyRecommended?.length
        ? topProject.whyRecommended
        : [
            "The project matches the selected difficulty, project type, interests, or technology stack."
          ],

    geminiReasoning: topProject?.isGemini
      ? topProject.fitSummary
      : "Gemini personalization was not used for this recommendation.",

    method: topProject?.method || "Fallback"
  };
}

function buildAlternatives(projects = []) {
  return projects.slice(1, 4).map((project) => ({
    rank: project.rank,
    personalizedTitle: project.personalizedTitle,
    baseProject: project.baseProject,
    score: project.isGemini ? project.score : project.deterministicScore,
    aiConfidence: project.aiConfidence,
    method: project.method,
    projectType: project.projectType,
    description: project.description
  }));
}

export function buildReportData() {
  const savedPreferences = readJsonFromLocalStorage("userPreferences", null);
  const savedRecommendations = readJsonFromLocalStorage("recommendedProjects", []);
  const runMetadata = readJsonFromLocalStorage("recommendationRunMetadata", null);

  const rankedProjects = sortProjects(savedRecommendations);

  if (!rankedProjects.length) {
    throw new Error("No saved recommendations found. Generate recommendations first.");
  }

  const topRecommendation = rankedProjects[0];
  const normalizedPreferences = normalizePreferences(savedPreferences || {});

  return {
    user: normalizedPreferences.user,

    personalization: normalizedPreferences.personalization,

    topRecommendation: {
      personalizedTitle: topRecommendation.personalizedTitle,
      baseProject: topRecommendation.baseProject,
      score: topRecommendation.isGemini
        ? topRecommendation.score
        : topRecommendation.deterministicScore,
      deterministicScore: topRecommendation.deterministicScore,
      aiConfidence: topRecommendation.aiConfidence,
      description: topRecommendation.description,
      portfolioAngle: topRecommendation.portfolioAngle,
      fitSummary: topRecommendation.fitSummary,
      isGemini: topRecommendation.isGemini,
      method: topRecommendation.method,
      projectType: topRecommendation.projectType,
      difficulty: topRecommendation.difficulty,
      technologies: topRecommendation.technologies
    },

    implementationPlan: buildImplementationPlan(topRecommendation),

    whyRecommended: buildWhyRecommended(topRecommendation),

    alternatives: buildAlternatives(rankedProjects),

    evaluationMetadata: {
      runId: runMetadata?.runId || "",
      generatedDate: runMetadata?.generatedAt || new Date().toISOString(),
      generatedDateFormatted:
        runMetadata?.generatedDateFormatted || new Date().toLocaleString(),
      method: topRecommendation.method,
      totalRecommendations: rankedProjects.length,
      geminiRecommendations: rankedProjects.filter((project) => project.isGemini).length,
      fallbackRecommendations: rankedProjects.filter((project) => !project.isGemini).length,
      backendPersisted: Boolean(runMetadata?.runId && runMetadata?.persisted)
    }
  };
}

export { safeArray, safeString, numberValue };
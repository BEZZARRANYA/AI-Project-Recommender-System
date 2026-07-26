// backend/services/recommendationRunService.js
const crypto = require("crypto");
const RecommendationRun = require("../models/RecommendationRun");

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

function createRunId() {
  if (typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `run_${Date.now()}_${crypto.randomBytes(8).toString("hex")}`;
}

function isGeminiRecommendation(project = {}) {
  return Boolean(project.geminiAvailable || project.aiEnhanced);
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

function normalizeRecommendation(project = {}, index = 0) {
  const isGemini = isGeminiRecommendation(project);

  const displayRank = numberValue(
    project.displayRank || project.uiRank || project.rank || index + 1,
    index + 1
  );

  return {
    ...project,

    displayRank,
    uiRank: displayRank,

    displayTitle: getDisplayTitle(project),

    baseTitle:
      safeString(project.baseTitle) ||
      safeString(project.title) ||
      getDisplayTitle(project),

    score: numberValue(project.score, 0),
    deterministicScore: numberValue(project.deterministicScore || project.score, 0),
    geminiScore: numberValue(project.geminiScore, 0),

    geminiConfidence: isGemini
      ? numberValue(project.geminiConfidence || project.aiConfidence, 0)
      : 0,

    aiConfidence: isGemini
      ? numberValue(project.aiConfidence || project.geminiConfidence, 0)
      : 0,

    geminiAvailable: isGemini,
    aiEnhanced: isGemini
  };
}

function sortRecommendationsForStorage(recommendations = []) {
  return safeArray(recommendations)
    .map(normalizeRecommendation)
    .sort((a, b) => {
      const aRank = numberValue(a.displayRank, 9999);
      const bRank = numberValue(b.displayRank, 9999);

      if (aRank !== bRank) {
        return aRank - bRank;
      }

      const aGemini = isGeminiRecommendation(a);
      const bGemini = isGeminiRecommendation(b);

      if (aGemini !== bGemini) {
        return aGemini ? -1 : 1;
      }

      return numberValue(b.score, 0) - numberValue(a.score, 0);
    })
    .map((project, index) => ({
      ...project,
      displayRank: index + 1,
      uiRank: index + 1
    }));
}

function normalizePreferences(preferences = {}) {
  return {
    skill: safeString(preferences.skill || preferences.skillLevel),
    difficulty: safeString(preferences.difficulty),
    projectType: safeString(preferences.projectType),

    interests: safeArray(preferences.interests || preferences.selectedInterests),

    languages: safeArray(preferences.languages),
    languagesTools: safeArray(
      preferences.languagesTools ||
        preferences.technologies ||
        preferences.languages ||
        preferences.tools
    ),

    preferredIndustry: safeString(preferences.preferredIndustry || preferences.industry),
    portfolioGoal: safeString(preferences.portfolioGoal || preferences.goal),
    timeAvailable: safeString(preferences.timeAvailable || preferences.time),
    buildStyle: safeString(preferences.buildStyle),
    personalContext: safeString(preferences.personalContext || preferences.context)
  };
}

function extractGeminiMetadata(metadata = {}, recommendations = []) {
  const geminiRecommendations = safeArray(recommendations).filter(isGeminiRecommendation);

  const fallbackRecommendations = safeArray(recommendations).filter(
    (project) => !isGeminiRecommendation(project)
  );

  return {
    geminiUsed: Boolean(
      metadata.geminiUsed ||
        metadata.used ||
        metadata.aiUsed ||
        geminiRecommendations.length > 0
    ),

    geminiModel: safeString(
      metadata.geminiModel ||
        metadata.model ||
        metadata.aiModel ||
        process.env.GEMINI_MODEL
    ),

    geminiReason: safeString(metadata.geminiReason || metadata.reason),

    fallbackUsed: fallbackRecommendations.length > 0,

    totalRecommendations: safeArray(recommendations).length,
    geminiRecommendations: geminiRecommendations.length,
    fallbackRecommendations: fallbackRecommendations.length
  };
}

async function persistRecommendationRun({
  sessionId = "",
  userPreferences = {},
  recommendations = [],
  metadata = {}
}) {
  const normalizedRecommendations = sortRecommendationsForStorage(recommendations);
  const topRecommendation = normalizedRecommendations[0] || {};
  const runId = createRunId();
  const geminiMetadata = extractGeminiMetadata(metadata, normalizedRecommendations);

  const run = await RecommendationRun.create({
    runId,
    sessionId: safeString(sessionId),
    userPreferences,
    normalizedPreferences: normalizePreferences(userPreferences),
    recommendations: normalizedRecommendations,
    topRecommendation,
    ...geminiMetadata
  });

  return {
    runId: run.runId,
    generatedAt: run.createdAt,
    generatedDateFormatted: run.createdAt.toLocaleString(),

    metadata: {
      runId: run.runId,
      generatedAt: run.createdAt,
      generatedDateFormatted: run.createdAt.toLocaleString(),
      ...geminiMetadata
    },

    recommendations: normalizedRecommendations
  };
}

module.exports = {
  persistRecommendationRun,
  sortRecommendationsForStorage
};
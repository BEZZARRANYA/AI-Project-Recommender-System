// backend/routes/recommend.js
const express = require("express");
const router = express.Router();

const Project = require("../models/Project");
const {
  scoreBaselineProjects,
  pickBaselineWindow,
  buildHybridRecommendations
} = require("../services/hybridRecommender");
const { persistRecommendationRun } = require("../services/recommendationRunService");

function safeString(value) {
  return String(value || "").trim();
}

function toArray(value) {
  return Array.isArray(value)
    ? value.map((item) => safeString(item)).filter(Boolean)
    : [];
}

function round1(value) {
  return Math.round(Number(value || 0) * 10) / 10;
}

function computeFinalScore(project) {
  const deterministicScore = Number(project.deterministicScore || project.score || 0);
  const geminiScore = Number(project.geminiScore || 0);

  if (project.aiEnhanced) {
    return round1(deterministicScore * 0.45 + geminiScore * 0.55);
  }

  return round1(deterministicScore);
}

function normalizePreferencePayload(body = {}) {
  return {
    skill: safeString(body.skill),
    difficulty: safeString(body.difficulty),
    interests: toArray(body.interests),
    projectType: safeString(body.projectType),
    languages: toArray(body.languages),

    preferredIndustry: safeString(body.preferredIndustry),
    portfolioGoal: safeString(body.portfolioGoal),
    timeAvailable: safeString(body.timeAvailable),
    buildStyle: safeString(body.buildStyle),
    personalContext: safeString(body.personalContext)
  };
}

function projectToClient(project, index) {
  const baseTitle = safeString(project.title);
  const personalizedTitle = safeString(project.personalizedTitle);
  const isGeminiEnhanced = Boolean(project.aiEnhanced);

  return {
    _id: String(project._id || project.id || ""),
    uiRank: index + 1,
    displayRank: index + 1,

    title: baseTitle,
    baseTitle,
    personalizedTitle: personalizedTitle || baseTitle,
    displayTitle: personalizedTitle || baseTitle,

    description: safeString(project.description),
    displayBrief:
      safeString(project.personalizedBrief) ||
      safeString(project.description),

    difficulty: safeString(project.difficulty),
    projectType: safeString(project.projectType),

    technologies: toArray(project.technologies),
    categories: toArray(project.categories),
    features: safeString(project.features),
    learning: safeString(project.learning),

    score: computeFinalScore(project),
    deterministicScore: round1(project.deterministicScore || project.score || 0),
    geminiScore: round1(project.geminiScore || 0),

    geminiConfidence: isGeminiEnhanced
      ? round1(project.geminiConfidence || project.aiConfidence || 0)
      : 0,

    aiConfidence: isGeminiEnhanced
      ? round1(project.aiConfidence || project.geminiConfidence || 0)
      : 0,

    geminiAvailable: isGeminiEnhanced,
    aiEnhanced: isGeminiEnhanced,
    aiMode: safeString(project.aiMode),
    aiReason: safeString(project.aiReason),

    geminiFitSummary: safeString(project.aiFitSummary || project.fitSummary),
    fitSummary: safeString(project.aiFitSummary || project.fitSummary),
    fitSummaryDisplay: safeString(project.aiFitSummary || project.fitSummary),

    whyRecommended: toArray(project.whyRecommended),
    aiStrengths: toArray(project.aiStrengths),
    deterministicSignals: toArray(project.deterministicSignals),
    scoreBreakdown: project.scoreBreakdown || {},

    personalizedBrief: safeString(project.personalizedBrief),
    customFeatures: toArray(project.customFeatures),
    suggestedMilestones: toArray(project.suggestedMilestones),
    portfolioAngle: safeString(project.portfolioAngle),
    portfolioAngleDisplay: safeString(project.portfolioAngle)
  };
}

function sortClientRecommendations(projects = []) {
  return [...projects]
    .sort((a, b) => {
      const aGemini = Boolean(a.geminiAvailable || a.aiEnhanced);
      const bGemini = Boolean(b.geminiAvailable || b.aiEnhanced);

      // Gemini-personalized projects must stay above deterministic fallback projects.
      // Otherwise fallback 100.0 scores pollute the top recommendation/report.
      if (aGemini !== bGemini) {
        return aGemini ? -1 : 1;
      }

      const aScore = Number(a.score || 0);
      const bScore = Number(b.score || 0);

      if (aScore !== bScore) {
        return bScore - aScore;
      }

      const aDeterministic = Number(a.deterministicScore || 0);
      const bDeterministic = Number(b.deterministicScore || 0);

      if (aDeterministic !== bDeterministic) {
        return bDeterministic - aDeterministic;
      }

      return Number(a.uiRank || 9999) - Number(b.uiRank || 9999);
    })
    .map((project, index) => ({
      ...project,
      uiRank: index + 1,
      displayRank: index + 1
    }));
}

function extractHybridMetadata(hybridResult = {}, finalProjects = []) {
  const geminiProjects = finalProjects.filter(
    (project) => project.geminiAvailable || project.aiEnhanced
  );

  const fallbackProjects = finalProjects.filter(
    (project) => !(project.geminiAvailable || project.aiEnhanced)
  );

  return {
    geminiUsed: Boolean(
      hybridResult.geminiUsed ||
        hybridResult.used ||
        hybridResult.aiUsed ||
        geminiProjects.length > 0
    ),

    geminiModel: safeString(
      hybridResult.geminiModel ||
        hybridResult.model ||
        hybridResult.aiModel ||
        process.env.GEMINI_MODEL
    ),

    geminiReason: safeString(
      hybridResult.geminiReason ||
        hybridResult.reason ||
        hybridResult.error ||
        ""
    ),

    fallbackUsed: fallbackProjects.length > 0,

    totalRecommendations: finalProjects.length,
    geminiRecommendations: geminiProjects.length,
    fallbackRecommendations: fallbackProjects.length
  };
}

router.post("/", async (req, res) => {
  try {
    const userPreferences = normalizePreferencePayload(req.body || {});

    const projects = await Project.find().lean();

    if (!projects.length) {
      return res.json({
        runId: "",
        metadata: {
          persisted: false,
          totalRecommendations: 0,
          geminiRecommendations: 0,
          fallbackRecommendations: 0,
          reason: "No projects found in database."
        },
        recommendations: []
      });
    }

    const scoredProjects = scoreBaselineProjects(projects, userPreferences);
    const shortlistedProjects = pickBaselineWindow(scoredProjects);

    const hybridResult = await buildHybridRecommendations({
      userPreferences,
      shortlistedProjects
    });

    const rawHybridProjects = Array.isArray(hybridResult?.projects)
      ? hybridResult.projects
      : [];

    const clientProjects = rawHybridProjects.map(projectToClient);
    const finalProjects = sortClientRecommendations(clientProjects);

    const sessionId =
      safeString(req.body.sessionId) ||
      safeString(req.body.feedbackSessionId) ||
      safeString(req.headers["x-session-id"]);

    const hybridMetadata = extractHybridMetadata(hybridResult, finalProjects);

    try {
      const runRecord = await persistRecommendationRun({
        sessionId,
        userPreferences,
        recommendations: finalProjects,
        metadata: hybridMetadata
      });

      return res.json({
        runId: runRecord.runId,
        metadata: {
          ...runRecord.metadata,
          persisted: true
        },
        recommendations: runRecord.recommendations
      });
    } catch (persistError) {
      console.error("Recommendation run persistence error:", persistError);

      // Do not break recommendations if persistence fails.
      return res.json({
        runId: "",
        metadata: {
          ...hybridMetadata,
          persisted: false,
          persistenceError: persistError.message || "Failed to persist recommendation run."
        },
        recommendations: finalProjects
      });
    }
  } catch (error) {
    console.error("Recommendation route error:", error);

    return res.status(500).json({
      error: "Failed to generate recommendations."
    });
  }
});

module.exports = router;
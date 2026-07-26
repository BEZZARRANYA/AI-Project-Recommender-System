// backend/routes/feedback.js
const express = require("express");
const router = express.Router();
const RecommendationFeedback = require("../models/RecommendationFeedback");

function safeString(value) {
  return String(value || "").trim();
}

function numberValue(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeFeedbackType(value) {
  const raw = safeString(value).toLowerCase();

  if (["helpful", "like", "positive"].includes(raw)) {
    return "helpful";
  }

  if (
    [
      "not_relevant",
      "not-relevant",
      "not relevant",
      "irrelevant",
      "negative",
      "dislike"
    ].includes(raw)
  ) {
    return "not_relevant";
  }

  if (
    [
      "favorite",
      "favourite",
      "save_favorite",
      "save-favorite",
      "save favorite",
      "saved",
      "bookmark"
    ].includes(raw)
  ) {
    return "favorite";
  }

  return "";
}

function getNestedProject(body = {}) {
  return body.project || body.recommendation || body.item || {};
}

function buildProjectKey(body = {}) {
  const nested = getNestedProject(body);

  return (
    safeString(body.projectKey) ||
    safeString(body.projectId) ||
    safeString(body._id) ||
    safeString(body.id) ||
    safeString(nested.projectKey) ||
    safeString(nested._id) ||
    safeString(nested.id) ||
    safeString(nested.baseTitle) ||
    safeString(nested.title) ||
    safeString(nested.personalizedTitle) ||
    safeString(nested.displayTitle)
  );
}

function buildProjectTitle(body = {}) {
  const nested = getNestedProject(body);

  return (
    safeString(body.projectTitle) ||
    safeString(body.personalizedTitle) ||
    safeString(body.title) ||
    safeString(nested.personalizedTitle) ||
    safeString(nested.displayTitle) ||
    safeString(nested.title) ||
    safeString(nested.baseTitle)
  );
}

function normalizeFeedbackPayload(body = {}) {
  const nested = getNestedProject(body);

  const feedbackType = normalizeFeedbackType(
    body.feedbackType || body.type || body.action || body.feedback
  );

  const projectKey = buildProjectKey(body);
  const projectTitle = buildProjectTitle(body);

  return {
    runId: safeString(body.runId),

    sessionId: safeString(body.sessionId),

    projectId:
      safeString(body.projectId) ||
      safeString(body._id) ||
      safeString(body.id) ||
      safeString(nested._id) ||
      safeString(nested.id),

    projectKey,
    projectTitle,

    baseTitle:
      safeString(body.baseTitle) ||
      safeString(nested.baseTitle) ||
      safeString(nested.title),

    personalizedTitle:
      safeString(body.personalizedTitle) ||
      safeString(nested.personalizedTitle) ||
      safeString(nested.displayTitle),

    projectType:
      safeString(body.projectType) ||
      safeString(nested.projectType),

    difficulty:
      safeString(body.difficulty) ||
      safeString(nested.difficulty),

    feedbackType,

    note: safeString(body.note || body.comment || body.message),

    score: numberValue(body.score ?? nested.score, 0),

    deterministicScore: numberValue(
      body.deterministicScore ?? nested.deterministicScore,
      0
    ),

    geminiScore: numberValue(body.geminiScore ?? nested.geminiScore, 0),

    aiConfidence: numberValue(
      body.aiConfidence ?? body.geminiConfidence ?? nested.aiConfidence,
      0
    ),

    geminiConfidence: numberValue(
      body.geminiConfidence ?? body.aiConfidence ?? nested.geminiConfidence,
      0
    ),

    aiEnhanced: Boolean(body.aiEnhanced ?? nested.aiEnhanced),
    geminiAvailable: Boolean(body.geminiAvailable ?? nested.geminiAvailable),

    userPreferences: body.userPreferences || {},
    recommendationSnapshot: nested && Object.keys(nested).length ? nested : body
  };
}

function createEmptyStats(row = {}) {
  return {
    runId: safeString(row.runId),
    projectKey: safeString(row.projectKey),
    projectTitle: safeString(row.projectTitle),
    baseTitle: safeString(row.baseTitle),
    personalizedTitle: safeString(row.personalizedTitle),
    projectType: safeString(row.projectType),
    difficulty: safeString(row.difficulty),

    responses: 0,
    totalResponses: 0,
    helpful: 0,
    helpfulCount: 0,
    notRelevant: 0,
    notRelevantCount: 0,
    favorites: 0,
    favoriteCount: 0,

    aiConfidenceTotal: 0,
    aiConfidenceCount: 0,
    aiConfidence: 0,
    geminiConfidence: 0,
    averageConfidence: 0,

    latestAt: row.createdAt || null
  };
}

function buildSummary(feedbackRows = []) {
  const statsMap = new Map();

  const totals = {
    totalResponses: 0,
    helpful: 0,
    notRelevant: 0,
    favorites: 0,
    projectsWithFeedback: 0
  };

  feedbackRows.forEach((row) => {
    const projectKey =
      safeString(row.projectKey) ||
      safeString(row.projectId) ||
      safeString(row.projectTitle) ||
      "unknown-project";

    const statsKey = `${safeString(row.runId) || "global"}::${projectKey}`;

    if (!statsMap.has(statsKey)) {
      statsMap.set(statsKey, createEmptyStats({ ...row, projectKey }));
    }

    const stats = statsMap.get(statsKey);

    stats.responses += 1;
    stats.totalResponses += 1;
    totals.totalResponses += 1;

    if (row.feedbackType === "helpful") {
      stats.helpful += 1;
      stats.helpfulCount += 1;
      totals.helpful += 1;
    }

    if (row.feedbackType === "not_relevant") {
      stats.notRelevant += 1;
      stats.notRelevantCount += 1;
      totals.notRelevant += 1;
    }

    if (row.feedbackType === "favorite") {
      stats.favorites += 1;
      stats.favoriteCount += 1;
      totals.favorites += 1;
    }

    const confidence = numberValue(row.geminiConfidence || row.aiConfidence, 0);

    if (confidence > 0) {
      stats.aiConfidenceTotal += confidence;
      stats.aiConfidenceCount += 1;
    }

    if (!stats.latestAt || new Date(row.createdAt) > new Date(stats.latestAt)) {
      stats.latestAt = row.createdAt;
    }
  });

  const projectStats = Array.from(statsMap.values())
    .map((stats) => {
      const average =
        stats.aiConfidenceCount > 0
          ? stats.aiConfidenceTotal / stats.aiConfidenceCount
          : 0;

      return {
        ...stats,
        aiConfidence: Number(average.toFixed(1)),
        geminiConfidence: Number(average.toFixed(1)),
        averageConfidence: Number(average.toFixed(1))
      };
    })
    .sort((a, b) => {
      if (b.responses !== a.responses) return b.responses - a.responses;
      if (b.helpful !== a.helpful) return b.helpful - a.helpful;
      return safeString(a.projectTitle).localeCompare(safeString(b.projectTitle));
    });

  totals.projectsWithFeedback = projectStats.filter(
    (project) => project.responses > 0
  ).length;

  const helpfulRate =
    totals.totalResponses > 0
      ? (totals.helpful / totals.totalResponses) * 100
      : 0;

  const favoriteRate =
    totals.totalResponses > 0
      ? (totals.favorites / totals.totalResponses) * 100
      : 0;

  const notRelevantRate =
    totals.totalResponses > 0
      ? (totals.notRelevant / totals.totalResponses) * 100
      : 0;

  return {
    summary: {
      ...totals,
      helpfulRate: Number(helpfulRate.toFixed(1)),
      favoriteRate: Number(favoriteRate.toFixed(1)),
      notRelevantRate: Number(notRelevantRate.toFixed(1))
    },

    totalResponses: totals.totalResponses,
    helpful: totals.helpful,
    notRelevant: totals.notRelevant,
    favorites: totals.favorites,
    projectsWithFeedback: totals.projectsWithFeedback,

    helpfulRate: Number(helpfulRate.toFixed(1)),
    favoriteRate: Number(favoriteRate.toFixed(1)),
    notRelevantRate: Number(notRelevantRate.toFixed(1)),

    projectStats,
    projects: projectStats,
    rows: projectStats
  };
}

router.post("/", async (req, res) => {
  try {
    const payload = normalizeFeedbackPayload(req.body || {});

    if (!payload.feedbackType) {
      return res.status(400).json({
        error:
          "Invalid feedback type. Expected helpful, not_relevant, or favorite."
      });
    }

    if (!payload.projectKey || !payload.projectTitle) {
      return res.status(400).json({
        error: "Missing project identity. projectKey/projectTitle is required."
      });
    }

    const feedback = await RecommendationFeedback.create(payload);

    return res.status(201).json({
      ok: true,
      message: "Feedback saved.",
      feedbackId: feedback._id,
      runId: feedback.runId
    });
  } catch (error) {
    console.error("Feedback POST error:", error);

    return res.status(500).json({
      error: "Failed to save feedback."
    });
  }
});

router.get("/summary", async (req, res) => {
  try {
    const filter = {};

    if (safeString(req.query.runId)) {
      filter.runId = safeString(req.query.runId);
    }

    const feedbackRows = await RecommendationFeedback.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    const summary = buildSummary(feedbackRows);

    return res.json(summary);
  } catch (error) {
    console.error("Feedback summary error:", error);

    return res.status(500).json({
      error: "Failed to load feedback summary."
    });
  }
});

router.get("/", async (req, res) => {
  try {
    const filter = {};

    if (safeString(req.query.runId)) {
      filter.runId = safeString(req.query.runId);
    }

    const feedbackRows = await RecommendationFeedback.find(filter)
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    return res.json({
      count: feedbackRows.length,
      feedback: feedbackRows
    });
  } catch (error) {
    console.error("Feedback list error:", error);

    return res.status(500).json({
      error: "Failed to load feedback."
    });
  }
});

module.exports = router;
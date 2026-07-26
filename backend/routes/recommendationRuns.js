// backend/routes/recommendationRuns.js
const express = require("express");
const RecommendationRun = require("../models/RecommendationRun");

const router = express.Router();

function numberValue(value, fallback = 20) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

router.get("/", async (req, res) => {
  try {
    const limit = Math.min(Math.max(numberValue(req.query.limit, 20), 1), 100);

    const runs = await RecommendationRun.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .select({
        runId: 1,
        sessionId: 1,
        normalizedPreferences: 1,
        topRecommendation: 1,
        geminiUsed: 1,
        geminiModel: 1,
        geminiReason: 1,
        fallbackUsed: 1,
        totalRecommendations: 1,
        geminiRecommendations: 1,
        fallbackRecommendations: 1,
        createdAt: 1,
        updatedAt: 1
      })
      .lean();

    return res.json({
      count: runs.length,
      runs
    });
  } catch (error) {
    console.error("Recommendation runs list error:", error);

    return res.status(500).json({
      error: "Failed to load recommendation runs."
    });
  }
});

router.get("/:runId", async (req, res) => {
  try {
    const run = await RecommendationRun.findOne({
      runId: req.params.runId
    }).lean();

    if (!run) {
      return res.status(404).json({
        error: "Recommendation run not found."
      });
    }

    return res.json(run);
  } catch (error) {
    console.error("Recommendation run detail error:", error);

    return res.status(500).json({
      error: "Failed to load recommendation run."
    });
  }
});

router.delete("/:runId", async (req, res) => {
  try {
    const result = await RecommendationRun.deleteOne({
      runId: req.params.runId
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        error: "Recommendation run not found."
      });
    }

    return res.json({
      ok: true,
      message: "Recommendation run deleted."
    });
  } catch (error) {
    console.error("Recommendation run delete error:", error);

    return res.status(500).json({
      error: "Failed to delete recommendation run."
    });
  }
});

module.exports = router;
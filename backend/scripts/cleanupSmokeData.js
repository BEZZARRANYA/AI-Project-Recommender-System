// backend/scripts/cleanupSmokeData.js
const path = require("path");
const mongoose = require("mongoose");

require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const RecommendationRun = require("../models/RecommendationRun");
const RecommendationFeedback = require("../models/RecommendationFeedback");

const CONFIRM_DELETE = process.argv.includes("--confirm");
const SMOKE_SESSION_REGEX = /^smoke-test-/;

async function connectDb() {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is missing from .env");
  }

  await mongoose.connect(process.env.MONGO_URI);
}

async function main() {
  console.log("");
  console.log("Smoke Test Data Cleanup");
  console.log(`Mode: ${CONFIRM_DELETE ? "DELETE" : "DRY RUN"}`);
  console.log("");

  await connectDb();

  const smokeFeedback = await RecommendationFeedback.find({
    sessionId: SMOKE_SESSION_REGEX
  })
    .select({ runId: 1, sessionId: 1, projectTitle: 1, createdAt: 1 })
    .lean();

  const runIdsFromFeedback = smokeFeedback
    .map((row) => row.runId)
    .filter(Boolean);

  const smokeRuns = await RecommendationRun.find({
    $or: [
      { sessionId: SMOKE_SESSION_REGEX },
      { runId: { $in: runIdsFromFeedback } }
    ]
  })
    .select({
      runId: 1,
      sessionId: 1,
      "topRecommendation.displayTitle": 1,
      "topRecommendation.title": 1,
      createdAt: 1
    })
    .lean();

  console.log(`Smoke feedback rows found: ${smokeFeedback.length}`);
  console.log(`Smoke recommendation runs found: ${smokeRuns.length}`);

  if (smokeRuns.length) {
    console.log("");
    console.log("Runs targeted:");
    smokeRuns.forEach((run) => {
      const title =
        run.topRecommendation?.displayTitle ||
        run.topRecommendation?.title ||
        "Untitled";

      console.log(`- ${run.runId} | ${run.sessionId || "no session"} | ${title}`);
    });
  }

  if (smokeFeedback.length) {
    console.log("");
    console.log("Feedback rows targeted:");
    smokeFeedback.forEach((row) => {
      console.log(
        `- ${row._id} | ${row.runId || "no run"} | ${row.projectTitle || "Untitled"}`
      );
    });
  }

  if (!CONFIRM_DELETE) {
    console.log("");
    console.log("DRY RUN ONLY. Nothing was deleted.");
    console.log("To delete, run:");
    console.log("npm run cleanup:smoke -- --confirm");
    await mongoose.disconnect();
    return;
  }

  const smokeRunIds = smokeRuns.map((run) => run.runId).filter(Boolean);

  const feedbackDeleteResult = await RecommendationFeedback.deleteMany({
    $or: [
      { sessionId: SMOKE_SESSION_REGEX },
      { runId: { $in: smokeRunIds } }
    ]
  });

  const runDeleteResult = await RecommendationRun.deleteMany({
    $or: [
      { sessionId: SMOKE_SESSION_REGEX },
      { runId: { $in: runIdsFromFeedback } }
    ]
  });

  console.log("");
  console.log(`Deleted feedback rows: ${feedbackDeleteResult.deletedCount}`);
  console.log(`Deleted recommendation runs: ${runDeleteResult.deletedCount}`);

  await mongoose.disconnect();

  console.log("");
  console.log("Cleanup complete.");
}

main().catch(async (error) => {
  console.error("Smoke cleanup failed:", error.message);

  try {
    await mongoose.disconnect();
  } catch {
    // ignore disconnect failure
  }

  process.exit(1);
});
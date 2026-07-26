// backend/scripts/smokeTestBackend.js
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const API_BASE_URL = process.env.SMOKE_TEST_API_URL || "http://127.0.0.1:5001";
const DEV_LAB_PASSWORD = process.env.DEV_LAB_PASSWORD || "";

const smokeSessionId = `smoke-test-${Date.now()}`;

const testPayload = {
  sessionId: smokeSessionId,
  skill: "beginner",
  difficulty: "easy",
  projectType: "web application",
  interests: ["web"],
  languages: ["javascript"],
  preferredIndustry: "productivity",
  portfolioGoal: "learn fundamentals",
  timeAvailable: "no preference",
  buildStyle: "no preference",
  personalContext:
    "I want a beginner-friendly project that proves frontend and backend basics."
};

function printDivider() {
  console.log("─".repeat(72));
}

function printStep(title) {
  printDivider();
  console.log(`TEST: ${title}`);
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function parseJsonSafely(response) {
  const text = await response.text();

  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

async function request(pathname, options = {}) {
  const url = `${API_BASE_URL}${pathname}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });

  const data = await parseJsonSafely(response);

  return {
    url,
    status: response.status,
    ok: response.ok,
    data
  };
}

function getProjectTitle(project = {}) {
  return (
    project.displayTitle ||
    project.personalizedTitle ||
    project.title ||
    project.baseTitle ||
    project.projectTitle ||
    "Untitled Project"
  );
}

function getProjectKey(project = {}) {
  return (
    project.projectKey ||
    project._id ||
    project.id ||
    project.projectId ||
    project.baseTitle ||
    project.title ||
    project.personalizedTitle ||
    project.displayTitle ||
    "unknown-project"
  );
}

async function testHealth() {
  printStep("Backend health route");

  const result = await request("/");

  assert(result.ok, `Health route failed. Status: ${result.status}`);

  console.log("OK:", result.data.raw || result.data);
}

async function testProjectsRoute() {
  printStep("Projects route");

  const result = await request("/projects");

  assert(result.ok, `Projects route failed. Status: ${result.status}`);

  const projects = Array.isArray(result.data)
    ? result.data
    : Array.isArray(result.data.projects)
      ? result.data.projects
      : [];

  assert(projects.length > 0, "Projects route returned no projects.");

  console.log(`OK: ${projects.length} projects found.`);

  return projects;
}

async function testRecommendationGeneration() {
  printStep("Recommendation generation");

  const result = await request("/recommend", {
    method: "POST",
    body: JSON.stringify(testPayload)
  });

  assert(result.ok, `Recommendation request failed. Status: ${result.status}`);

  const recommendations = Array.isArray(result.data)
    ? result.data
    : Array.isArray(result.data.recommendations)
      ? result.data.recommendations
      : [];

  assert(
    recommendations.length > 0,
    "Recommendation route returned no recommendations."
  );

  const runId = result.data.runId || result.data.metadata?.runId || "";

  assert(runId, "Recommendation route did not return runId.");

  assert(
    result.data.metadata?.persisted === true,
    "Recommendation run was not persisted. Expected metadata.persisted = true."
  );

  const top = recommendations[0];

  console.log(`OK: ${recommendations.length} recommendations generated.`);
  console.log(`Smoke session ID: ${smokeSessionId}`);
  console.log(`Run ID: ${runId}`);
  console.log(`Top recommendation: ${getProjectTitle(top)}`);
  console.log(
    `Gemini/fallback split: ${result.data.metadata?.geminiRecommendations || 0} Gemini, ${
      result.data.metadata?.fallbackRecommendations || 0
    } fallback`
  );

  return {
    runId,
    recommendations,
    topRecommendation: top,
    metadata: result.data.metadata || {}
  };
}

async function testRecommendationRunsList() {
  printStep("Recommendation runs list");

  const result = await request("/recommendation-runs");

  assert(result.ok, `Recommendation runs route failed. Status: ${result.status}`);

  assert(
    Array.isArray(result.data.runs),
    "Recommendation runs response does not contain runs array."
  );

  console.log(`OK: ${result.data.runs.length} saved runs found.`);

  return result.data.runs;
}

async function testRecommendationRunDetail(runId) {
  printStep("Recommendation run detail");

  const result = await request(`/recommendation-runs/${runId}`);

  assert(result.ok, `Recommendation run detail failed. Status: ${result.status}`);

  assert(result.data.runId === runId, "Returned runId does not match requested runId.");

  assert(
    Array.isArray(result.data.recommendations),
    "Run detail does not include recommendations array."
  );

  assert(
    result.data.sessionId === smokeSessionId,
    "Run detail sessionId does not match smoke sessionId."
  );

  console.log(`OK: Loaded run ${runId}.`);
  console.log(`Saved recommendations: ${result.data.recommendations.length}`);

  return result.data;
}

async function testFeedbackSubmission(runId, project) {
  printStep("Feedback submission");

  const projectTitle = getProjectTitle(project);
  const projectKey = getProjectKey(project);

  const payload = {
    runId,
    sessionId: smokeSessionId,
    projectId: project._id || project.id || "",
    projectKey,
    projectTitle,
    baseTitle: project.baseTitle || project.title || projectTitle,
    personalizedTitle: project.personalizedTitle || project.displayTitle || "",
    projectType: project.projectType || "",
    difficulty: project.difficulty || "",
    feedbackType: "helpful",
    note: "Smoke test feedback event.",
    score: Number(project.score || 0),
    deterministicScore: Number(project.deterministicScore || project.score || 0),
    geminiScore: Number(project.geminiScore || 0),
    aiConfidence: Number(project.aiConfidence || project.geminiConfidence || 0),
    geminiConfidence: Number(project.geminiConfidence || project.aiConfidence || 0),
    aiEnhanced: Boolean(project.aiEnhanced || project.geminiAvailable),
    geminiAvailable: Boolean(project.geminiAvailable || project.aiEnhanced),
    userPreferences: testPayload,
    project
  };

  const result = await request("/feedback", {
    method: "POST",
    body: JSON.stringify(payload)
  });

  assert(result.ok, `Feedback submission failed. Status: ${result.status}`);

  assert(result.data.ok === true, "Feedback response did not return ok: true.");

  console.log(`OK: Feedback saved for "${projectTitle}".`);

  return result.data;
}

async function testFeedbackSummary(runId) {
  printStep("Run-specific feedback summary");

  const result = await request(`/feedback/summary?runId=${encodeURIComponent(runId)}`);

  assert(result.ok, `Feedback summary failed. Status: ${result.status}`);

  const totalResponses =
    result.data.summary?.totalResponses ?? result.data.totalResponses ?? 0;

  assert(
    Number(totalResponses) > 0,
    "Feedback summary returned zero responses after feedback submission."
  );

  console.log(`OK: ${totalResponses} feedback response(s) found for run.`);

  return result.data;
}

async function testDevAuthIfAvailable() {
  printStep("Dev auth route");

  if (!DEV_LAB_PASSWORD) {
    console.log("SKIPPED: DEV_LAB_PASSWORD is not set in .env.");
    return;
  }

  const result = await request("/dev-auth/unlock", {
    method: "POST",
    body: JSON.stringify({
      password: DEV_LAB_PASSWORD
    })
  });

  if (result.status === 404) {
    console.log("SKIPPED: /dev-auth/unlock route not found.");
    return;
  }

  assert(result.ok, `Dev auth failed. Status: ${result.status}`);

  console.log("OK: Dev auth route responded successfully.");
}

async function main() {
  console.log("");
  console.log("AI Project Recommender Backend Smoke Test");
  console.log(`API: ${API_BASE_URL}`);
  console.log(`Smoke session: ${smokeSessionId}`);
  console.log("");

  try {
    await testHealth();
    await testProjectsRoute();

    const recommendationResult = await testRecommendationGeneration();

    await testRecommendationRunsList();
    await testRecommendationRunDetail(recommendationResult.runId);

    await testFeedbackSubmission(
      recommendationResult.runId,
      recommendationResult.topRecommendation
    );

    await testFeedbackSummary(recommendationResult.runId);

    await testDevAuthIfAvailable();

    printDivider();
    console.log("SMOKE TEST PASSED");
    console.log("Backend core routes are working.");
    printDivider();

    process.exit(0);
  } catch (error) {
    printDivider();
    console.error("SMOKE TEST FAILED");
    console.error(error.message);
    printDivider();

    process.exit(1);
  }
}

main();
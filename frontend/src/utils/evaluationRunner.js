// frontend/src/utils/evaluationRunner.js
import {
  expandProject,
  expandUserPreferences,
  overlapCount,
  overlapRatio
} from "./taxonomy";

function average(values = []) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + Number(value || 0), 0) / values.length;
}

function buildProjectDiagnostics(project, payload) {
  const expandedProject = expandProject(project);
  const expandedPreferences = expandUserPreferences(payload);

  const difficultyMatch =
    expandedProject.difficulty === expandedPreferences.difficulty;

  const projectTypeMatch =
    expandedProject.projectType === expandedPreferences.projectType;

  const languageMatches = overlapCount(
    expandedProject.technologies,
    expandedPreferences.languages
  );

  const interestMatches = overlapCount(
    expandedProject.categories,
    expandedPreferences.interests
  );

  const languageRatio = overlapRatio(
    expandedProject.technologies,
    expandedPreferences.languages
  );

  const interestRatio = overlapRatio(
    expandedProject.categories,
    expandedPreferences.interests
  );

  const difficultyScore = difficultyMatch ? 25 : 0;
  const projectTypeScore = projectTypeMatch ? 25 : 0;
  const languageScore = Math.round(languageRatio * 25);
  const interestScore = Math.round(interestRatio * 25);

  const totalFitScore =
    difficultyScore + projectTypeScore + languageScore + interestScore;

  return {
    difficultyMatch,
    projectTypeMatch,
    languageMatches,
    interestMatches,
    languageRatio,
    interestRatio,
    difficultyScore,
    projectTypeScore,
    languageScore,
    interestScore,
    totalFitScore
  };
}

function buildAssessment({
  topFitScore,
  avgTopThreeFit,
  avgGeminiConfidence,
  geminiCoverage
}) {
  if (
    topFitScore >= 75 &&
    avgTopThreeFit >= 60 &&
    avgGeminiConfidence >= 60 &&
    geminiCoverage >= 30
  ) {
    return "Strong";
  }

  if (topFitScore >= 55 && avgTopThreeFit >= 40) {
    return "Acceptable";
  }

  return "Needs review";
}

export function evaluateRecommendationRun(profile, results = []) {
  const safeResults = Array.isArray(results) ? results : [];
  const topThree = safeResults.slice(0, 3);
  const topMatch = topThree[0] || null;

  const geminiResults = safeResults.filter((item) => item?.geminiAvailable);
  const geminiCoverage =
    safeResults.length > 0 ? (geminiResults.length / safeResults.length) * 100 : 0;

  const avgGeminiConfidence = Number(
    average(geminiResults.map((item) => Number(item?.geminiConfidence || 0))).toFixed(1)
  );

  const topDiagnostics = topMatch
    ? buildProjectDiagnostics(topMatch, profile?.payload || {})
    : null;

  const topThreeDiagnostics = topThree.map((project) =>
    buildProjectDiagnostics(project, profile?.payload || {})
  );

  const avgTopThreeFit = Number(
    average(topThreeDiagnostics.map((item) => item.totalFitScore)).toFixed(1)
  );

  const topFitScore = Number(topDiagnostics?.totalFitScore || 0);

  const assessment = buildAssessment({
    topFitScore,
    avgTopThreeFit,
    avgGeminiConfidence,
    geminiCoverage
  });

  return {
    profileId: profile?.id || "",
    label: profile?.label || "",
    description: profile?.description || "",
    payload: profile?.payload || {},
    totalResults: safeResults.length,
    geminiUsedCount: geminiResults.length,
    fallbackCount: safeResults.length - geminiResults.length,
    geminiCoverage: Number(geminiCoverage.toFixed(1)),
    avgGeminiConfidence,
    topMatchTitle: topMatch?.title || "No result",
    topMatchScore: Number(topMatch?.score || 0),
    topFitScore,
    avgTopThreeFit,
    assessment,
    topThreeTitles: topThree.map((item) => item?.title || "Untitled"),
    topThree,
    topDiagnostics,
    rawResults: safeResults
  };
}

export function buildEvaluationOverview(runResults = []) {
  const validRuns = Array.isArray(runResults) ? runResults : [];

  const strongCount = validRuns.filter((item) => item.assessment === "Strong").length;
  const acceptableCount = validRuns.filter(
    (item) => item.assessment === "Acceptable"
  ).length;
  const reviewCount = validRuns.filter(
    (item) => item.assessment === "Needs review"
  ).length;

  return {
    totalRuns: validRuns.length,
    avgTopFitScore: Number(
      average(validRuns.map((item) => item.topFitScore)).toFixed(1)
    ),
    avgTopThreeFit: Number(
      average(validRuns.map((item) => item.avgTopThreeFit)).toFixed(1)
    ),
    avgGeminiConfidence: Number(
      average(validRuns.map((item) => item.avgGeminiConfidence)).toFixed(1)
    ),
    strongCount,
    acceptableCount,
    reviewCount
  };
}
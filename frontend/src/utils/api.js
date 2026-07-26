// frontend/src/utils/api.js

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:5001";

const RECOMMEND_ENDPOINT = `${API_BASE_URL}/recommend`;

export async function fetchRecommendations(payload) {
  const response = await fetch(RECOMMEND_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.error || "Failed to fetch recommendations.");
  }

  if (Array.isArray(data)) {
    localStorage.removeItem("recommendationRunMetadata");
    return data;
  }

  if (Array.isArray(data.recommendations)) {
    const runMetadata = {
      runId: data.runId || data.metadata?.runId || "",
      generatedAt: data.metadata?.generatedAt || new Date().toISOString(),
      generatedDateFormatted:
        data.metadata?.generatedDateFormatted || new Date().toLocaleString(),
      persisted: Boolean(data.metadata?.persisted),
      totalRecommendations:
        data.metadata?.totalRecommendations || data.recommendations.length,
      geminiRecommendations: data.metadata?.geminiRecommendations || 0,
      fallbackRecommendations: data.metadata?.fallbackRecommendations || 0,
      geminiUsed: Boolean(data.metadata?.geminiUsed),
      geminiModel: data.metadata?.geminiModel || "",
      geminiReason: data.metadata?.geminiReason || ""
    };

    localStorage.setItem("recommendationRunMetadata", JSON.stringify(runMetadata));

    return data.recommendations;
  }

  localStorage.removeItem("recommendationRunMetadata");
  return [];
}

export function savePreferences(payload) {
  localStorage.setItem("userPreferences", JSON.stringify(payload));
}

export function getSavedPreferences() {
  try {
    return JSON.parse(localStorage.getItem("userPreferences")) || null;
  } catch {
    return null;
  }
}

export function saveRecommendations(projects) {
  localStorage.setItem("recommendedProjects", JSON.stringify(projects));
}

export function getSavedRecommendations() {
  try {
    return JSON.parse(localStorage.getItem("recommendedProjects")) || [];
  } catch {
    return [];
  }
}

export function getSavedRecommendationRunMetadata() {
  try {
    return JSON.parse(localStorage.getItem("recommendationRunMetadata")) || null;
  } catch {
    return null;
  }
}

export function shuffleProjects(projects = []) {
  return [...projects].sort(() => Math.random() - 0.5);
}

export { API_BASE_URL };
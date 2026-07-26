// frontend/src/utils/recommendationRunsApi.js
import { API_BASE_URL } from "./api";

const RECOMMENDATION_RUNS_ENDPOINT = `${API_BASE_URL}/recommendation-runs`;

async function parseJsonSafely(response) {
  return response.json().catch(() => ({}));
}

export async function fetchRecommendationRuns(limit = 20) {
  const url = new URL(RECOMMENDATION_RUNS_ENDPOINT);
  url.searchParams.set("limit", String(limit));

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    }
  });

  const data = await parseJsonSafely(response);

  if (!response.ok) {
    throw new Error(
      data?.error || `Failed to load recommendation runs. Status ${response.status}`
    );
  }

  return data;
}

export async function fetchRecommendationRun(runId) {
  if (!runId) {
    throw new Error("runId is required.");
  }

  const response = await fetch(`${RECOMMENDATION_RUNS_ENDPOINT}/${runId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    }
  });

  const data = await parseJsonSafely(response);

  if (!response.ok) {
    throw new Error(
      data?.error || `Failed to load recommendation run. Status ${response.status}`
    );
  }

  return data;
}

export async function deleteRecommendationRun(runId) {
  if (!runId) {
    throw new Error("runId is required.");
  }

  const response = await fetch(`${RECOMMENDATION_RUNS_ENDPOINT}/${runId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json"
    }
  });

  const data = await parseJsonSafely(response);

  if (!response.ok) {
    throw new Error(
      data?.error || `Failed to delete recommendation run. Status ${response.status}`
    );
  }

  return data;
}
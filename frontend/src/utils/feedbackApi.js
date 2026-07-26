// frontend/src/utils/feedbackApi.js
import { API_BASE_URL } from "./api";

const FEEDBACK_ENDPOINT = `${API_BASE_URL}/feedback`;
const FEEDBACK_SUMMARY_ENDPOINT = `${API_BASE_URL}/feedback/summary`;

async function parseJsonSafely(response) {
  return response.json().catch(() => ({}));
}

function buildUrlWithParams(baseUrl, params = {}) {
  const url = new URL(baseUrl);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      url.searchParams.set(key, String(value).trim());
    }
  });

  return url.toString();
}

export async function submitRecommendationFeedback(payload) {
  const response = await fetch(FEEDBACK_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const data = await parseJsonSafely(response);

  if (!response.ok) {
    throw new Error(data?.error || `Failed to save feedback. Status ${response.status}`);
  }

  return data;
}

export async function fetchRecommendationFeedbackSummary(options = {}) {
  const url = buildUrlWithParams(FEEDBACK_SUMMARY_ENDPOINT, {
    runId: options.runId
  });

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    }
  });

  const data = await parseJsonSafely(response);

  if (!response.ok) {
    throw new Error(
      data?.error || `Failed to load feedback summary. Status ${response.status}`
    );
  }

  return data;
}

export async function fetchRecommendationFeedbackList(options = {}) {
  const url = buildUrlWithParams(FEEDBACK_ENDPOINT, {
    runId: options.runId
  });

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    }
  });

  const data = await parseJsonSafely(response);

  if (!response.ok) {
    throw new Error(
      data?.error || `Failed to load feedback list. Status ${response.status}`
    );
  }

  return data;
}
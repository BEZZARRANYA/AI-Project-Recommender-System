const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL?.replace(/\/+$/, "") ||
  "http://127.0.0.1:5001";

const PROJECTS_ENDPOINT = `${API_BASE_URL}/projects`;

async function parseJsonSafe(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export async function fetchProjectAudit() {
  let response;

  try {
    response = await fetch(`${PROJECTS_ENDPOINT}/audit`);
  } catch (networkError) {
    console.error("[fetchProjectAudit] Network error:", networkError);
    throw new Error("Could not load project audit.");
  }

  const data = await parseJsonSafe(response);

  if (!response.ok) {
    throw new Error(data?.error || "Failed to fetch project audit.");
  }

  return {
    summary: data?.summary || {
      totalProjects: 0,
      strongCount: 0,
      needsImprovementCount: 0,
      weakCount: 0,
      avgMetadataScore: 0
    },
    projects: Array.isArray(data?.projects) ? data.projects : []
  };
}

export async function fetchProjects() {
  let response;

  try {
    response = await fetch(PROJECTS_ENDPOINT);
  } catch (networkError) {
    console.error("[fetchProjects] Network error:", networkError);
    throw new Error("Could not load projects.");
  }

  const data = await parseJsonSafe(response);

  if (!response.ok) {
    throw new Error(data?.error || "Failed to fetch projects.");
  }

  return Array.isArray(data) ? data : [];
}

export async function fetchProjectById(projectId) {
  let response;

  try {
    response = await fetch(`${PROJECTS_ENDPOINT}/${projectId}`);
  } catch (networkError) {
    console.error("[fetchProjectById] Network error:", networkError);
    throw new Error("Could not load project details.");
  }

  const data = await parseJsonSafe(response);

  if (!response.ok) {
    throw new Error(data?.error || "Failed to fetch project.");
  }

  return data || null;
}

export async function updateProject(projectId, payload) {
  let response;

  try {
    response = await fetch(`${PROJECTS_ENDPOINT}/${projectId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
  } catch (networkError) {
    console.error("[updateProject] Network error:", networkError);
    throw new Error("Could not update project.");
  }

  const data = await parseJsonSafe(response);

  if (!response.ok) {
    throw new Error(data?.error || "Failed to update project.");
  }

  return data?.project || null;
}
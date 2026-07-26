const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL?.replace(/\/+$/, "") ||
  "http://127.0.0.1:5001";

const DEV_AUTH_BASE = `${API_BASE_URL}/dev-auth`;
const DEV_LAB_TOKEN_KEY = "devLabAccessToken";

function getStoredToken() {
  return sessionStorage.getItem(DEV_LAB_TOKEN_KEY) || "";
}

function storeToken(token) {
  sessionStorage.setItem(DEV_LAB_TOKEN_KEY, token);
}

export function clearDevLabAccess() {
  sessionStorage.removeItem(DEV_LAB_TOKEN_KEY);
}

export function hasDevLabToken() {
  return Boolean(getStoredToken());
}

export async function unlockDevLab(password) {
  const response = await fetch(`${DEV_AUTH_BASE}/unlock`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ password })
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.error || "Failed to unlock dev lab.");
  }

  if (!data?.token) {
    throw new Error("Server did not return an access token.");
  }

  storeToken(data.token);
  return data.token;
}

export async function verifyDevLabAccess() {
  const token = getStoredToken();

  if (!token) return false;

  const response = await fetch(`${DEV_AUTH_BASE}/verify`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    clearDevLabAccess();
    return false;
  }

  const data = await response.json().catch(() => ({}));
  return data?.valid === true;
}
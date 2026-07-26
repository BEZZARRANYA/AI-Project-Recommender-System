const express = require("express");
const crypto = require("crypto");

const router = express.Router();

const TOKEN_TTL_MS = 1000 * 60 * 60 * 6; // 6 hours

function safeString(value) {
  return String(value || "").trim();
}

function base64UrlEncode(value) {
  return Buffer.from(value).toString("base64url");
}

function base64UrlDecode(value) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function getTokenSecret() {
  return process.env.DEV_LAB_TOKEN_SECRET || "dev-lab-fallback-secret";
}

function signPayload(payloadString) {
  return crypto
    .createHmac("sha256", getTokenSecret())
    .update(payloadString)
    .digest("base64url");
}

function createAccessToken() {
  const payload = {
    role: "dev_lab",
    exp: Date.now() + TOKEN_TTL_MS
  };

  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = signPayload(encodedPayload);

  return `${encodedPayload}.${signature}`;
}

function verifyAccessToken(token) {
  if (!safeString(token)) return false;

  const parts = token.split(".");
  if (parts.length !== 2) return false;

  const [encodedPayload, providedSignature] = parts;
  const expectedSignature = signPayload(encodedPayload);

  if (providedSignature !== expectedSignature) {
    return false;
  }

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload));

    if (payload?.role !== "dev_lab") return false;
    if (!payload?.exp || Date.now() > Number(payload.exp)) return false;

    return true;
  } catch {
    return false;
  }
}

function extractBearerToken(req) {
  const authHeader = safeString(req.headers.authorization);

  if (!authHeader.toLowerCase().startsWith("bearer ")) {
    return "";
  }

  return authHeader.slice(7).trim();
}

router.post("/unlock", (req, res) => {
  const submittedPassword = safeString(req.body?.password);
  const expectedPassword = safeString(process.env.DEV_LAB_PASSWORD);

  if (!expectedPassword) {
    return res.status(500).json({
      error: "DEV_LAB_PASSWORD is not configured on the server."
    });
  }

  if (!submittedPassword || submittedPassword !== expectedPassword) {
    return res.status(401).json({
      error: "Invalid password."
    });
  }

  const token = createAccessToken();

  return res.json({
    success: true,
    token
  });
});

router.get("/verify", (req, res) => {
  const token = extractBearerToken(req);

  if (!verifyAccessToken(token)) {
    return res.status(401).json({
      valid: false
    });
  }

  return res.json({
    valid: true
  });
});

module.exports = router;
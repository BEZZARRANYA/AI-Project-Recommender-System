// backend/services/hybridRecommender.js
const {
  safeString,
  toArray,
  expandProject,
  expandUserPreferences,
  overlapDetails,
  overlapRatio
} = require("./taxonomy");

const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

function round1(value) {
  return Math.round(Number(value || 0) * 10) / 10;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, Number(value || 0)));
}

function normalizePercent(value, fallback = 0) {
  const number = Number(value ?? fallback ?? 0);

  if (!Number.isFinite(number)) {
    return 0;
  }

  if (number > 0 && number <= 1) {
    return clamp(number * 100, 0, 100);
  }

  return clamp(number, 0, 100);
}

function shuffleArray(items = []) {
  return [...items].sort(() => Math.random() - 0.5);
}

function asObjectArray(value) {
  return Array.isArray(value)
    ? value.filter((item) => item && typeof item === "object")
    : [];
}

function buildPersonalizationContext(userPreferences = {}) {
  return {
    preferredIndustry: safeString(userPreferences.preferredIndustry),
    portfolioGoal: safeString(userPreferences.portfolioGoal),
    timeAvailable: safeString(userPreferences.timeAvailable),
    buildStyle: safeString(userPreferences.buildStyle),
    personalContext: safeString(userPreferences.personalContext)
  };
}

function hasPersonalizationContext(userPreferences = {}) {
  const context = buildPersonalizationContext(userPreferences);
  return Object.values(context).some(Boolean);
}

function fallbackPersonalizedTitle(project = {}) {
  return safeString(project.title);
}

function fallbackPersonalizedBrief(project = {}) {
  return `Build this project as a focused portfolio-ready implementation of ${safeString(
    project.title
  )}.`;
}

function fallbackCustomFeatures(project = {}) {
  const features = safeString(project.features);

  if (features) {
    return features
      .split(/[.;]/)
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 4);
  }

  return [
    "Core CRUD workflow",
    "Clean responsive interface",
    "Basic analytics or summary view",
    "Final demo-ready presentation"
  ];
}

function fallbackMilestones(project = {}) {
  return [
    `Define the scope and data model for ${safeString(project.title)}`,
    "Build the core screens and backend/API logic",
    "Add validation, polish, and demo-ready sample data"
  ];
}

function fallbackPortfolioAngle(project = {}) {
  return `Shows practical ability to plan, build, and explain a complete ${safeString(
    project.projectType || "software"
  )} project.`;
}

function buildDeterministicSignals({
  difficultyScore,
  projectTypeScore,
  categoryMatches,
  technologyMatches,
  skillScore,
  project
}) {
  return [
    difficultyScore > 0 ? `Difficulty matches (${project.difficulty})` : null,
    projectTypeScore > 0 ? `Project type matches (${project.projectType})` : null,
    categoryMatches.length ? `Interest overlap: ${categoryMatches.join(", ")}` : null,
    technologyMatches.length ? `Tech overlap: ${technologyMatches.join(", ")}` : null,
    skillScore > 0 ? "Skill level aligns with difficulty" : null
  ].filter(Boolean);
}

function scoreBaselineProjects(allProjects, userPreferences = {}) {
  const expandedPrefs = expandUserPreferences(userPreferences);

  const skillDifficultyMap = {
    beginner: "easy",
    intermediate: "medium",
    advanced: "hard"
  };

  return allProjects.map((project) => {
    const expandedProject = expandProject(project);

    const difficultyMatch =
      expandedProject.difficulty === expandedPrefs.difficulty;

    const projectTypeMatch =
      expandedProject.projectType === expandedPrefs.projectType;

    const categoryMatches = overlapDetails(
      expandedProject.categories,
      expandedPrefs.interests
    );

    const technologyMatches = overlapDetails(
      expandedProject.technologies,
      expandedPrefs.languages
    );

    const categoryRatio = overlapRatio(
      expandedProject.categories,
      expandedPrefs.interests
    );

    const technologyRatio = overlapRatio(
      expandedProject.technologies,
      expandedPrefs.languages
    );

    const skillDifficulty = skillDifficultyMap[expandedPrefs.skill] || "";
    const skillMatch =
      skillDifficulty && skillDifficulty === expandedProject.difficulty;

    const difficultyScore = difficultyMatch ? 25 : 0;
    const projectTypeScore = projectTypeMatch ? 25 : 0;
    const categoryScore = Math.round(categoryRatio * 25);
    const technologyScore = Math.round(technologyRatio * 20);
    const skillScore = skillMatch ? 5 : 0;

    const hasAnyDomainOverlap =
      categoryMatches.length > 0 || technologyMatches.length > 0;

    const domainPenalty =
      !hasAnyDomainOverlap && !projectTypeMatch ? -15 : 0;

    const deterministicScore = clamp(
      difficultyScore +
        projectTypeScore +
        categoryScore +
        technologyScore +
        skillScore +
        domainPenalty,
      0,
      100
    );

    return {
      ...project,
      deterministicScore,
      score: deterministicScore,
      normalizedMatch: {
        project: expandedProject,
        preferences: expandedPrefs
      },
      scoreBreakdown: {
        difficulty: difficultyScore,
        projectType: projectTypeScore,
        categories: categoryScore,
        technologies: technologyScore,
        skillAlignment: skillScore,
        domainPenalty,
        total: deterministicScore
      },
      categoryMatches,
      technologyMatches,
      deterministicSignals: buildDeterministicSignals({
        difficultyScore,
        projectTypeScore,
        categoryMatches,
        technologyMatches,
        skillScore,
        project
      })
    };
  });
}

function pickBaselineWindow(scoredProjects = []) {
  const sorted = [...scoredProjects].sort(
    (a, b) => Number(b.deterministicScore || 0) - Number(a.deterministicScore || 0)
  );

  const positive = sorted.filter(
    (project) => Number(project.deterministicScore || 0) > 0
  );

  if (positive.length >= 10) {
    return positive.slice(0, 10);
  }

  if (positive.length > 0) {
    const positiveIds = new Set(
      positive.map((project) => String(project._id || project.id || project.title))
    );

    const rest = sorted
      .filter(
        (project) =>
          !positiveIds.has(String(project._id || project.id || project.title))
      )
      .slice(0, 10 - positive.length);

    return [...positive, ...rest];
  }

  return shuffleArray(sorted).slice(0, 10);
}

function extractGeminiText(responseJson) {
  const parts = responseJson?.candidates?.[0]?.content?.parts || [];

  return parts
    .map((part) => part?.text || "")
    .filter(Boolean)
    .join("")
    .trim();
}

function extractJson(text) {
  if (!text) {
    throw new Error("Gemini returned an empty response.");
  }

  const fencedMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fencedMatch ? fencedMatch[1].trim() : text.trim();

  const firstBrace = candidate.indexOf("{");
  const lastBrace = candidate.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    throw new Error("Gemini response did not contain valid JSON.");
  }

  return candidate.slice(firstBrace, lastBrace + 1);
}

function sanitizeAiRecord(record, project = {}) {
  const rawScore =
    record?.geminiScore ??
    record?.score ??
    record?.aiScore ??
    0;

  const rawConfidence =
    record?.geminiConfidence ??
    record?.confidence ??
    record?.aiConfidence ??
    rawScore;

  const geminiScore = normalizePercent(rawScore, 0);
  const geminiConfidence = normalizePercent(rawConfidence, geminiScore);

  return {
    candidateId: safeString(record?.candidateId),
    geminiScore,
    geminiConfidence,
    fitSummary: safeString(record?.fitSummary),
    whyRecommended: toArray(record?.whyRecommended)
      .map((item) => safeString(item))
      .filter(Boolean)
      .slice(0, 3),

    personalizedTitle:
      safeString(record?.personalizedTitle) || fallbackPersonalizedTitle(project),
    personalizedBrief:
      safeString(record?.personalizedBrief) || fallbackPersonalizedBrief(project),
    customFeatures: toArray(record?.customFeatures)
      .map((item) => safeString(item))
      .filter(Boolean)
      .slice(0, 5),
    suggestedMilestones: toArray(record?.suggestedMilestones)
      .map((item) => safeString(item))
      .filter(Boolean)
      .slice(0, 5),
    portfolioAngle:
      safeString(record?.portfolioAngle) || fallbackPortfolioAngle(project)
  };
}

function mergeAiRanking(candidateProjects, aiOutput) {
  const rawRecords = asObjectArray(aiOutput?.evaluations);

  const aiByCandidateId = new Map(
    rawRecords
      .filter((item) => safeString(item?.candidateId))
      .map((item) => [safeString(item.candidateId), item])
  );

  return candidateProjects
    .map((project) => {
      const candidateId = String(project.__candidateId);
      const rawAi = aiByCandidateId.get(candidateId);

      if (!rawAi) {
        return {
          ...project,
          aiEnhanced: false,
          aiMode: "fallback",
          aiReason: "No Gemini evaluation returned for this candidate.",
          geminiScore: 0,
          aiConfidence: 0,
          geminiConfidence: 0,
          aiFitSummary:
            "The Gemini layer did not return an evaluation for this project.",
          whyRecommended: toArray(project.deterministicSignals).slice(0, 3),
          aiStrengths: toArray(project.deterministicSignals).slice(0, 3),

          personalizedTitle: fallbackPersonalizedTitle(project),
          personalizedBrief: fallbackPersonalizedBrief(project),
          customFeatures: fallbackCustomFeatures(project),
          suggestedMilestones: fallbackMilestones(project),
          portfolioAngle: fallbackPortfolioAngle(project)
        };
      }

      const ai = sanitizeAiRecord(rawAi, project);

      return {
        ...project,
        aiEnhanced: true,
        aiMode: "gemini",
        aiReason: "",
        geminiScore: ai.geminiScore,
        aiConfidence: ai.geminiConfidence,
        geminiConfidence: ai.geminiConfidence,
        aiFitSummary:
          ai.fitSummary ||
          "Gemini ranked this project as a strong fit for the submitted preferences.",
        whyRecommended:
          ai.whyRecommended.length > 0
            ? ai.whyRecommended
            : toArray(project.deterministicSignals).slice(0, 3),
        aiStrengths:
          ai.whyRecommended.length > 0
            ? ai.whyRecommended
            : toArray(project.deterministicSignals).slice(0, 3),

        personalizedTitle: ai.personalizedTitle,
        personalizedBrief: ai.personalizedBrief,
        customFeatures:
          ai.customFeatures.length > 0
            ? ai.customFeatures
            : fallbackCustomFeatures(project),
        suggestedMilestones:
          ai.suggestedMilestones.length > 0
            ? ai.suggestedMilestones
            : fallbackMilestones(project),
        portfolioAngle: ai.portfolioAngle
      };
    })
    .sort((a, b) => {
      if (a.aiEnhanced && b.aiEnhanced) {
        return Number(b.geminiScore || 0) - Number(a.geminiScore || 0);
      }

      if (a.aiEnhanced && !b.aiEnhanced) return -1;
      if (!a.aiEnhanced && b.aiEnhanced) return 1;

      return Number(b.deterministicScore || 0) - Number(a.deterministicScore || 0);
    })
    .map((project, index) => ({
      ...project,
      aiRank: index + 1
    }));
}

function buildGeminiPrompt({ userPreferences, candidateProjects }) {
  const expandedPrefs = expandUserPreferences(userPreferences);
  const personalization = buildPersonalizationContext(userPreferences);

  const compactCandidates = candidateProjects.map((project, index) => {
    const expandedProject = expandProject(project);

    return {
      candidateId: String(project.__candidateId || `candidate-${index + 1}`),
      title: project.title || "",
      difficulty: project.difficulty || "",
      normalizedDifficulty: expandedProject.difficulty,
      projectType: project.projectType || "",
      normalizedProjectType: expandedProject.projectType,
      technologies: toArray(project.technologies).slice(0, 5),
      categories: toArray(project.categories).slice(0, 5),
      baselineScore: round1(project.deterministicScore || 0)
    };
  });

  return `
Return compact valid JSON only.

Required shape:
{
  "evaluations": [
    {
      "candidateId": "string",
      "geminiScore": 0,
      "geminiConfidence": 0,
      "fitSummary": "short sentence",
      "whyRecommended": ["short reason", "short reason", "short reason"],
      "personalizedTitle": "string",
      "personalizedBrief": "string",
      "customFeatures": ["string", "string", "string"],
      "suggestedMilestones": ["string", "string", "string"],
      "portfolioAngle": "string"
    }
  ]
}

Rules:
- Evaluate every candidate once.
- Use candidateId exactly.
- Scores must be 0 to 100.
- If using decimal confidence, 0.9 means 90%.
- fitSummary under 18 words.
- whyRecommended must contain 3 short strings.
- personalizedTitle must adapt the base project to the user's personal context.
- personalizedBrief must be under 35 words.
- customFeatures must contain 3 to 5 practical features.
- suggestedMilestones must contain 3 to 5 build milestones.
- portfolioAngle must explain why this is useful for the user's goal.
- Do not invent a totally unrelated project.
- No markdown.
- No extra text.

User:
${JSON.stringify(
  {
    raw: userPreferences,
    normalized: expandedPrefs,
    personalization
  },
  null,
  2
)}

Candidates:
${JSON.stringify(compactCandidates, null, 2)}
`.trim();
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 45000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal
    });
  } finally {
    clearTimeout(timer);
  }
}

function buildGeminiRequestBody(prompt) {
  const maxOutputTokens = Math.max(
    1000,
    Number.parseInt(process.env.GEMINI_MAX_OUTPUT_TOKENS || "2200", 10) || 2200
  );

  return {
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }]
      }
    ],
    generationConfig: {
      temperature: 0.25,
      maxOutputTokens,
      responseMimeType: "application/json",
      responseSchema: {
        type: "object",
        properties: {
          evaluations: {
            type: "array",
            items: {
              type: "object",
              properties: {
                candidateId: { type: "string" },
                geminiScore: { type: "number" },
                geminiConfidence: { type: "number" },
                fitSummary: { type: "string" },
                whyRecommended: {
                  type: "array",
                  items: { type: "string" }
                },
                personalizedTitle: { type: "string" },
                personalizedBrief: { type: "string" },
                customFeatures: {
                  type: "array",
                  items: { type: "string" }
                },
                suggestedMilestones: {
                  type: "array",
                  items: { type: "string" }
                },
                portfolioAngle: { type: "string" }
              },
              required: [
                "candidateId",
                "geminiScore",
                "geminiConfidence",
                "fitSummary",
                "whyRecommended",
                "personalizedTitle",
                "personalizedBrief",
                "customFeatures",
                "suggestedMilestones",
                "portfolioAngle"
              ]
            }
          }
        },
        required: ["evaluations"]
      }
    }
  };
}

async function callGeminiModel({ model, apiKey, prompt, timeoutMs }) {
  const endpoint = `${GEMINI_API_BASE}/${encodeURIComponent(model)}:generateContent`;

  const response = await fetchWithTimeout(
    endpoint,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey
      },
      body: JSON.stringify(buildGeminiRequestBody(prompt))
    },
    timeoutMs
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini request failed: ${response.status} ${errorText}`);
  }

  const json = await response.json();
  const finishReason = json?.candidates?.[0]?.finishReason || "UNKNOWN";

  console.log(`Gemini ${model} finishReason: ${finishReason}`);

  if (finishReason === "MAX_TOKENS") {
    throw new Error(
      "Gemini response was cut off because maxOutputTokens was too low."
    );
  }

  const text = extractGeminiText(json);

  let parsed;

  try {
    parsed = JSON.parse(text);
  } catch {
    parsed = JSON.parse(extractJson(text));
  }

  if (!Array.isArray(parsed?.evaluations)) {
    throw new Error("Gemini JSON did not include evaluations.");
  }

  return parsed;
}

function getGeminiModelList() {
  const primary = process.env.GEMINI_MODEL || "gemini-3.1-flash-lite-preview";
  const fallback = process.env.GEMINI_FALLBACK_MODEL || "gemini-2.5-flash-lite";

  return [...new Set([primary, fallback].filter(Boolean))];
}

async function rerankWithGemini({ userPreferences, candidateProjects }) {
  const apiKey = process.env.GEMINI_API_KEY;
  const timeoutMs = Math.max(
    8000,
    Number.parseInt(process.env.GEMINI_TIMEOUT_MS || "45000", 10) || 45000
  );

  if (!apiKey) {
    return {
      projects: candidateProjects.map((project) => ({
        ...project,
        aiEnhanced: false,
        aiMode: "fallback",
        aiReason: "GEMINI_API_KEY missing",
        geminiScore: 0,
        aiConfidence: 0,
        geminiConfidence: 0,
        aiFitSummary:
          "The Gemini layer was unavailable because no API key was configured.",
        whyRecommended: toArray(project.deterministicSignals).slice(0, 3),
        aiStrengths: toArray(project.deterministicSignals).slice(0, 3),
        personalizedTitle: fallbackPersonalizedTitle(project),
        personalizedBrief: fallbackPersonalizedBrief(project),
        customFeatures: fallbackCustomFeatures(project),
        suggestedMilestones: fallbackMilestones(project),
        portfolioAngle: fallbackPortfolioAngle(project)
      })),
      aiMeta: {
        enabled: false,
        used: false,
        model: null,
        reason: "GEMINI_API_KEY missing"
      }
    };
  }

  const prompt = buildGeminiPrompt({ userPreferences, candidateProjects });
  const models = getGeminiModelList();

  let lastError = null;

  for (const model of models) {
    try {
      const parsed = await callGeminiModel({
        model,
        apiKey,
        prompt,
        timeoutMs
      });

      const reranked = mergeAiRanking(candidateProjects, parsed);

      return {
        projects: reranked,
        aiMeta: {
          enabled: true,
          used: true,
          model,
          reason: null,
          personalized: hasPersonalizationContext(userPreferences)
        }
      };
    } catch (error) {
      lastError = error;
      console.error(`Gemini model failed (${model}):`, error.message);
    }
  }

  throw lastError || new Error("All Gemini models failed.");
}

async function buildHybridRecommendations({ userPreferences, shortlistedProjects }) {
  const topK = Math.max(
    1,
    Math.min(3, Number.parseInt(process.env.GEMINI_TOP_K || "3", 10) || 3)
  );

  const aiCandidates = shortlistedProjects.slice(0, topK).map((project, index) => ({
    ...project,
    __candidateId: String(project._id || project.id || `candidate-${index + 1}`)
  }));

  const remainingProjects = shortlistedProjects.slice(topK).map((project) => ({
    ...project,
    aiEnhanced: false,
    aiMode: "deterministic_extension",
    aiReason: "Not sent to Gemini; deterministic extension of result list.",
    geminiScore: 0,
    aiConfidence: 0,
    geminiConfidence: 0,
    aiFitSummary:
      "This result extends the list beyond the Gemini-ranked shortlist and comes from deterministic scoring.",
    whyRecommended: toArray(project.deterministicSignals).slice(0, 3),
    aiStrengths: toArray(project.deterministicSignals).slice(0, 3),
    personalizedTitle: fallbackPersonalizedTitle(project),
    personalizedBrief: fallbackPersonalizedBrief(project),
    customFeatures: fallbackCustomFeatures(project),
    suggestedMilestones: fallbackMilestones(project),
    portfolioAngle: fallbackPortfolioAngle(project)
  }));

  try {
    const hybrid = await rerankWithGemini({
      userPreferences,
      candidateProjects: aiCandidates
    });

    console.log("Hybrid AI success:", hybrid.aiMeta);

    return {
      projects: [
        ...hybrid.projects.map(({ __candidateId, ...rest }) => rest),
        ...remainingProjects
      ],
      aiMeta: hybrid.aiMeta
    };
  } catch (error) {
    console.error("Gemini rerank error:", error);

    const fallbackProjects = shortlistedProjects.map((project) => ({
      ...project,
      aiEnhanced: false,
      aiMode: "fallback",
      aiReason: error?.message || "Unknown Gemini error",
      geminiScore: 0,
      aiConfidence: 0,
      geminiConfidence: 0,
      aiFitSummary:
        "The Gemini layer was unavailable, so the baseline recommender returned this project.",
      whyRecommended: toArray(project.deterministicSignals).slice(0, 3),
      aiStrengths: toArray(project.deterministicSignals).slice(0, 3),
      personalizedTitle: fallbackPersonalizedTitle(project),
      personalizedBrief: fallbackPersonalizedBrief(project),
      customFeatures: fallbackCustomFeatures(project),
      suggestedMilestones: fallbackMilestones(project),
      portfolioAngle: fallbackPortfolioAngle(project)
    }));

    const aiMeta = {
      enabled: true,
      used: false,
      model: process.env.GEMINI_MODEL || "gemini-3.1-flash-lite-preview",
      reason: error?.message || "Unknown Gemini error",
      personalized: false
    };

    console.log("Hybrid AI fallback:", aiMeta);

    return {
      projects: fallbackProjects,
      aiMeta
    };
  }
}

module.exports = {
  scoreBaselineProjects,
  pickBaselineWindow,
  buildHybridRecommendations
};
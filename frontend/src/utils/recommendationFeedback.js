const FEEDBACK_SESSION_KEY = "recommendationFeedbackSessionId";

function safeString(value) {
  return String(value || "").trim();
}

function toArray(value) {
  return Array.isArray(value) ? value : [];
}

export function getOrCreateFeedbackSessionId() {
  const existing = localStorage.getItem(FEEDBACK_SESSION_KEY);
  if (existing) return existing;

  const generated =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `session_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

  localStorage.setItem(FEEDBACK_SESSION_KEY, generated);
  return generated;
}

export function buildRecommendationFeedbackPayload({
  project,
  preferences,
  sourcePage,
  feedbackType,
  comment = ""
}) {
  return {
    sessionId: getOrCreateFeedbackSessionId(),
    sourcePage,
    feedbackType,
    comment: safeString(comment),

    projectId: safeString(project?._id),
    projectTitle: safeString(project?.title),
    projectType: safeString(project?.projectType),
    technologies: toArray(project?.technologies),

    uiRank: Number(project?.uiRank || 0) || null,
    score: Number(project?.score || 0),
    geminiAvailable: Boolean(project?.geminiAvailable),
    geminiConfidence: Number(project?.geminiConfidence || 0),
    geminiFitSummary: safeString(project?.geminiFitSummary || project?.fitSummary),
    whyRecommended: toArray(project?.whyRecommended).slice(0, 3),

    userPreferences: {
      skill: safeString(preferences?.skill),
      difficulty: safeString(preferences?.difficulty),
      projectType: safeString(preferences?.projectType),
      interests: toArray(preferences?.interests),
      languages: toArray(preferences?.languages)
    }
  };
}

export function buildFeedbackAnalytics(projectsOrMap = [], maybeMap = null) {
  let projects = [];
  let feedbackMap = {};

  if (Array.isArray(projectsOrMap)) {
    projects = projectsOrMap;
    feedbackMap = maybeMap && typeof maybeMap === "object" ? maybeMap : {};
  } else if (projectsOrMap && typeof projectsOrMap === "object") {
    feedbackMap = projectsOrMap;
  }

  const feedbackEntries = Object.values(feedbackMap);

  const totalResponses = feedbackEntries.reduce(
    (sum, item) => sum + Number(item?.totalResponses || 0),
    0
  );
  const helpfulCount = feedbackEntries.reduce(
    (sum, item) => sum + Number(item?.helpfulCount || 0),
    0
  );
  const notHelpfulCount = feedbackEntries.reduce(
    (sum, item) => sum + Number(item?.notHelpfulCount || 0),
    0
  );
  const favoriteCount = feedbackEntries.reduce(
    (sum, item) => sum + Number(item?.favoriteCount || 0),
    0
  );

  const helpfulRate =
    totalResponses > 0
      ? Number(((helpfulCount / totalResponses) * 100).toFixed(1))
      : 0;

  const favoriteRate =
    totalResponses > 0
      ? Number(((favoriteCount / totalResponses) * 100).toFixed(1))
      : 0;

  const projectsWithFeedback = feedbackEntries.length;
  const totalProjects = Array.isArray(projects) ? projects.length : 0;

  const byProject = (Array.isArray(projects) ? projects : [])
    .map((project) => {
      const stats = feedbackMap[String(project?._id)] || {
        totalResponses: 0,
        helpfulCount: 0,
        notHelpfulCount: 0,
        favoriteCount: 0,
        avgScore: 0,
        avgGeminiConfidence: 0
      };

      return {
        ...project,
        feedback: stats
      };
    })
    .sort((a, b) => {
      const aResponses = Number(a.feedback?.totalResponses || 0);
      const bResponses = Number(b.feedback?.totalResponses || 0);

      if (aResponses !== bResponses) return bResponses - aResponses;

      const aFav = Number(a.feedback?.favoriteCount || 0);
      const bFav = Number(b.feedback?.favoriteCount || 0);

      return bFav - aFav;
    });

  return {
    overview: {
      totalProjects,
      projectsWithFeedback,
      totalResponses,
      helpfulCount,
      notHelpfulCount,
      favoriteCount,
      helpfulRate,
      favoriteRate
    },
    byProject
  };
}
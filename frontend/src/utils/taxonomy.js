// frontend/src/utils/taxonomy.js

function safeString(value) {
  return String(value || "").trim();
}

export function normalizeToken(value) {
  return safeString(value)
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function toArray(value) {
  if (Array.isArray(value)) {
    return value.map((item) => safeString(item)).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

const DIFFICULTY_ALIASES = {
  beginner: "easy",
  easy: "easy",
  basic: "easy",
  simple: "easy",

  intermediate: "medium",
  medium: "medium",
  moderate: "medium",

  advanced: "hard",
  hard: "hard",
  difficult: "hard",
  complex: "hard"
};

const PROJECT_TYPE_ALIASES = {
  web: "web application",
  website: "web application",
  "web app": "web application",
  "web application": "web application",
  frontend: "web application",
  "full stack": "web application",
  "full-stack": "web application",

  mobile: "mobile application",
  "mobile app": "mobile application",
  "mobile application": "mobile application",

  desktop: "desktop application",
  "desktop app": "desktop application",
  "desktop application": "desktop application",

  game: "game",
  games: "game",
  "game dev": "game",
  "game development": "game",

  dashboard: "data dashboard",
  "data dashboard": "data dashboard",
  "analytics dashboard": "data dashboard",
  visualization: "data dashboard",
  "data visualization": "data dashboard",

  ai: "ai tool",
  "ai tool": "ai tool",
  "machine learning tool": "ai tool",

  automation: "automation tool",
  "automation tool": "automation tool",

  research: "research project",
  "research project": "research project"
};

const TECHNOLOGY_ALIASES = {
  js: ["javascript"],
  javascript: ["javascript", "web", "frontend"],
  html: ["html", "web", "frontend"],
  css: ["css", "web", "frontend"],

  react: ["react", "javascript", "frontend", "web"],
  "react.js": ["react", "javascript", "frontend", "web"],
  node: ["node.js", "javascript", "backend", "web"],
  nodejs: ["node.js", "javascript", "backend", "web"],
  "node.js": ["node.js", "javascript", "backend", "web"],
  express: ["express", "node.js", "javascript", "backend", "web"],
  mongodb: ["mongodb", "database", "nosql"],
  postgres: ["postgresql", "database", "sql"],
  postgresql: ["postgresql", "database", "sql"],
  mysql: ["mysql", "database", "sql"],

  python: ["python", "backend", "ai", "data science"],
  fastapi: ["fastapi", "python", "backend", "web"],
  django: ["django", "python", "backend", "web"],
  flask: ["flask", "python", "backend", "web"],

  tensorflow: ["tensorflow", "python", "ai", "machine learning"],
  pytorch: ["pytorch", "python", "ai", "machine learning"],
  "scikit-learn": ["scikit-learn", "python", "machine learning", "data science"],
  sklearn: ["scikit-learn", "python", "machine learning", "data science"],
  pandas: ["pandas", "python", "data science", "data visualization"],
  numpy: ["numpy", "python", "data science"],

  flutter: ["flutter", "dart", "mobile"],
  dart: ["dart", "flutter", "mobile"],
  firebase: ["firebase", "mobile", "backend"],

  "c#": ["c#", "unity", "games"],
  csharp: ["c#", "unity", "games"],
  unity: ["unity", "c#", "games"],
  unity3d: ["unity", "c#", "games"],

  cpp: ["c++", "systems"],
  "c++": ["c++", "systems"],

  solidity: ["solidity", "blockchain", "web3"],
  ethereum: ["ethereum", "blockchain", "web3"],
  web3: ["web3", "blockchain"]
};

const CATEGORY_ALIASES = {
  web: ["web", "frontend", "backend", "full stack"],
  frontend: ["frontend", "web"],
  backend: ["backend", "web"],
  "full stack": ["full stack", "web", "frontend", "backend"],

  ai: ["ai", "machine learning"],
  "artificial intelligence": ["ai", "machine learning"],
  ml: ["machine learning", "ai"],
  "machine learning": ["machine learning", "ai"],
  "data science": ["data science", "ai", "machine learning"],

  mobile: ["mobile"],
  games: ["games", "game development"],
  game: ["games", "game development"],
  "game development": ["games", "game development"],

  cybersecurity: ["cybersecurity", "security", "networks"],
  security: ["cybersecurity", "security"],
  networks: ["networks", "cybersecurity"],

  education: ["education", "learning", "edtech"],
  edtech: ["education", "learning", "edtech"],

  "e-commerce": ["e-commerce", "commerce", "marketplace"],
  ecommerce: ["e-commerce", "commerce", "marketplace"],
  commerce: ["e-commerce", "commerce"],

  "data visualization": ["data visualization", "analytics", "dashboard"],
  dashboard: ["data visualization", "analytics", "dashboard"],
  dashboards: ["data visualization", "analytics", "dashboard"],
  analytics: ["analytics", "data visualization", "dashboard"],

  finance: ["finance", "personal finance"],
  health: ["health", "fitness"],
  fitness: ["health", "fitness"],
  automation: ["automation", "workflow"],
  productivity: ["productivity", "automation"]
};

export function canonicalDifficulty(value) {
  const normalized = normalizeToken(value);
  return DIFFICULTY_ALIASES[normalized] || normalized;
}

export function canonicalProjectType(value) {
  const normalized = normalizeToken(value);
  return PROJECT_TYPE_ALIASES[normalized] || normalized;
}

export function expandTechnology(value) {
  const normalized = normalizeToken(value);
  return TECHNOLOGY_ALIASES[normalized] || [normalized];
}

export function expandCategory(value) {
  const normalized = normalizeToken(value);
  return CATEGORY_ALIASES[normalized] || [normalized];
}

function expandTerms(values = [], expander) {
  const expanded = new Set();

  toArray(values).forEach((value) => {
    expander(value).forEach((term) => {
      const normalized = normalizeToken(term);
      if (normalized) expanded.add(normalized);
    });
  });

  return Array.from(expanded);
}

export function expandTechnologies(values = []) {
  return expandTerms(values, expandTechnology);
}

export function expandCategories(values = []) {
  return expandTerms(values, expandCategory);
}

export function expandProject(project = {}) {
  const technologies = toArray(project.technologies);
  const categories = toArray(project.categories);

  const expandedTechnologies = expandTechnologies(technologies);
  const expandedCategories = [
    ...new Set([
      ...expandCategories(categories),
      ...expandedTechnologies.filter((term) =>
        [
          "web",
          "frontend",
          "backend",
          "mobile",
          "games",
          "ai",
          "machine learning",
          "data science",
          "data visualization",
          "dashboard",
          "cybersecurity",
          "security",
          "networks",
          "e-commerce",
          "automation"
        ].includes(term)
      )
    ])
  ];

  return {
    difficulty: canonicalDifficulty(project.difficulty),
    projectType: canonicalProjectType(project.projectType),
    technologies: expandedTechnologies,
    categories: expandedCategories
  };
}

export function expandUserPreferences(preferences = {}) {
  return {
    skill: normalizeToken(preferences.skill),
    difficulty: canonicalDifficulty(preferences.difficulty),
    projectType: canonicalProjectType(preferences.projectType),
    languages: expandTechnologies(preferences.languages),
    interests: expandCategories(preferences.interests)
  };
}

export function overlapDetails(a = [], b = []) {
  const setB = new Set(toArray(b).map(normalizeToken));
  return toArray(a)
    .map(normalizeToken)
    .filter((item) => item && setB.has(item));
}

export function overlapCount(a = [], b = []) {
  return overlapDetails(a, b).length;
}

export function overlapRatio(a = [], b = []) {
  const left = [...new Set(toArray(a).map(normalizeToken).filter(Boolean))];
  const right = [...new Set(toArray(b).map(normalizeToken).filter(Boolean))];

  if (!left.length || !right.length) return 0;

  return overlapCount(left, right) / Math.min(left.length, right.length);
}
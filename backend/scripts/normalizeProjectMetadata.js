// backend/scripts/normalizeProjectMetadata.js
const path = require("path");
const mongoose = require("mongoose");

require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const Project = require("../models/Project");

const CONFIRM = process.argv.includes("--confirm");

function safeString(value) {
  return String(value || "").trim();
}

function uniqueArray(values = []) {
  const seen = new Set();
  const result = [];

  values.forEach((value) => {
    const clean = safeString(value);

    if (!clean) return;

    const key = clean.toLowerCase();

    if (!seen.has(key)) {
      seen.add(key);
      result.push(clean);
    }
  });

  return result;
}

function normalizeBase(value) {
  return safeString(value)
    .replace(/\s+/g, " ")
    .replace(/_/g, "-")
    .trim()
    .toLowerCase();
}

const difficultyMap = {
  easy: "easy",
  beginner: "easy",
  basic: "easy",

  medium: "medium",
  intermediate: "medium",
  moderate: "medium",

  hard: "hard",
  advanced: "hard",
  difficult: "hard"
};

const projectTypeMap = {
  "web application": "web application",
  web: "web application",
  website: "web application",
  "frontend application": "web application",

  "mobile application": "mobile application",
  mobile: "mobile application",
  "mobile app": "mobile application",

  "ai tool": "ai tool",
  "ai system": "ai tool",
  "machine learning": "ai tool",
  "machine learning project": "ai tool",
  "ml project": "ai tool",

  "data dashboard": "data dashboard",
  dashboard: "data dashboard",
  analytics: "data dashboard",
  "analytics dashboard": "data dashboard",

  game: "game",
  "game project": "game",
  "unity game": "game",

  "research project": "research project",
  research: "research project",

  "automation tool": "automation tool",
  automation: "automation tool",

  "hardware project": "hardware project",
  hardware: "hardware project",
  iot: "hardware project",
  "iot project": "hardware project",

  "vr application": "vr application",
  vr: "vr application",
  "virtual reality": "vr application",

  "blockchain project": "blockchain project",
  blockchain: "blockchain project",
  web3: "blockchain project"
};

const technologyMap = {
  js: "javascript",
  javascript: "javascript",

  html: "html",
  css: "css",

  react: "react",
  "react.js": "react",
  reactjs: "react",

  node: "node.js",
  nodejs: "node.js",
  "node.js": "node.js",

  express: "express",
  "express.js": "express",

  mongodb: "mongodb",
  mongo: "mongodb",

  postgresql: "postgresql",
  postgres: "postgresql",

  python: "python",

  flask: "flask",
  fastapi: "fastapi",

  pandas: "pandas",
  "scikit learn": "scikit-learn",
  "scikit-learn": "scikit-learn",
  sklearn: "scikit-learn",

  tensorflow: "tensorflow",
  "tensorflow.js": "tensorflow.js",
  keras: "keras",
  pytorch: "pytorch",

  flutter: "flutter",
  dart: "dart",
  firebase: "firebase",

  unity: "unity",
  "unity3d": "unity",
  csharp: "c#",
  "c#": "c#",

  cpp: "c++",
  "c++": "c++",

  c: "c",
  rust: "rust",
  go: "go",
  golang: "go",

  arduino: "arduino",
  mqtt: "mqtt",
  linux: "linux",

  solidity: "solidity",
  ethereum: "ethereum",
  web3: "web3.js",
  "web3.js": "web3.js",

  charts: "charts",
  chartjs: "chart.js",
  "chart.js": "chart.js",
  recharts: "recharts",

  api: "api",
  "rest api": "rest api",
  "network tools": "network tools",
  nlp: "nlp",
  crypto: "crypto",
  "localstorage": "localstorage",
  "local storage": "localstorage",
  "vr sdk": "vr sdk"
};

const categoryMap = {
  ai: "ai",
  "artificial intelligence": "ai",

  web: "web",
  frontend: "frontend",
  backend: "backend",
  "full stack": "full-stack",
  fullstack: "full-stack",

  data: "data science",
  "data science": "data science",
  analytics: "analytics",
  dashboard: "dashboard",
  "data visualization": "data visualization",

  education: "education",
  learning: "learning",

  productivity: "productivity",
  finance: "finance",
  health: "health",

  "ecommerce": "e-commerce",
  "e-commerce": "e-commerce",
  marketplace: "marketplace",
  inventory: "inventory",

  security: "cybersecurity",
  cybersecurity: "cybersecurity",
  networks: "networks",
  systems: "systems",

  mobile: "mobile",

  game: "games",
  games: "games",
  "game development": "game development",
  strategy: "strategy",
  "procedural generation": "procedural generation",

  iot: "iot",
  hardware: "hardware",

  blockchain: "blockchain",
  web3: "web3",

  vr: "vr",
  "virtual reality": "vr",

  entertainment: "entertainment",
  "ui/ux": "ui/ux",
  "computer vision": "computer vision",
  "natural language processing": "natural language processing"
};

function normalizeDifficulty(value) {
  const key = normalizeBase(value);
  return difficultyMap[key] || key || "";
}

function normalizeProjectType(value) {
  const key = normalizeBase(value);
  return projectTypeMap[key] || key || "";
}

function normalizeTechnology(value) {
  const key = normalizeBase(value);
  return technologyMap[key] || key || "";
}

function normalizeCategory(value) {
  const key = normalizeBase(value);
  return categoryMap[key] || key || "";
}

function normalizeTechnologies(values = []) {
  return uniqueArray(values.map(normalizeTechnology).filter(Boolean));
}

function normalizeCategories(values = []) {
  return uniqueArray(values.map(normalizeCategory).filter(Boolean));
}

function shallowArrayEqual(a = [], b = []) {
  if (a.length !== b.length) return false;
  return a.every((value, index) => value === b[index]);
}

function buildChanges(project) {
  const next = {
    difficulty: normalizeDifficulty(project.difficulty),
    projectType: normalizeProjectType(project.projectType),
    technologies: normalizeTechnologies(project.technologies || []),
    categories: normalizeCategories(project.categories || [])
  };

  const changes = {};

  if (safeString(project.difficulty) !== next.difficulty) {
    changes.difficulty = {
      before: project.difficulty,
      after: next.difficulty
    };
  }

  if (safeString(project.projectType) !== next.projectType) {
    changes.projectType = {
      before: project.projectType,
      after: next.projectType
    };
  }

  if (!shallowArrayEqual(project.technologies || [], next.technologies)) {
    changes.technologies = {
      before: project.technologies || [],
      after: next.technologies
    };
  }

  if (!shallowArrayEqual(project.categories || [], next.categories)) {
    changes.categories = {
      before: project.categories || [],
      after: next.categories
    };
  }

  return {
    next,
    changes
  };
}

async function connectDb() {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI missing from .env");
  }

  await mongoose.connect(process.env.MONGO_URI);
}

async function main() {
  console.log("");
  console.log("Project Metadata Normalization");
  console.log(`Mode: ${CONFIRM ? "WRITE" : "DRY RUN"}`);
  console.log("");

  await connectDb();

  const projects = await Project.find().lean();

  console.log(`Projects loaded: ${projects.length}`);

  let changedCount = 0;
  const updates = [];

  projects.forEach((project) => {
    const { next, changes } = buildChanges(project);
    const hasChanges = Object.keys(changes).length > 0;

    if (!hasChanges) return;

    changedCount += 1;

    updates.push({
      _id: project._id,
      title: project.title,
      next,
      changes
    });

    console.log("");
    console.log(`CHANGE: ${project.title}`);

    Object.entries(changes).forEach(([field, diff]) => {
      console.log(`- ${field}:`);
      console.log(`  before: ${JSON.stringify(diff.before)}`);
      console.log(`  after : ${JSON.stringify(diff.after)}`);
    });
  });

  console.log("");
  console.log(`Projects needing changes: ${changedCount}`);

  if (!CONFIRM) {
    console.log("");
    console.log("DRY RUN ONLY. Nothing was changed.");
    console.log("To apply changes, run:");
    console.log("npm run normalize:projects -- --confirm");
    await mongoose.disconnect();
    return;
  }

  for (const update of updates) {
    await Project.updateOne(
      { _id: update._id },
      {
        $set: {
          difficulty: update.next.difficulty,
          projectType: update.next.projectType,
          technologies: update.next.technologies,
          categories: update.next.categories
        }
      }
    );
  }

  console.log("");
  console.log(`Updated projects: ${updates.length}`);
  console.log("Normalization complete.");

  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error("Normalization failed:", error.message);

  try {
    await mongoose.disconnect();
  } catch {
    // ignore
  }

  process.exit(1);
});
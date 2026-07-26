// backend/scripts/auditProjectDataset.js
const path = require("path");
const mongoose = require("mongoose");

require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const Project = require("../models/Project");

const REQUIRED_PROJECT_TYPES = [
  "web application",
  "mobile application",
  "ai tool",
  "data dashboard",
  "game",
  "research project",
  "automation tool",
  "hardware project",
  "vr application",
  "blockchain project"
];

const REQUIRED_DIFFICULTIES = ["easy", "medium", "hard"];

const IMPORTANT_TECHNOLOGIES = [
  "javascript",
  "python",
  "react",
  "node.js",
  "html",
  "css",
  "flutter",
  "dart",
  "c#",
  "unity",
  "mongodb",
  "postgresql",
  "rust",
  "go",
  "c++",
  "tensorflow",
  "solidity",
  "mqtt"
];

const IMPORTANT_CATEGORIES = [
  "web",
  "ai",
  "machine learning",
  "mobile",
  "games",
  "cybersecurity",
  "education",
  "e-commerce",
  "data visualization",
  "finance",
  "health",
  "productivity",
  "automation",
  "iot",
  "hardware",
  "blockchain",
  "web3",
  "vr",
  "systems",
  "networks"
];

function safeString(value) {
  return String(value || "").trim();
}

function normalize(value) {
  return safeString(value).toLowerCase();
}

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function countBy(projects, getter) {
  const map = new Map();

  projects.forEach((project) => {
    const values = getter(project);

    safeArray(values).forEach((value) => {
      const key = normalize(value);
      if (!key) return;
      map.set(key, (map.get(key) || 0) + 1);
    });
  });

  return map;
}

function statusFromCount(count) {
  if (count >= 6) return "Strong";
  if (count >= 4) return "Acceptable";
  if (count >= 1) return "Weak";
  return "Missing";
}

function printTable(title, rows) {
  console.log("");
  console.log(title);
  console.log("-".repeat(title.length));

  rows.forEach((row) => {
    console.log(row.join(" | "));
  });
}

function findDuplicateTitles(projects) {
  const map = new Map();

  projects.forEach((project) => {
    const key = normalize(project.title);
    if (!key) return;

    if (!map.has(key)) {
      map.set(key, []);
    }

    map.get(key).push(project.title);
  });

  return Array.from(map.entries())
    .filter(([, titles]) => titles.length > 1)
    .map(([key, titles]) => ({ key, titles }));
}

function findMetadataIssues(projects) {
  const issues = [];

  projects.forEach((project) => {
    if (!safeString(project.title)) {
      issues.push({ title: "(missing title)", issue: "Missing title" });
    }

    if (!safeString(project.description)) {
      issues.push({ title: project.title, issue: "Missing description" });
    }

    if (!safeString(project.difficulty)) {
      issues.push({ title: project.title, issue: "Missing difficulty" });
    }

    if (!safeString(project.projectType)) {
      issues.push({ title: project.title, issue: "Missing projectType" });
    }

    if (!safeArray(project.technologies).length) {
      issues.push({ title: project.title, issue: "Missing technologies" });
    }

    if (!safeArray(project.categories).length) {
      issues.push({ title: project.title, issue: "Missing categories" });
    }

    if (project.difficulty && !REQUIRED_DIFFICULTIES.includes(normalize(project.difficulty))) {
      issues.push({
        title: project.title,
        issue: `Unexpected difficulty: ${project.difficulty}`
      });
    }

    if (project.projectType && !REQUIRED_PROJECT_TYPES.includes(normalize(project.projectType))) {
      issues.push({
        title: project.title,
        issue: `Unexpected projectType: ${project.projectType}`
      });
    }
  });

  return issues;
}

async function connectDb() {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI missing from .env");
  }

  await mongoose.connect(process.env.MONGO_URI);
}

async function main() {
  await connectDb();

  const projects = await Project.find().lean();

  console.log("");
  console.log("Project Dataset Audit");
  console.log("=====================");
  console.log(`Total projects: ${projects.length}`);

  const duplicateTitles = findDuplicateTitles(projects);
  const metadataIssues = findMetadataIssues(projects);

  console.log(`Duplicate titles: ${duplicateTitles.length}`);
  console.log(`Metadata issues: ${metadataIssues.length}`);

  const projectTypeCounts = countBy(projects, (project) => [project.projectType]);
  const difficultyCounts = countBy(projects, (project) => [project.difficulty]);
  const technologyCounts = countBy(projects, (project) => project.technologies);
  const categoryCounts = countBy(projects, (project) => project.categories);

  printTable("Project Type Coverage", [
    ["Project Type", "Count", "Status"],
    ...REQUIRED_PROJECT_TYPES.map((type) => {
      const count = projectTypeCounts.get(type) || 0;
      return [type, String(count), statusFromCount(count)];
    })
  ]);

  printTable("Difficulty Coverage", [
    ["Difficulty", "Count"],
    ...REQUIRED_DIFFICULTIES.map((difficulty) => [
      difficulty,
      String(difficultyCounts.get(difficulty) || 0)
    ])
  ]);

  printTable("Technology Coverage", [
    ["Technology", "Count", "Status"],
    ...IMPORTANT_TECHNOLOGIES.map((technology) => {
      const count = technologyCounts.get(technology) || 0;
      return [technology, String(count), statusFromCount(count)];
    })
  ]);

  printTable("Category Coverage", [
    ["Category", "Count", "Status"],
    ...IMPORTANT_CATEGORIES.map((category) => {
      const count = categoryCounts.get(category) || 0;
      return [category, String(count), statusFromCount(count)];
    })
  ]);

  if (duplicateTitles.length) {
    console.log("");
    console.log("Duplicate Titles");
    duplicateTitles.forEach((item) => {
      console.log(`- ${item.key}: ${item.titles.join(", ")}`);
    });
  }

  if (metadataIssues.length) {
    console.log("");
    console.log("Metadata Issues");
    metadataIssues.forEach((issue) => {
      console.log(`- ${issue.title}: ${issue.issue}`);
    });
  }

  console.log("");
  if (metadataIssues.length === 0 && duplicateTitles.length === 0) {
    console.log("AUDIT VERDICT: CLEAN");
  } else {
    console.log("AUDIT VERDICT: NEEDS CLEANUP");
  }

  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error("Dataset audit failed:", error.message);

  try {
    await mongoose.disconnect();
  } catch {
    // ignore
  }

  process.exit(1);
});
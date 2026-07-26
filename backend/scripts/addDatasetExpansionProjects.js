// backend/scripts/addDatasetExpansionProjects.js
const path = require("path");
const mongoose = require("mongoose");

require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const Project = require("../models/Project");

const CONFIRM = process.argv.includes("--confirm");

const expansionProjects = [
  {
    title: "Automated Invoice Processing Workflow",
    description:
      "An automation tool that extracts invoice data, validates important fields, detects duplicates, and exports structured records for accounting review.",
    difficulty: "medium",
    projectType: "automation tool",
    technologies: ["python", "api", "postgresql"],
    categories: ["automation", "productivity", "finance", "backend"],
    features:
      "Invoice upload, field extraction, validation rules, duplicate detection, status tracking, exportable accounting records.",
    learning:
      "Workflow automation, backend processing, validation rules, finance automation, structured data extraction."
  },
  {
    title: "Customer Support Ticket Automation System",
    description:
      "A workflow automation platform that classifies support tickets, assigns priority, routes requests, and tracks resolution status.",
    difficulty: "medium",
    projectType: "automation tool",
    technologies: ["node.js", "react", "mongodb", "api"],
    categories: ["automation", "productivity", "backend", "analytics"],
    features:
      "Ticket classification, priority scoring, automated routing, status dashboard, response-time analytics.",
    learning:
      "Automation rules, workflow design, API development, dashboard analytics, customer support operations."
  },
  {
    title: "Restaurant Inventory Reorder Automation",
    description:
      "An automation tool that tracks ingredient stock, predicts low inventory, and generates suggested reorder lists for restaurant managers.",
    difficulty: "medium",
    projectType: "automation tool",
    technologies: ["node.js", "react", "postgresql", "charts"],
    categories: ["automation", "inventory", "productivity", "analytics"],
    features:
      "Inventory tracking, reorder thresholds, supplier notes, consumption charts, automatic reorder suggestions.",
    learning:
      "Business workflow automation, inventory logic, PostgreSQL data modeling, dashboard design."
  },
  {
    title: "Go Background Job Scheduler",
    description:
      "A backend automation service that schedules recurring tasks, retries failed jobs, and exposes job status through an API dashboard.",
    difficulty: "hard",
    projectType: "automation tool",
    technologies: ["go", "postgresql", "api"],
    categories: ["automation", "backend", "systems", "productivity"],
    features:
      "Recurring job scheduling, retry logic, job queue status, failure logs, API-based job control.",
    learning:
      "Backend automation, job queues, Go services, scheduling logic, system reliability."
  },
  {
    title: "Secure Backup Automation Service",
    description:
      "A secure backup automation system that encrypts selected folders, schedules backups, verifies file integrity, and records backup history.",
    difficulty: "hard",
    projectType: "automation tool",
    technologies: ["rust", "postgresql", "crypto"],
    categories: ["automation", "cybersecurity", "systems", "productivity"],
    features:
      "Scheduled backups, encryption, checksum verification, backup history, failed-backup alerts.",
    learning:
      "Rust systems programming, secure automation, encryption workflows, reliability checks."
  },

  {
    title: "MQTT Industrial Sensor Alert Platform",
    description:
      "An IoT platform that receives MQTT sensor readings, detects abnormal values, and displays alerts in a real-time monitoring dashboard.",
    difficulty: "medium",
    projectType: "hardware project",
    technologies: ["python", "mqtt", "react", "postgresql"],
    categories: ["iot", "hardware", "automation", "data visualization"],
    features:
      "MQTT ingestion, threshold alerts, live sensor charts, device health status, alert history.",
    learning:
      "IoT messaging, MQTT workflows, real-time dashboards, sensor alerting, industrial monitoring."
  },
  {
    title: "IoT Home Energy Monitoring System",
    description:
      "A smart energy monitoring system that tracks electricity usage, visualizes consumption trends, and detects abnormal usage spikes.",
    difficulty: "medium",
    projectType: "hardware project",
    technologies: ["python", "arduino", "mqtt", "react", "charts"],
    categories: ["iot", "hardware", "data visualization", "automation"],
    features:
      "Energy readings, usage charts, anomaly alerts, device-level summaries, exportable energy reports.",
    learning:
      "Sensor integration, IoT dashboards, energy analytics, MQTT communication, anomaly detection."
  },
  {
    title: "Smart Greenhouse Automation Controller",
    description:
      "An IoT automation project that monitors soil moisture, temperature, and humidity, then recommends irrigation or ventilation actions.",
    difficulty: "medium",
    projectType: "hardware project",
    technologies: ["python", "arduino", "mqtt"],
    categories: ["iot", "hardware", "automation", "health"],
    features:
      "Sensor readings, irrigation recommendations, environmental alerts, device status, historical trends.",
    learning:
      "IoT sensor workflows, automation rules, environmental monitoring, hardware-software integration."
  },
  {
    title: "Wearable Health Vitals Monitoring Dashboard",
    description:
      "A health-focused hardware dashboard that collects wearable-style vitals data, tracks patterns, and flags abnormal readings.",
    difficulty: "medium",
    projectType: "hardware project",
    technologies: ["python", "mqtt", "react", "postgresql"],
    categories: ["iot", "hardware", "health", "data visualization"],
    features:
      "Vitals ingestion, heart-rate charting, abnormal reading alerts, patient summary cards, trend reports.",
    learning:
      "Health monitoring workflows, IoT data ingestion, dashboard design, anomaly flagging."
  },
  {
    title: "C++ Embedded Telemetry Parser",
    description:
      "A systems-style hardware project that parses telemetry streams from embedded devices and summarizes device health metrics.",
    difficulty: "hard",
    projectType: "hardware project",
    technologies: ["c++", "mqtt", "arduino"],
    categories: ["hardware", "iot", "systems", "networks"],
    features:
      "Telemetry parsing, packet validation, device status summaries, error counters, CSV export.",
    learning:
      "Embedded systems data parsing, C++ systems programming, telemetry processing, IoT diagnostics."
  },

  {
    title: "Blockchain Voting Prototype",
    description:
      "A blockchain voting prototype that records votes on a smart-contract-backed ledger and demonstrates transparency, validation, and tamper resistance.",
    difficulty: "medium",
    projectType: "blockchain project",
    technologies: ["solidity", "ethereum", "react", "web3.js"],
    categories: ["blockchain", "web3", "security", "research"],
    features:
      "Vote casting, voter validation, immutable vote records, election summary, transaction history.",
    learning:
      "Blockchain logic, smart contracts, voting integrity, decentralized application structure."
  },
  {
    title: "Smart Contract Vulnerability Analyzer",
    description:
      "A blockchain security tool that scans Solidity contracts for common risky patterns and generates a readable vulnerability report.",
    difficulty: "hard",
    projectType: "blockchain project",
    technologies: ["solidity", "javascript", "web3.js", "ethereum"],
    categories: ["blockchain", "web3", "cybersecurity", "research"],
    features:
      "Solidity file upload, rule-based vulnerability checks, severity labels, exportable report, mitigation notes.",
    learning:
      "Smart contract security, static analysis, blockchain development, vulnerability reporting."
  },
  {
    title: "Decentralized Academic Credential Verifier",
    description:
      "A Web3 education prototype that stores credential hashes and lets institutions verify certificate authenticity without exposing private records.",
    difficulty: "medium",
    projectType: "blockchain project",
    technologies: ["solidity", "ethereum", "react", "web3.js"],
    categories: ["blockchain", "web3", "education", "security"],
    features:
      "Credential hash storage, verification form, issuer dashboard, transaction history, certificate status.",
    learning:
      "Blockchain verification, credential integrity, education systems, Web3 frontend integration."
  },
  {
    title: "Web3 Micro-Funding Marketplace",
    description:
      "A blockchain marketplace prototype where users can create small funding campaigns, track contributions, and verify transactions.",
    difficulty: "medium",
    projectType: "blockchain project",
    technologies: ["solidity", "node.js", "mongodb", "web3.js"],
    categories: ["blockchain", "web3", "finance", "marketplace"],
    features:
      "Campaign creation, contribution tracking, wallet transaction logs, funding progress cards, campaign status.",
    learning:
      "Web3 application design, funding workflows, transaction tracking, marketplace architecture."
  },

  {
    title: "VR Historical Museum Explorer",
    description:
      "A virtual reality learning experience that lets users explore historical exhibits, interact with artifacts, and follow guided educational paths.",
    difficulty: "medium",
    projectType: "vr application",
    technologies: ["unity", "c#", "vr sdk"],
    categories: ["vr", "education", "entertainment", "learning"],
    features:
      "Interactive exhibits, guided tour mode, artifact information panels, checkpoint-based learning path.",
    learning:
      "VR interaction design, Unity scene management, educational experience design, immersive UI."
  },
  {
    title: "VR Surgical Training Simulator",
    description:
      "A VR health training prototype where learners practice procedural steps in a guided surgical simulation environment.",
    difficulty: "hard",
    projectType: "vr application",
    technologies: ["unity", "c#", "vr sdk"],
    categories: ["vr", "health", "education", "simulation"],
    features:
      "Step-by-step procedure guidance, interactive instruments, mistake feedback, progress tracking.",
    learning:
      "Medical simulation design, VR training workflows, Unity interaction systems, educational assessment."
  },
  {
    title: "VR Classroom Science Lab",
    description:
      "A virtual science lab where students conduct safe simulated experiments, record observations, and receive guided explanations.",
    difficulty: "medium",
    projectType: "vr application",
    technologies: ["unity", "c#", "vr sdk"],
    categories: ["vr", "education", "learning", "simulation"],
    features:
      "Virtual experiment stations, guided instructions, observation notes, quiz checkpoints, experiment summary.",
    learning:
      "Immersive education design, VR lab interactions, learning checkpoints, Unity scene flow."
  },
  {
    title: "VR Emergency Response Training Simulator",
    description:
      "A VR training application that simulates emergency response scenarios and evaluates decision-making under pressure.",
    difficulty: "hard",
    projectType: "vr application",
    technologies: ["unity", "c#", "vr sdk"],
    categories: ["vr", "health", "systems", "simulation"],
    features:
      "Emergency scenarios, decision checkpoints, response scoring, guided replay, performance summary.",
    learning:
      "VR simulation, scenario-based training, decision evaluation, real-time interaction systems."
  },
  {
    title: "VR Architecture Walkthrough Builder",
    description:
      "A VR application that lets users explore architectural spaces, switch room layouts, and review design notes interactively.",
    difficulty: "medium",
    projectType: "vr application",
    technologies: ["unity", "c#", "vr sdk"],
    categories: ["vr", "design", "visualization", "learning"],
    features:
      "Room navigation, layout switching, annotation panels, guided walkthrough mode, saved viewpoints.",
    learning:
      "VR visualization, spatial UI, Unity navigation systems, design review workflows."
  },

  {
    title: "Rust File Integrity Monitor",
    description:
      "A security-focused command-line tool that tracks file hashes, detects unauthorized file changes, and generates tamper alerts for sensitive folders.",
    difficulty: "hard",
    projectType: "research project",
    technologies: ["rust", "linux", "crypto"],
    categories: ["cybersecurity", "systems", "research"],
    features:
      "File hashing, directory watch mode, change detection, alert logs, baseline snapshot generation.",
    learning:
      "Systems programming, file integrity monitoring, hashing, security auditing, command-line tooling."
  },
  {
    title: "Rust Log Analysis CLI for Security Events",
    description:
      "A command-line security analytics tool that parses server logs, detects suspicious login patterns, and produces concise incident summaries.",
    difficulty: "hard",
    projectType: "research project",
    technologies: ["rust", "linux", "regex"],
    categories: ["cybersecurity", "systems", "analytics", "research"],
    features:
      "Log parsing, suspicious pattern detection, failed-login summaries, IP frequency analysis, CSV export.",
    learning:
      "Log analysis, security monitoring, Rust CLI development, pattern detection, incident reporting."
  },
  {
    title: "C++ Network Packet Sniffer",
    description:
      "A low-level network analysis tool that captures packets, extracts protocol metadata, and summarizes suspicious traffic patterns.",
    difficulty: "hard",
    projectType: "research project",
    technologies: ["c++", "linux", "network tools"],
    categories: ["cybersecurity", "networks", "systems", "research"],
    features:
      "Packet capture, protocol filtering, suspicious traffic counters, exportable logs, terminal dashboard.",
    learning:
      "Network programming, packet analysis, Linux tooling, cybersecurity research, protocol inspection."
  },
  {
    title: "C++ Memory Allocation Visualizer",
    description:
      "A systems learning tool that visualizes memory allocation, stack/heap behavior, and common memory-management mistakes.",
    difficulty: "hard",
    projectType: "research project",
    technologies: ["c++", "charts"],
    categories: ["systems", "education", "learning", "visualization"],
    features:
      "Stack/heap diagrams, allocation timeline, memory leak examples, interactive code scenarios.",
    learning:
      "C++ memory management, systems education, visualization logic, debugging fundamentals."
  },
  {
    title: "C++ Pathfinding Simulation Engine",
    description:
      "A simulation project that visualizes grid-based pathfinding algorithms and compares performance across different search strategies.",
    difficulty: "medium",
    projectType: "game",
    technologies: ["c++", "charts"],
    categories: ["games", "systems", "strategy", "visualization"],
    features:
      "A* visualization, BFS/DFS comparison, obstacle editing, path cost metrics, simulation replay.",
    learning:
      "Algorithms, simulation design, pathfinding, performance comparison, C++ implementation."
  },

  {
    title: "Go Microservices Health Dashboard",
    description:
      "A backend-heavy monitoring platform that checks service uptime, latency, error rates, and exposes a dashboard for microservice health.",
    difficulty: "hard",
    projectType: "data dashboard",
    technologies: ["go", "react", "api", "postgresql"],
    categories: ["backend", "systems", "analytics", "dashboard"],
    features:
      "Service probes, latency tracking, API status cards, historical uptime chart, incident notes.",
    learning:
      "Backend monitoring, API design, service health checks, dashboard architecture, Go development."
  },
  {
    title: "Go API Rate Limiter Service",
    description:
      "A backend systems project that limits API requests, tracks usage patterns, and provides admin controls for throttling rules.",
    difficulty: "hard",
    projectType: "automation tool",
    technologies: ["go", "api", "postgresql"],
    categories: ["backend", "systems", "automation", "networks"],
    features:
      "Rate-limit rules, API key tracking, request counters, admin dashboard, blocked request logs.",
    learning:
      "API infrastructure, backend reliability, Go services, request throttling, system protection."
  },
  {
    title: "Go Distributed Task Queue",
    description:
      "A backend system that distributes tasks across workers, tracks job status, retries failures, and exposes queue metrics.",
    difficulty: "hard",
    projectType: "automation tool",
    technologies: ["go", "postgresql", "api"],
    categories: ["backend", "systems", "automation", "analytics"],
    features:
      "Worker registration, task queue, retry handling, job status API, queue metrics dashboard.",
    learning:
      "Distributed systems, task queues, backend automation, Go concurrency, reliability engineering."
  },

  {
    title: "TensorFlow Medical Image Classifier",
    description:
      "A health-focused computer vision project that classifies medical-style images and displays prediction confidence with evaluation summaries.",
    difficulty: "hard",
    projectType: "ai tool",
    technologies: ["python", "tensorflow", "keras"],
    categories: ["ai", "machine learning", "computer vision", "health"],
    features:
      "Image upload, class prediction, confidence display, confusion matrix summary, sample error review.",
    learning:
      "TensorFlow image classification, model evaluation, medical AI workflow, responsible prediction display."
  },
  {
    title: "TensorFlow Plant Disease Detector",
    description:
      "A computer vision AI tool that detects plant leaf disease categories and provides confidence scores and suggested next steps.",
    difficulty: "medium",
    projectType: "ai tool",
    technologies: ["python", "tensorflow", "fastapi"],
    categories: ["ai", "machine learning", "computer vision", "iot"],
    features:
      "Leaf image upload, disease prediction, confidence score, result explanation, prediction history.",
    learning:
      "TensorFlow inference, computer vision, FastAPI model serving, applied agricultural AI."
  },
  {
    title: "TensorFlow Object Counting Dashboard",
    description:
      "An AI dashboard that counts objects in uploaded images or frames and visualizes detection frequency over time.",
    difficulty: "hard",
    projectType: "ai tool",
    technologies: ["python", "tensorflow", "react", "charts"],
    categories: ["ai", "machine learning", "computer vision", "data visualization"],
    features:
      "Image/frame upload, object count summary, detection confidence, frequency chart, exportable results.",
    learning:
      "Object detection workflows, TensorFlow inference, dashboard integration, AI result visualization."
  }
];

function normalizeBase(value) {
  return String(value || "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

function normalizeArray(values = []) {
  const seen = new Set();
  const result = [];

  values.forEach((value) => {
    const clean = normalizeBase(value);
    if (!clean) return;

    if (!seen.has(clean)) {
      seen.add(clean);
      result.push(clean);
    }
  });

  return result;
}

function normalizeTitle(value) {
  return normalizeBase(value);
}

function canonicalProject(project) {
  return {
    title: String(project.title || "").trim(),
    description: String(project.description || "").trim(),
    difficulty: normalizeBase(project.difficulty),
    projectType: normalizeBase(project.projectType),
    technologies: normalizeArray(project.technologies),
    categories: normalizeArray(project.categories),
    features: String(project.features || "").trim(),
    learning: String(project.learning || "").trim()
  };
}

function validateProject(project) {
  const required = [
    "title",
    "description",
    "difficulty",
    "projectType",
    "features",
    "learning"
  ];

  for (const field of required) {
    if (!project[field]) {
      throw new Error(`Project "${project.title || "Untitled"}" is missing ${field}`);
    }
  }

  if (!project.technologies.length) {
    throw new Error(`Project "${project.title}" is missing technologies`);
  }

  if (!project.categories.length) {
    throw new Error(`Project "${project.title}" is missing categories`);
  }
}

async function connectDb() {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI missing from .env");
  }

  await mongoose.connect(process.env.MONGO_URI);
}

async function main() {
  console.log("");
  console.log("Dataset Expansion Projects");
  console.log(`Mode: ${CONFIRM ? "WRITE" : "DRY RUN"}`);
  console.log("");

  await connectDb();

  const existingProjects = await Project.find()
    .select({ title: 1 })
    .lean();

  const existingTitleKeys = new Set(
    existingProjects.map((project) => normalizeTitle(project.title))
  );

  const localTitleKeys = new Set();
  const projectsToInsert = [];
  let skippedExisting = 0;
  let skippedDuplicateInScript = 0;

  for (const rawProject of expansionProjects) {
    const project = canonicalProject(rawProject);
    validateProject(project);

    const titleKey = normalizeTitle(project.title);

    if (existingTitleKeys.has(titleKey)) {
      skippedExisting += 1;
      console.log(`SKIP existing: ${project.title}`);
      continue;
    }

    if (localTitleKeys.has(titleKey)) {
      skippedDuplicateInScript += 1;
      console.log(`SKIP duplicate in script: ${project.title}`);
      continue;
    }

    localTitleKeys.add(titleKey);
    projectsToInsert.push(project);

    console.log(`ADD: ${project.title}`);
    console.log(`  type: ${project.projectType}`);
    console.log(`  difficulty: ${project.difficulty}`);
    console.log(`  technologies: ${project.technologies.join(", ")}`);
    console.log(`  categories: ${project.categories.join(", ")}`);
  }

  console.log("");
  console.log(`Existing projects skipped: ${skippedExisting}`);
  console.log(`Duplicate script entries skipped: ${skippedDuplicateInScript}`);
  console.log(
    `New projects ${CONFIRM ? "to insert" : "that would be inserted"}: ${projectsToInsert.length}`
  );

  if (!CONFIRM) {
    console.log("");
    console.log("DRY RUN ONLY. Nothing was inserted.");
    console.log("To insert projects, run:");
    console.log("npm run expand:projects -- --confirm");
    await mongoose.disconnect();
    return;
  }

  if (projectsToInsert.length) {
    await Project.insertMany(projectsToInsert, { ordered: true });
  }

  console.log("");
  console.log(`Inserted projects: ${projectsToInsert.length}`);
  console.log("Dataset expansion complete.");

  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error("Dataset expansion failed:", error.message);

  try {
    await mongoose.disconnect();
  } catch {
    // ignore disconnect failure
  }

  process.exit(1);
});
const express = require("express");
const router = express.Router();
const Project = require("../models/Project");

function safeString(value) {
  return String(value || "").trim();
}

function toArray(value) {
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

function normalizeProjectUpdate(body = {}) {
  return {
    title: safeString(body.title),
    description: safeString(body.description),
    difficulty: safeString(body.difficulty),
    projectType: safeString(body.projectType),
    technologies: toArray(body.technologies),
    categories: toArray(body.categories),
    features: safeString(body.features),
    learning: safeString(body.learning)
  };
}

function computeProjectAudit(project = {}) {
  const technologies = toArray(project.technologies);
  const categories = toArray(project.categories);

  const checks = [
    {
      key: "title",
      label: "Title",
      weight: 15,
      passed: safeString(project.title).length >= 4
    },
    {
      key: "description",
      label: "Description",
      weight: 20,
      passed: safeString(project.description).length >= 40
    },
    {
      key: "difficulty",
      label: "Difficulty",
      weight: 10,
      passed: safeString(project.difficulty).length > 0
    },
    {
      key: "projectType",
      label: "Project Type",
      weight: 10,
      passed: safeString(project.projectType).length > 0
    },
    {
      key: "technologies",
      label: "Technologies",
      weight: 15,
      passed: technologies.length >= 2
    },
    {
      key: "categories",
      label: "Categories",
      weight: 15,
      passed: categories.length >= 1
    },
    {
      key: "features",
      label: "Features",
      weight: 8,
      passed: safeString(project.features).length >= 20
    },
    {
      key: "learning",
      label: "Learning Path",
      weight: 7,
      passed: safeString(project.learning).length >= 20
    }
  ];

  const earned = checks.reduce(
    (sum, check) => sum + (check.passed ? check.weight : 0),
    0
  );

  const missingFields = checks
    .filter((check) => !check.passed)
    .map((check) => check.label);

  const qualityBand =
    earned >= 85 ? "Strong" : earned >= 60 ? "Needs improvement" : "Weak";

  return {
    projectId: String(project._id || ""),
    title: safeString(project.title) || "Untitled Project",
    difficulty: safeString(project.difficulty),
    projectType: safeString(project.projectType),
    technologies,
    categories,
    descriptionLength: safeString(project.description).length,
    featuresLength: safeString(project.features).length,
    learningLength: safeString(project.learning).length,
    metadataScore: earned,
    qualityBand,
    missingFields
  };
}

// GET /projects
router.get("/", async (_req, res) => {
  try {
    const projects = await Project.find().lean();
    return res.json(projects);
  } catch (error) {
    console.error("Projects GET error:", error);
    return res.status(500).json({ error: "Failed to fetch projects." });
  }
});

// GET /projects/audit
router.get("/audit", async (_req, res) => {
  try {
    const projects = await Project.find().lean();
    const auditedProjects = projects.map(computeProjectAudit);

    const summary = {
      totalProjects: auditedProjects.length,
      strongCount: auditedProjects.filter((item) => item.qualityBand === "Strong")
        .length,
      needsImprovementCount: auditedProjects.filter(
        (item) => item.qualityBand === "Needs improvement"
      ).length,
      weakCount: auditedProjects.filter((item) => item.qualityBand === "Weak")
        .length,
      avgMetadataScore:
        auditedProjects.length > 0
          ? Number(
              (
                auditedProjects.reduce(
                  (sum, item) => sum + Number(item.metadataScore || 0),
                  0
                ) / auditedProjects.length
              ).toFixed(1)
            )
          : 0
    };

    return res.json({
      summary,
      projects: auditedProjects.sort(
        (a, b) => Number(a.metadataScore || 0) - Number(b.metadataScore || 0)
      )
    });
  } catch (error) {
    console.error("Projects audit GET error:", error);
    return res.status(500).json({ error: "Failed to audit project dataset." });
  }
});

// GET /projects/:id
router.get("/:id", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).lean();

    if (!project) {
      return res.status(404).json({ error: "Project not found." });
    }

    return res.json(project);
  } catch (error) {
    console.error("Project GET by id error:", error);
    return res.status(500).json({ error: "Failed to fetch project." });
  }
});

// PUT /projects/:id
router.put("/:id", async (req, res) => {
  try {
    const normalized = normalizeProjectUpdate(req.body || {});

    if (!normalized.title || !normalized.description) {
      return res.status(400).json({
        error: "Title and description are required."
      });
    }

    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      { $set: normalized },
      {
        runValidators: true,
        returnDocument: "after"
      }
    ).lean();

    if (!updatedProject) {
      return res.status(404).json({ error: "Project not found." });
    }

    return res.json({
      success: true,
      message: "Project updated successfully.",
      project: updatedProject
    });
  } catch (error) {
    console.error("Project PUT error:", error);
    return res.status(500).json({ error: "Failed to update project." });
  }
});

module.exports = router;
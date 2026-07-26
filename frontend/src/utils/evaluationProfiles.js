// frontend/src/utils/evaluationProfiles.js

export const evaluationProfiles = [
  {
    id: "beginner-web-js",
    label: "Beginner Web + JavaScript",
    description:
      "Tests whether the system prioritizes simple buildable web projects for a beginner JavaScript learner.",
    payload: {
      skill: "beginner",
      difficulty: "easy",
      interests: ["web", "frontend", "ui/ux"],
      projectType: "web application",
      languages: ["javascript", "html", "css"]
    }
  },
  {
    id: "beginner-ai-python",
    label: "Beginner AI + Python",
    description:
      "Checks whether AI/data-friendly beginner projects are surfaced for a Python-first learner.",
    payload: {
      skill: "beginner",
      difficulty: "easy",
      interests: ["ai", "machine learning", "data science"],
      projectType: "ai tool",
      languages: ["python"]
    }
  },
  {
    id: "intermediate-mobile-flutter",
    label: "Intermediate Mobile + Flutter",
    description:
      "Checks mobile-oriented recommendations and whether Flutter projects rank high enough.",
    payload: {
      skill: "intermediate",
      difficulty: "medium",
      interests: ["mobile", "productivity", "education"],
      projectType: "mobile application",
      languages: ["flutter", "dart"]
    }
  },
  {
    id: "advanced-cybersecurity",
    label: "Advanced Cybersecurity",
    description:
      "Tests whether deeper security/system-heavy projects outrank generic CRUD ideas.",
    payload: {
      skill: "advanced",
      difficulty: "hard",
      interests: ["cybersecurity", "networks", "systems"],
      projectType: "research project",
      languages: ["python", "javascript", "c++"]
    }
  },
  {
    id: "game-dev-csharp",
    label: "Game Dev + C#",
    description:
      "Checks whether game-related recommendations align with the expected stack and domain.",
    payload: {
      skill: "intermediate",
      difficulty: "medium",
      interests: ["games", "game development", "simulation"],
      projectType: "game",
      languages: ["c#", "unity"]
    }
  },
  {
    id: "data-dashboard-react-node",
    label: "Data Dashboard + React/Node",
    description:
      "Checks whether dashboard and analytics projects score well for web-focused data builders.",
    payload: {
      skill: "intermediate",
      difficulty: "medium",
      interests: ["data visualization", "analytics", "dashboard"],
      projectType: "data dashboard",
      languages: ["javascript", "react", "node.js"]
    }
  },
  {
    id: "ecommerce-fullstack",
    label: "E-commerce Full Stack",
    description:
      "Validates whether practical commercial product ideas outrank unrelated academic-only ideas.",
    payload: {
      skill: "intermediate",
      difficulty: "medium",
      interests: ["e-commerce", "payments", "inventory"],
      projectType: "web application",
      languages: ["javascript", "node.js", "mongodb"]
    }
  },
  {
    id: "education-ai-tools",
    label: "Education + AI Tools",
    description:
      "Checks whether assistive or educational AI tools are recommended with clear fit explanations.",
    payload: {
      skill: "intermediate",
      difficulty: "medium",
      interests: ["education", "ai", "productivity"],
      projectType: "ai tool",
      languages: ["javascript", "python"]
    }
  }
];
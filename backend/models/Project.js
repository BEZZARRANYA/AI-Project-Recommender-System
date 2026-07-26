// backend/models/Project.js
const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    technologies: { type: [String], required: true },
    difficulty: { type: String, required: true },
    categories: { type: [String], required: true },  // e.g., AI, Web, Mobile
    projectType: { type: String, required: true },    // Web application, Mobile app, etc.
    features: { type: String },
    learning: { type: String }
});

module.exports = mongoose.model("Project", projectSchema);

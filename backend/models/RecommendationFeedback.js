// backend/models/RecommendationFeedback.js
const mongoose = require("mongoose");

const RecommendationFeedbackSchema = new mongoose.Schema(
  {
    runId: {
      type: String,
      default: "",
      index: true
    },

    sessionId: {
      type: String,
      default: "",
      index: true
    },

    projectId: {
      type: String,
      default: ""
    },

    projectKey: {
      type: String,
      required: true,
      index: true
    },

    projectTitle: {
      type: String,
      required: true
    },

    baseTitle: {
      type: String,
      default: ""
    },

    personalizedTitle: {
      type: String,
      default: ""
    },

    projectType: {
      type: String,
      default: ""
    },

    difficulty: {
      type: String,
      default: ""
    },

    feedbackType: {
      type: String,
      enum: ["helpful", "not_relevant", "favorite"],
      required: true,
      index: true
    },

    note: {
      type: String,
      default: ""
    },

    score: {
      type: Number,
      default: 0
    },

    deterministicScore: {
      type: Number,
      default: 0
    },

    geminiScore: {
      type: Number,
      default: 0
    },

    aiConfidence: {
      type: Number,
      default: 0
    },

    geminiConfidence: {
      type: Number,
      default: 0
    },

    aiEnhanced: {
      type: Boolean,
      default: false
    },

    geminiAvailable: {
      type: Boolean,
      default: false
    },

    userPreferences: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },

    recommendationSnapshot: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

RecommendationFeedbackSchema.index({ runId: 1, createdAt: -1 });
RecommendationFeedbackSchema.index({ projectKey: 1, createdAt: -1 });
RecommendationFeedbackSchema.index({ feedbackType: 1, createdAt: -1 });

module.exports = mongoose.model(
  "RecommendationFeedback",
  RecommendationFeedbackSchema
);
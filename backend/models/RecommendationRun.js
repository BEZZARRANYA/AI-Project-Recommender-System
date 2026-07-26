// backend/models/RecommendationRun.js
const mongoose = require("mongoose");

const RecommendationRunSchema = new mongoose.Schema(
  {
    runId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },

    sessionId: {
      type: String,
      default: "",
      index: true
    },

    userPreferences: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },

    normalizedPreferences: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },

    recommendations: {
      type: [mongoose.Schema.Types.Mixed],
      default: []
    },

    topRecommendation: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },

    geminiUsed: {
      type: Boolean,
      default: false,
      index: true
    },

    geminiModel: {
      type: String,
      default: ""
    },

    geminiReason: {
      type: String,
      default: ""
    },

    fallbackUsed: {
      type: Boolean,
      default: false
    },

    totalRecommendations: {
      type: Number,
      default: 0
    },

    geminiRecommendations: {
      type: Number,
      default: 0
    },

    fallbackRecommendations: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

RecommendationRunSchema.index({ createdAt: -1 });
RecommendationRunSchema.index({ sessionId: 1, createdAt: -1 });

module.exports = mongoose.model("RecommendationRun", RecommendationRunSchema);
// backend/seedTargetedProjects.js
const mongoose = require("mongoose");
const path = require("path");
const Project = require("./models/Project");
const targetedProjects = require("./data/targetedProjects");

require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

async function seedTargetedProjects() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing from .env");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected.");

    let created = 0;
    let updated = 0;

    for (const project of targetedProjects) {
      const result = await Project.findOneAndUpdate(
        { title: project.title },
        { $set: project },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true
        }
      );

      if (result.createdAt && result.updatedAt) {
        const createdTime = new Date(result.createdAt).getTime();
        const updatedTime = new Date(result.updatedAt).getTime();

        if (Math.abs(updatedTime - createdTime) < 1000) {
          created += 1;
        } else {
          updated += 1;
        }
      } else {
        updated += 1;
      }

      console.log(`Upserted: ${project.title}`);
    }

    console.log("----------------------------------------");
    console.log(`Targeted projects processed: ${targetedProjects.length}`);
    console.log(`Likely created: ${created}`);
    console.log(`Likely updated: ${updated}`);
    console.log("----------------------------------------");

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Targeted seed failed:", error);
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  }
}

seedTargetedProjects();
// backend/scripts/fixFeedbackIndexes.js
const mongoose = require("mongoose");
const path = require("path");

require("dotenv").config({
  path: path.resolve(__dirname, "../../.env")
});

function sameKeySpec(a = {}, b = {}) {
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);

  if (aKeys.length !== bKeys.length) return false;

  return aKeys.every((key) => a[key] === b[key]);
}

async function collectionExists(db, collectionName) {
  const collections = await db
    .listCollections({ name: collectionName })
    .toArray();

  return collections.length > 0;
}

async function ensureIndex(collection, indexes, keySpec, options = {}) {
  const existing = indexes.find((index) => sameKeySpec(index.key, keySpec));

  if (existing) {
    console.log(`Index already exists for ${JSON.stringify(keySpec)} as "${existing.name}". Skipping.`);
    return;
  }

  const createdName = await collection.createIndex(keySpec, options);
  console.log(`Created index: ${createdName}`);
}

async function main() {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error("MONGO_URI is missing from .env");
  }

  const shouldClear = process.argv.includes("--clear");

  await mongoose.connect(mongoUri);
  console.log("Connected to MongoDB");

  const db = mongoose.connection.db;
  const collectionName = "recommendationfeedbacks";

  const exists = await collectionExists(db, collectionName);

  if (!exists) {
    console.log(`Collection "${collectionName}" does not exist yet. Nothing to fix.`);
    await mongoose.disconnect();
    return;
  }

  const collection = db.collection(collectionName);

  let indexes = await collection.indexes();

  console.log("Current indexes:");
  indexes.forEach((index) => {
    console.log(JSON.stringify(index, null, 2));
  });

  for (const index of indexes) {
    const isBadUniqueProjectKeyIndex =
      index.unique === true &&
      index.key &&
      Object.keys(index.key).length === 1 &&
      index.key.projectKey === 1;

    if (isBadUniqueProjectKeyIndex) {
      console.log(`Dropping bad unique index: ${index.name}`);
      await collection.dropIndex(index.name);
    }
  }

  indexes = await collection.indexes();

  await ensureIndex(collection, indexes, { projectKey: 1, createdAt: -1 }, {
    name: "projectKey_createdAt_idx"
  });

  indexes = await collection.indexes();

  await ensureIndex(collection, indexes, { feedbackType: 1, createdAt: -1 }, {
    name: "feedbackType_createdAt_idx"
  });

  if (shouldClear) {
    const result = await collection.deleteMany({});
    console.log(`Cleared old feedback documents: ${result.deletedCount}`);
  }

  const updatedIndexes = await collection.indexes();

  console.log("Updated indexes:");
  updatedIndexes.forEach((index) => {
    console.log(JSON.stringify(index, null, 2));
  });

  await mongoose.disconnect();

  console.log("Feedback indexes fixed successfully.");
}

main().catch(async (error) => {
  console.error("Failed to fix feedback indexes:", error);

  try {
    await mongoose.disconnect();
  } catch {
    // ignore disconnect failure
  }

  process.exit(1);
});
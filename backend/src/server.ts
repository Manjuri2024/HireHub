import http from "http";
import mongoose from "mongoose";
import { app } from "./app";
import { env } from "./config/env";
import { initSocket } from "./socket";
import { aiAvailable } from "./services/ai";

async function connectDb() {
  try {
    await mongoose.connect(env.mongoUri, { serverSelectionTimeoutMS: 8000 });
    console.log("MongoDB: connected");
  } catch (e) {
    console.error("MongoDB: connection FAILED. Retrying in 10s.");
    console.error("  Reason:", (e as Error).message.split("\n")[0]);
    console.error("  Fix: Atlas > Network Access > add your current IP, and check MONGODB_URI in backend/.env");
    setTimeout(connectDb, 10000);
  }
}

const server = http.createServer(app);
initSocket(server);

server.listen(env.port, () => {
  console.log(`HireHub API listening on :${env.port}`);
  console.log(aiAvailable() ? "Gemini AI: enabled" : "Gemini AI: DEMO MODE (no GEMINI_API_KEY)");
  connectDb();
});
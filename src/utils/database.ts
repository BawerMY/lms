import mongoose from "mongoose";
import { env } from "../config/env.js";

export async function connectDatabase(): Promise<void> {
  await mongoose.connect(env.MONGO_URI);
  console.log(`[db] connected to ${env.MONGO_URI}`);
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
  console.log("[db] disconnected");
}

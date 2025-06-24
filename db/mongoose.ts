import { env } from "@/lib/env";
import mongoose from "mongoose";

let isConnected = false;

export async function connectToDB() {
  mongoose.set("strictQuery", true);

  if (!env.DATABASE_URI) return console.log("Missing DATABASE_URI");

  if (isConnected) return console.log("MongoDB is already connected!");

  try {
    await mongoose.connect(env.DATABASE_URI);
    isConnected = true;
    const connection = mongoose.connection;

    connection.on("error", (error) =>
      console.log("MongoDB connection error: ", error)
    );

    connection.on("connected", () => {
      console.log("MongoDB connected successfully!");
      process.exit();
    });

  } catch (error) {
    console.log(error);
  }
}

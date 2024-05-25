import mongoose from "mongoose";

let isConnected = false;

export const connectToDB = async () => {
  mongoose.set("strictQuery", true);

  if (!process.env.MONGODB_URI) return console.log("Missing MONGODB_URI");

  if (isConnected) {
    console.log("MongoDB is already connected");
    return;
  };

  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    isConnected = true;
    const connection = mongoose.connection;

    connection.on("connected", () => {
      console.log("MongoDB connected");
    })

    connection.on("error", (err) => {
      console.log('MongoDB connection error: ', err);
      process.exit();
    })

  } catch (error) {
    console.log(error);
    
  };
};
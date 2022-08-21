import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import helmet from "helmet";
import { connectDB } from "./startup/db.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";
import userRoutes from "./routes/userRoutes.js";

dotenv.config();

const startServer = async () => {
  connectDB();

  const app = express();

  app.use(express.json());

  if (process.env.ENVIRONMENT === "development") app.use(morgan("dev"));
  app.use(helmet());

  app.use("/api/users", userRoutes);

  app.use(notFound);
  app.use(errorHandler);

  const PORT = process.env.PORT || 5001;

  app.listen(PORT, () => {
    console.log(`Server running on PORT ${PORT}. 🚀`);
  });
};

startServer();

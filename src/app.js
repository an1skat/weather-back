import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";

import { register, login, refresh } from "./controllers/authController.js";
import { authMiddleware } from "./middleware/authMiddleware.js";

dotenv.config();

const app = express();

app.use(express.json());

app.post("/auth/register", register);
app.post("/auth/login", login);
app.post("/auth/refresh", refresh);
app.use(authMiddleware);

app.get("/user/me", (req, res) => {
  res.json({ message: "OK", userId: req.userId });
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

export default app;

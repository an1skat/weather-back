import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

import { auth, refresh } from "./controllers/authController.js";
import { authMiddleware } from "./middleware/authMiddleware.js";
import {
	addWeather,
	deleteWeather,
	getWeather
} from './controllers/weatherController.js';

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors({
	origin: "*",
	credentials: true,
}))

app.post("/auth", auth);
app.post("/auth/refresh", refresh);
app.use(authMiddleware);

app.post('/weather/add', addWeather);
app.delete('/weather/delete', deleteWeather);
app.get('/weather/:id', getWeather);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

export default app;

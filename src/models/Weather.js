import mongoose, { Schema } from "mongoose";

const WeatherSchema = new Schema({
	_id: String,
	city: String,
	country: String,
	icon: String,
	temp: Number,
	feelslike: Number,
	maxtemp: Number,
	mintemp: Number,
	humidity: Number,
	pressure: Number,
	wind: Number,
	visibility: String,
});

export const Weather = mongoose.model("Weather", WeatherSchema);

import {Weather} from '../models/Weather.js';

export const addWeather = async (req, res) => {
	try {
		const {_id, city, country, icon, temp, feelslike, maxtemp, mintemp, humidity, pressure, wind, visibility} = req.body;
		
		const weather = new Weather({
			_id,
			city,
			country,
			icon,
			temp,
			feelslike,
			maxtemp,
			mintemp,
			humidity,
			pressure,
			wind,
			visibility
		});
		
		await weather.save();
		return res.status(201).json({
			message: "Weather added",
		});
	} catch (err) {
		console.error(err);
	}
}
export const deleteWeather = async (req, res) => {
	const {_id} = req.body;
	const weather = await Weather.findByIdAndDelete(_id);
	return res.status(200).json({
		message: "Weather removed",
	})
}

export const getWeather = async (req, res) => {
	const id = req.params.id;
	Weather.findById(id)
		.then(doc => res.status(302).json(doc))
		.catch(err => res.status(500).json({ error: err.message }));
}
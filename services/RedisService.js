const Redis = require("ioredis");

const mongoose = require("mongoose");
const { UserModel } = require("../models/UserModel");
const { AvailableCities } = require("../models/CityModel");
const { HistoryModel } = require("../models/HistoryModel");


const publisher = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD
});

const subscriber = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD
});

module.exports.subscribeWeather = async (city, email) => {
  subscriber.subscribe(city);
  subscriber.on("message", async (city, message) => {
    message = JSON.parse(message);
    if(message.cityName != city) return;
    const user = await UserModel.findOne({ email });
    const userId = user._id.toString();
    const selectedCity = await AvailableCities.findOne({ cityName: city });
    const cityId = selectedCity._id.toString();
    const temperature = message.temperature;
    const history = HistoryModel({
      userId,
      cityId: new mongoose.Types.ObjectId(cityId),
      temperature,
    });
    await history.save();
  });
};

module.exports.publishWeather = async (cityName) => {
  try {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${process.env.API_KEY}`);
    const data = await response.json();
    const temperature = data.main.temp;

    const message = {
      temperature,
      cityName
    };

    await publisher.publish(cityName, JSON.stringify(message));
  } catch (err) {
    console.log(err.message);
  }
};

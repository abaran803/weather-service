const Redis = require("ioredis");

const mongoose = require("mongoose");
const { UserModel } = require("../models/UserModel");
const { AvailableCities } = require("../models/CityModel");
const { HistoryModel } = require("../models/HistoryModel");

const publisher = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
});

const subscriber = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
});

module.exports.subscribeWeather = async (city, email) => {
  await subscriber.subscribe(city);
  let channelCity = city;
  await subscriber.on("message", async (city2, message) => {
    message = JSON.parse(message);
    if (channelCity === city2) {
      const user = await UserModel.findOne({ email });
      const userId = user._id.toString();
      const selectedCity = await AvailableCities.findOne({
        cityName: channelCity,
      });
      const cityId = selectedCity._id.toString();
      const temperature = message.temperature;
      await HistoryModel.create({
        userId,
        cityId: new mongoose.Types.ObjectId(cityId),
        temperature,
      });
    }
  });
};

module.exports.publishWeather = async (cityName) => {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${process.env.API_KEY}`
    );
    const data = await response.json();
    const temperature = data.main.temp;

    const message = {
      temperature,
      cityName,
    };

    await publisher.publish(cityName, JSON.stringify(message));
  } catch (err) {
    console.log(err.message);
  }
};

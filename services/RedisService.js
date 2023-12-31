const Redis = require("ioredis");
const fetch = (...args) => import('node-fetch')
                .then(({default: fetch}) => fetch(...args));

const mongoose = require("mongoose");
const { UserModel } = require("../models/UserModel");
const { AvailableCities } = require("../models/CityModel");
const { HistoryModel } = require("../models/HistoryModel");
const mailer = require("../email");

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
      const {condition, temperature} = message
      await HistoryModel.create({
        userId,
        cityId: new mongoose.Types.ObjectId(cityId),
        temperature,
      });
      if(user.alertTypes && user.alertTypes.find(item => item == condition)) {
        mailer(email, {city, condition, type: 'important'});
      }
      mailer(email, {city, temperature, type: 'simple'});
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
    const condition = data.weather[0].main;

    const message = {
      temperature,
      condition,
      cityName,
    };

    await publisher.publish(cityName, JSON.stringify(message));
  } catch (err) {
    console.log(err.message);
  }
};

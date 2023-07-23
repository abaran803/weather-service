const { AvailableCities } = require("../models/CityModel");
const { UserModel } = require("../models/UserModel");
const {
  subscribeWeather,
  publishWeather,
} = require("../services/RedisService");

let prevInterval;

const publishWeatherIntervalFunction = async () => {
  try {
    const activeCities = await AvailableCities.find({ active: 1 });
    for (let i = 0; i < activeCities.length; i++) {
      await publishWeather(activeCities[i].cityName);
    }
    console.log("All cities weather updated");
  } catch (err) {
    console.log("Unable to Publish Weather");
  }
};

const setWeatherInterval = (millisecond) => {
  if (prevInterval) {
    clearInterval(prevInterval);
  }
  let selectedInterval = setInterval(async () => {
    prevInterval = selectedInterval;
      await publishWeatherIntervalFunction();
  }, millisecond);
};

const updateWeatherInterval = (millisecond) => {
  setWeatherInterval(millisecond);
};

const updateSubscribersOnServerStart = async () => {
  try {
    await AvailableCities.updateMany({}, { active: 0 });
    const users = await UserModel.find({});
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      const subscribedCitiesIds = user.subscribedCitiesId;
      for (let j = 0; j < subscribedCitiesIds.length; j++) {
        const updateCity = await AvailableCities.findByIdAndUpdate(
          {
            _id: subscribedCitiesIds[j].id,
          },
          {
            $set: {
              active: 1,
            },
          }
        );
        await subscribeWeather(updateCity.cityName, user.email);
      }
    }
    console.log("All previous user subscribed");
    publishWeatherIntervalFunction();
  } catch (err) {
    console.log("Error:", err.message);
  }
};

module.exports = {
  setWeatherInterval,
  updateWeatherInterval,
  updateSubscribersOnServerStart,
  publishWeatherIntervalFunction
};

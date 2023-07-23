const { AvailableCities } = require("../models/CityModel");
const { HistoryModel } = require("../models/HistoryModel");
const { UserModel } = require("../models/UserModel");
const { subscribeWeather } = require("../services/RedisService");

module.exports.subscribeCity = async (req, res) => {
  const { email, city } = req.body;
  try {
    // Check if user exists
    const checkUserStatus = await UserModel.findOne({ email });
    if (!checkUserStatus) {
      const user = new UserModel({ email });
      await user.save();
    }
    // Check if city exists
    const checkCityStatus = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&mode=json&units=metric&appid=${process.env.API_KEY}`);
    if (checkCityStatus.cod == '404') {
      throw new Error("City not found, please enter valid city");
    }
    let cityData = await AvailableCities.findOne({ cityName: city });
    if(!cityData) {
      const newCity = AvailableCities({cityName: city, active: 1});
      cityData = await newCity.save();
    }
    const cityId = cityData._id;
    // Check if already subscribed
    const checkSubscribedStatus = await UserModel.findOne({
      email,
      subscribedCitiesId: {
        $elemMatch: { id: cityId },
      },
    });
    if (checkSubscribedStatus) {
      throw new Error("User already subscribed to the city");
    }
    // Subscribing city
    await UserModel.findOneAndUpdate(
      { email },
      { $push: { subscribedCitiesId: { id: cityId } } }
    );
    // Activating city
    await AvailableCities.findOneAndUpdate({ cityName: city }, { active: 1 });
    // Adding to redis here
    await subscribeWeather(city, email);
    res.status(200).json({ message: "Saved Successfully!!" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports.checkHistory = async (req, res) => {
  const email = req.params.email;
  try {
    const checkUserExist = await UserModel.findOne({ email });
    if (!checkUserExist) {
      throw new Error("User not found!!");
    }
    const history = await HistoryModel.aggregate([
      { $match: { userId: checkUserExist._id.toString() } },
      {
        $lookup: {
          from: "cities",
          localField: "cityId",
          foreignField: "_id",
          as: "cityName",
        },
      },
      {
        $project: {
          _id: 0,
          cityName: "$cityName.cityName",
          temperature: 1,
        },
      },
    ]);
    res
      .status(200)
      .json(history.map((item) => ({ ...item, cityName: item.cityName[0] })));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

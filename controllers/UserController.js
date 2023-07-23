const { AvailableCities } = require("../models/CityModel");
const { HistoryModel } = require("../models/HistoryModel");
const { UserModel } = require("../models/UserModel");
const { subscribeWeather } = require("../services/RedisService");
const fetch = (...args) => import('node-fetch')
                .then(({default: fetch}) => fetch(...args));

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
    const checkCityStatus = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&mode=json&units=metric&appid=${process.env.API_KEY}`
    );
    if (checkCityStatus.status == "404" || checkCityStatus.cod == '404') {
      throw new Error("City not found, please enter valid city");
    }
    let cityData = await AvailableCities.findOne({ cityName: city });
    if (!cityData) {
      const newCity = AvailableCities({ cityName: city, active: 1 });
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
    // Get the current date and time
    const currentDate = new Date();
    // Calculate the date and time 24 hours ago from the current date
    const twentyFourHoursAgo = new Date(
      currentDate.getTime() - 24 * 60 * 60 * 1000
    );
    const history = await HistoryModel.aggregate([
      {
        $match: {
          userId: checkUserExist._id.toString(),
          createdAt: { $gte: twentyFourHoursAgo },
        },
      },
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

module.exports.activateAlert = async (req, res) => {
  try {
    const type = req.body.type;
    const email = req.body.email;
    const userData = await UserModel.findOne({email});
    if(!userData) {
      throw new Error("User not found!!");
    }
    if(userData.alertTypes.find(item => item == type)) {
      throw new Error("Already Activated!!");
    }
    if(userData.alertTypes) {
      await UserModel.findOneAndUpdate(
        { email },
        { $push: { alertTypes: type } }
      );
    } else {
      const alert = UserModel.findOneAndUpdate(
        { email },
        { alertTypes: [type] }
      );
      await alert.save();
    }
    res.status(200).json({message: "Alert added, but if the alert type is incorrect, you will never get any update"});
  } catch(err) {
    res.status(400).json({message: err.message});
  }
}
require('dotenv').config();
const bodyparser = require("body-parser");
const express = require("express");
const { setWeatherInterval, updateSubscribersOnServerStart } = require("./helpers/Utility");
const userRouter = require("./routes/user");
const adminRouter = require("./routes/admin");
const mongoose = require("mongoose");

const app = express();

const PORT = process.env.PORT || 3001;

mongoose.set('strictQuery', true);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to Database"))
  .catch((err) => console.log(err.message));

app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());

// Add all the saved email and cities to redis first time when server start
updateSubscribersOnServerStart();

// Setting default value for weather update
setWeatherInterval(1*60*60*1000);

app.use('/', userRouter);
app.use('/admin', adminRouter);

// app.delete("/unsubscribe", async (req, res) => {
//   const { email, city } = req.body;
//   try {
//     // Check if user exists
//     const checkUserStatus = await UserModel.findOne({ email });
//     if(!checkUserStatus) {
//       throw new Error("User not found!!");
//     }
//     // Check if city exists
//     const checkCityStatus = await AvailableCities.findOne({cityName: city});
//     if(!checkCityStatus) {
//       throw new Error("City not found, please enter valid city");
//     }
//     // Check if already subscribed
//     const cityId = checkCityStatus._id;
//     const checkSubscribedStatus = await UserModel.findOne({
//       email,
//       subscribedCitiesId: {
//         $elemMatch: {id: cityId}
//       }
//     })
//     if(!checkSubscribedStatus) {
//       throw new Error("Not subscribed!!");
//     }
//     // Subscribing city
//     await UserModel.findOneAndUpdate(
//       { email },
//       { $pull: { 'subscribedCitiesId': {id: cityId} }}
//     );
//     const checkIfAnyOtherSubscriber = await UserModel.find({
//       'subscribedCitiesId': {
//         $elemMatch: {"id": cityId}
//       }
//     })
//     if(!checkIfAnyOtherSubscriber.length) {
//       // Deactivating city
//       await AvailableCities.findOneAndUpdate({cityName: city}, {active: 0})
//     }
//     // Adding to redis here
//     await unSubscribeWeather(city, email);
//     res.status(200).json({ message: "Saved Successfully!!" });
//   } catch (err) {
//     res.status(400).json({message: err.message});
//   }
// });

app.listen(PORT, () => {
  console.log(`Server started at port ${PORT}`);
});

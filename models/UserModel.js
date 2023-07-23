const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: String,
  subscribedCitiesId: [{
    id: String
  }],
  alertTypes: [String]
});

module.exports.UserModel = mongoose.model("User", userSchema);
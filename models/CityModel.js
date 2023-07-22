const mongoose = require("mongoose");

const citiesSchema = new mongoose.Schema({
    cityName: String,
    active: Number
})

module.exports.AvailableCities = mongoose.model('City', citiesSchema);
const mongoose = require("mongoose");

const historySchema = new mongoose.Schema({
    userId: String,
    cityId: mongoose.Types.ObjectId,
    temperature: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
})

module.exports.HistoryModel = mongoose.model('history', historySchema);
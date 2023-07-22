const { updateWeatherInterval } = require("../helpers/Utility");

module.exports.weatherIntervalController = (req, res) => {
  const second = (req.query.second || 0) * (1000);
  const minute = (req.query.minute || 0) * (60*1000);
  const hour = (req.query.hour || 0) * (60*60*1000);
  try {
    // Publishing Weather
    updateWeatherInterval(second + minute + hour);
    res.status(200).json({ message: "Weather Interval Updated Successfully" });
  } catch (err) {
    res.status(400).json({ message: "Unable to update Interval" });
  }
};

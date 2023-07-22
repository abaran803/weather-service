const express = require('express');
const { weatherIntervalController } = require('../controllers/WeatherInterval');

const adminRouter = express.Router();

adminRouter.get("/changeInterval", weatherIntervalController);

module.exports = adminRouter;
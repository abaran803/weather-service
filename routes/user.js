const express = require('express');
const { subscribeCity, checkHistory, activateAlert } = require('../controllers/UserController');

const userRouter = express.Router();

userRouter.post("/subscribe", subscribeCity);
userRouter.post("/activate/alert", activateAlert);
userRouter.get("/history/:email", checkHistory);

module.exports = userRouter;
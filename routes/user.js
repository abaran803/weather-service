const express = require('express');
const { subscribeCity, checkHistory } = require('../controllers/UserController');

const userRouter = express.Router();

userRouter.post("/subscribe", subscribeCity);
userRouter.get("/history/:email", checkHistory);

module.exports = userRouter;
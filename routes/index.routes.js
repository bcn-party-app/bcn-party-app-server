const express = require("express");
const router = express.Router();

const User = require("../models/User.model");

const { isAuthenticated } = require("../middleware/jwt.middleware.js");


router.get("/", (req, res, next) => {
  res.json("All good in here");
});


//GET /api/user/ - retrieves current user data

router.get("/user", isAuthenticated, (req, res) => {
  console.log('payload', req.payload)
  res.status(200).json(req.payload)
})


module.exports = router;
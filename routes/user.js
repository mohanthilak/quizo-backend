const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../models/user");
const bcrypt = require("bcrypt");

router.get("/", (req, res) => {
  res.send("Welcome!");
});

router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) throw err;
    if (!user) res.send("No User Exists");
    else {
      req.logIn(user, (err) => {
        if (err) throw err;
        res.send({
          message: "successfully Authenticated",
          user,
          loggedIn: true,
        });
      });
    }
  })(req, res, next);
});

router.get("/getuser", async (req, res) => {
  console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!user!!!!!!!!!!!!!", req.user);
  console.log("req.body.user", req.body.user);
  if (req.user) {
    const user = await User.findOne(req.user).populate("Room");
    res.send({ isLoggedIn: true, user });
  } else {
    res.send({ isLoggedIn: false });
  }
});

router.get("/logout", (req, res) => {
  req.logout();
  if (!req.user) res.send({ isLoggedOut: true });
  else res.send({ isLoggedOut: false });
});

router.post("/register", (req, res) => {
  User.findOne({ username: req.body.username }, async (err, doc) => {
    if (err) throw err;
    if (doc) res.send("User Already Exists");
    if (!doc) {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      const newUser = new User({
        username: req.body.username,
        password: hashedPassword,
      });
      await newUser.save();
      req.logIn(newUser, (err) => {
        if (err) throw err;
        return res.send({ created: true, newUser });
      });
    }
  });
});

module.exports = router;

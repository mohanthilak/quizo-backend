const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const multer = require("multer");
const { storage, cloudinary } = require("../cloudinary/index");
const upload = multer({ storage });

router.get("/", (req, res) => {
  res.send("Welcome!");
});

router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) throw err;
    if (!user)
      res.send({ loggedIn: false, message: "Invalid Username/Password" });
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

router.post("/image/:id", upload.single("propic"), async (req, res) => {
  console.log("req.file", req.file);
  const user = await User.findById(req.params.id);
  if (user.image) {
    await cloudinary.uploader.destroy(user.image);
  }
  user.image = req.file.path;
  await user.save();
  res.json({ path: user.image });
});

module.exports = router;

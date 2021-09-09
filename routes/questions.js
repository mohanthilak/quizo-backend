const express = require("express");
const router = express.Router();
const Questions = require("../models/questions");
const Portal = require("../models/portals");

router.get("/portals/:id/questions", async (req, res) => {
  const { id } = req.params;
  const questions = await Portal.findById(id).populate("questions");
  //   console.log(questions);
  res.json({ questions, message: "got it" });
});

module.exports = router;

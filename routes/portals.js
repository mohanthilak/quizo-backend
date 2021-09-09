const express = require("express");
const router = express.Router();
const Portal = require("../models/portals");

router.get("/portals", async (req, res) => {
  try {
    const portals = await Portal.find({}).lean();
    res.json({ portals });
  } catch (e) {
    console.error(e);
    res.json({ message: "error", e: e });
  }

  //   const portals = await Portal.find({ __v: 10 });
  //   res.json({ portals });
});

module.exports = router;

const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Chat = require("../models/ChatRooms");

router.post("/user/:id/findusers", async (req, res) => {
  const { searchingUser } = req.body;
  console.log(searchingUser);
  //   { "$regex": "Alex", "$options": "i" }
  const users = await User.find({
    username: { $regex: searchingUser, $options: "i" },
  }).select("username image rooms");
  console.log("found uesr", users);
  if (users) {
    return res.json({ success: true, users });
  } else {
    return res.json({ success: false });
  }
});

router.post("/checkchat", async (req, res) => {
  const { clientId, userId } = req.body;
  if (clientId === "") return;
  const client = await User.findById(clientId);
  const chat = await Chat.findOne({
    users: { $size: 2, $all: [clientId, userId] },
  }).populate("messages");
  if (chat) res.json({ client, chat, textedBefore: true });
  else {
    res.json({ client, textedBefore: false });
  }
});

// router.get("/user/getdata", async (req, res) => {
//   console.log("/user/getdata");
//   if (req.user) {
//     const user = await User.find({ username: req.user.username })
//       .populate({
//         path: "rooms",
//         select: ["with"],
//         populate: "with",
//         select: ["username", "socketId"],
//       })
//       .select("-password");
//     console.log(user, "user");
//     res.send({ isLoggedIn: true, user });
//   } else {
//     res.send({ isloggedIn: false });
//   }
// });

router.get("/user/getdata", async (req, res) => {
  if (req.user) {
    const user = await User.find(
      { username: req.user.username },
      { username: 1, socketId: 1, image: 1 }
    )
      .populate({
        path: "rooms",
        select: { with: 1, _id: -1, room: -1 },
        populate: [{ path: "with", select: "username image" }],
      })
      .lean();
    for (let room of user[0].rooms) {
      if (room._id) delete room["_id"];
      if (room.room) delete room["room"];
    }
    res.send({ isLoggedIn: true, user });
  } else res.json({ isLoggedIn: false });
});

module.exports = router;

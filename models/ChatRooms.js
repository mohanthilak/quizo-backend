const mongoose = require("mongoose");
const { Schema } = mongoose;

const chatRoomSchema = new Schema({
  users: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  roomType: {
    type: String,
  },
  messages: [
    {
      type: Schema.Types.ObjectId,
      ref: "Message",
    },
  ],
  display: Boolean,
});

module.exports = mongoose.model("Room", chatRoomSchema);

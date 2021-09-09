const mongoose = require("mongoose");
const { Schema } = mongoose;

// const userSchema = new Schema({
//   username: String,
//   password: String,
//   isAdmin: Boolean,
//   socketId: String,
//   image: String,
//   rooms: [
//     {
//       with: {
//         type: Schema.Types.ObjectId,
//         ref: "User",
//       },
//       room: {
//         type: Schema.Types.ObjectId,
//         ref: "Room",
//       },
//     },
//   ],
// });

const roomSchema = new Schema({
  with: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  room: {
    type: Schema.Types.ObjectId,
    ref: "Room",
  },
});

const userSchema = new Schema({
  username: String,
  password: String,
  isAdmim: Boolean,
  socketId: String,
  rooms: [roomSchema],
});

module.exports = mongoose.model("User", userSchema);

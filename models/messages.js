const mongoose = require("mongoose");
const { Schema } = mongoose;

const messageSchema = new Schema({
  from: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  to: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  message: {
    type: String,
    require: true,
  },
  date: {
    type: Date,
    requied: true,
  },
});

module.exports = mongoose.model("Message", messageSchema);

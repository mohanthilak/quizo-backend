const mongoose = require("mongoose");
const { Schema } = mongoose;

const questionSchema = new Schema({
  question: {
    type: String,
    required: true,
  },
  a: String,
  b: String,
  c: String,
  d: String,
  answer: String,
});

module.exports = mongoose.model("Question", questionSchema);

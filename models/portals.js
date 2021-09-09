const mongoose = require("mongoose");
const { Schema } = mongoose;

const portalSchema = new Schema({
  animeName: String,
  image: String,
  season: String,
  episodes: String,
  questions: [
    {
      type: Schema.Types.ObjectId,
      ref: "Question",
    },
  ],
});

module.exports = mongoose.model("Portal", portalSchema);

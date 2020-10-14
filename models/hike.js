const mongoose = require("mongoose");

// MONGOOSE MODEL CONFIG
var hikeSchema = new mongoose.Schema({
  name: String,
  image: [],
  description: String,
  created: { type: Date, default: Date.now },
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
});

module.exports = mongoose.model("Hike", hikeSchema);

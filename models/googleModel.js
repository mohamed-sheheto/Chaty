const mongoose = require("mongoose");

const googleSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "username is required"],
      trim: true,
    },

    googleId: {
      type: String,
      required: [true, "googleId is required"],
    },
  },
  {
    timestamps: true,
  }
);

googleSchema.index({ googleId: 1 }, { unique: true });

module.exports = mongoose.model("Google", googleSchema);

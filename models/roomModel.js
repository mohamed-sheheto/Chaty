const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "room must have a name"],
    trim: true,
    minLength: [1, "room name cannot be empty"],
    maxLength: [50, "room name cannot exceed 50 characters"],
  },

  description: {
    type: String,
    trim: true,
    maxLength: [200, "description cannot exceed 200 characters"],
  },

  creator: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  members: [{ type: mongoose.Schema.ObjectId, ref: "User" }],

  isPrivate: {
    type: Boolean,
    default: false,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

roomSchema.index({ creator: 1 });
roomSchema.index({ isPrivate: 1 });
roomSchema.index({ members: 1 });
roomSchema.index({ name: 1, creator: 1 }, { unique: true });

roomSchema.pre("save", function () {
  if (this.isNew && this.creator) {
    if (!this.members.includes(this.creator)) {
      this.members.push(this.creator);
    }
  }
});

roomSchema.pre(/^find/, function () {
  this.populate({
    path: "creator",
    select: "username avatar",
  });
  this.populate({
    path: "members",
    select: "username avatar",
  });
});

module.exports = mongoose.model("Room", roomSchema);

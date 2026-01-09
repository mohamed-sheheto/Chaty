const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "username is required"],
    trim: true,
    minLength: [3, "username cannot be less than 3 chars"],
    maxLength: [20, "username cannot be more than 20 chars"],
  },

  email: {
    type: String,
    required: [true, "email is required"],
    trim: true,
    validate: {
      validator: validator.isEmail,
      message: "invalid email",
    },
  },

  password: {
    type: String,
    required: [true, "password is required"],
    minLength: [8, "password can't be less than 8 chars"],
    select: false,
  },

  avatar: {
    type: String,
    default: "default.jpg",
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

  lastSeen: {
    type: Date,
  },

  passwordChangedAt: {
    type: Date,
  },
});

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ username: 1 }, { unique: true });

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 12);

  this.passwordChangedAt = Date.now() - 1000;
});

userSchema.methods.checkPassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.changedPasswordAfter = function (JWTTimeStamp) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    console.log(JWTTimeStamp, changedTimeStamp);
    return JWTTimeStamp < changedTimeStamp;
  }

  return false;
};

module.exports = mongoose.model("User", userSchema);

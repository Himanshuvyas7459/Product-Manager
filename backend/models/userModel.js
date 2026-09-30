import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: {
      type: String,
      required: [true, "Please Enter User Name"],
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },
    password: {
      type: String,
      required: [true, "Please Enter Password"],
      minlength: 8,
      select: false
    },
  },
  {
    timestamps: true
  }
);

const User = mongoose.model("User", userSchema)

export default User;
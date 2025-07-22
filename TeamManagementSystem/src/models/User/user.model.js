import mongoose from "mongoose";
const { Schema } = mongoose;
const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    teams: [
      {
        team: {
          type: Schema.Types.ObjectId,
          ref: "Team",
          required: false,
        },
        role: {
          type: String,
          enum: ["Admin", "Member"],
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);

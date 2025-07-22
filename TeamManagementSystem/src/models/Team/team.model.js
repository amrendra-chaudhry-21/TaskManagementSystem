import mongoose from "mongoose";
const { Schema } = mongoose;
const teamSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

teamSchema.index({ name: 1, createdBy: 1 }, { unique: true });
export const Team = mongoose.model("Team", teamSchema);

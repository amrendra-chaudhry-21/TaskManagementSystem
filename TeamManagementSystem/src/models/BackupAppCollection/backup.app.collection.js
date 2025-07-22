import mongoose from "mongoose";
const { Schema } = mongoose;
const backupAppCollectionSchema = new Schema(
  {
    collectionName: {
      type: String,
      required: true,
    },
    data: {
      type: Array,
      required: true,
    },
    deletedItems: {
      type: Array,
    },
    backupReason: {
      type: String,
    },
    backupSize: {
      type: Number,
    },
    sizeFormatted: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);
backupAppCollectionSchema.virtual("backupTime").get(function () {
  return this.createdAt;
});

export const BackupAppCollection = mongoose.model(
  "BackupAppCollection",
  backupAppCollectionSchema
);

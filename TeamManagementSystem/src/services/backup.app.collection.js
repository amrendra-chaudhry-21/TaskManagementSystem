import { BackupAppCollection } from "../models/BackupAppCollection/backup.app.collection.js";

export const createBackup = async ({
  collectionName,
  data,
  backupReason = "manual",
}) => {
  if (!Array.isArray(data)) data = [data];
  const size = Buffer.byteLength(JSON.stringify(data));
  const sizeFormatted = `${(size / 1024).toFixed(2)} KB`;
  return BackupAppCollection.create({
    collectionName,
    data,
    deletedItems: data.map((d) => d._id),
    backupReason,
    backupSize: size,
    sizeFormatted,
  });
};

export const restoreBackup = async ({
  collectionName,
  backupId,
  mongooseConnection,
}) => {
  const backup = await BackupAppCollection.findById(backupId);
  if (!backup || backup.collectionName !== collectionName) {
    throw new Error("Backup not found or mismatched collection");
  }
  const model = mongooseConnection.model(collectionName);
  const restoredDocs = await model.insertMany(backup.data);
  return restoredDocs;
};

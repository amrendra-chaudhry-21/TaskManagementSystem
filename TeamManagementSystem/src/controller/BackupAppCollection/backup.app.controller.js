import mongoose from "mongoose";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { restoreBackup } from "../../services/backup.app.collection.js";

export const restoreCollectionHandler = asyncHandler(async (req, res) => {
  const { collectionName, backupId } = req.body;
  const restored = await restoreBackup({
    collectionName,
    backupId,
    mongooseConnection: mongoose,
  });
  res.status(200).json({
    success: true,
    restoredCount: restored.length,
    message: `${restored.length} docs restored to ${collectionName}`,
    data: restored,
  });
});

export const getRestoreCollectionHandler = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, collectionName } = req.query;
  const pageNumber = parseInt(page);
  const limitNumber = parseInt(limit);
  const baseQuery = collectionName ? { collectionName } : {};
  const [total, data] = await Promise.all([
    mongoose.model("BackupAppCollection").countDocuments(baseQuery).exec(),
    mongoose
      .model("BackupAppCollection")
      .find(baseQuery)
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber)
      .exec(),
  ]);
  if (!data || data.length === 0) {
    throw new ApiError(404, "Records Not Found!", {
      reason: collectionName
        ? `No records found for collection: ${collectionName}`
        : "No records available",
      solution: collectionName
        ? "Verify the collection name or check backup data"
        : "Check if any backups exist in the system",
    });
  }
  const totalPages = Math.ceil(total / limitNumber);
  res.status(200).json({
    success: true,
    statusCode: 200,
    message: collectionName
      ? `Retrieved ${data.length} records filtered by collection: ${collectionName}`
      : `Retrieved ${data.length} records successfully!`,
    pagination: {
      totalRecords: total,
      currentPage: pageNumber,
      totalPages,
      recordsPerPage: limitNumber,
      hasNextPage: pageNumber < totalPages,
      hasPreviousPage: pageNumber > 1,
    },
    data,
    filteredBy: collectionName ? { collectionName } : undefined,
  });
});

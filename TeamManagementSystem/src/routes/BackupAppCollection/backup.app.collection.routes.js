import { Router } from "express";
import { applyMethodRateLimits } from "../../middlewares/node.cache.middlewares.js";
import { getRestoreCollectionHandler } from "../../controller/BackupAppCollection/backup.app.controller.js";
const BackupCollectionRouter = Router();
const BackupCollectionRateLimits = {
  PUT: { capacity: 2000, refillRate: 200 },
  GET: { capacity: 500, refillRate: 50 },
};

applyMethodRateLimits(
  BackupCollectionRouter,
  "/restore-collection",
  BackupCollectionRateLimits
);

BackupCollectionRouter.route("/restore-collection").put(
  getRestoreCollectionHandler
);
BackupCollectionRouter.route("/restore-collection").get(
  getRestoreCollectionHandler
);
export default BackupCollectionRouter;

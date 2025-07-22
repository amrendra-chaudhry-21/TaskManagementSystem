import { Router } from "express";
import { applyMethodRateLimits } from "../../middlewares/node.cache.middlewares.js";
import { authenticateToken } from "../../middlewares/authToken.middleware.js";
import {
  createProjectHandler,
  deleteProjectHandler,
  listProjectsHandler,
  updateProjectHandler,
} from "../../controller/Project/project.controller.js";

const ProjectRouter = Router();

applyMethodRateLimits(ProjectRouter, "/project/create", {
  POST: {
    capacity: 100,
    refillRate: 10,
  },
});

applyMethodRateLimits(ProjectRouter, "/project/update/:id", {
  PUT: {
    capacity: 100,
    refillRate: 10,
  },
});

ProjectRouter.route("/project/create").post(
  authenticateToken,
  createProjectHandler
);

ProjectRouter.route("/project/delete").delete(
  authenticateToken,
  deleteProjectHandler
);
ProjectRouter.route("/project").get(authenticateToken, listProjectsHandler);
ProjectRouter.route("/project/update/:id").put(
  authenticateToken,
  updateProjectHandler
);

export default ProjectRouter;

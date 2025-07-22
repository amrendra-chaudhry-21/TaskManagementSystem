import { Router } from "express";
import { applyMethodRateLimits } from "../../middlewares/node.cache.middlewares.js";
import {
  addMemberHandler,
  createTeamHandler,
  deleteTeamHandler,
  listTeamsHandler,
  removeMemberHandler,
  updateTeamHandler,
} from "../../controller/Team/team.controller.js";
import { authenticateToken } from "../../middlewares/authToken.middleware.js";

const TeamRouter = Router();

applyMethodRateLimits(TeamRouter, "/team/create", {
  POST: {
    capacity: 100,
    refillRate: 10,
  },
});

applyMethodRateLimits(TeamRouter, "/team/add-member", {
  POST: {
    capacity: 100,
    refillRate: 10,
  },
});

TeamRouter.route("/team/create").post(authenticateToken, createTeamHandler);
TeamRouter.route("/team").get(authenticateToken, listTeamsHandler);
TeamRouter.route("/team/update/:id").put(authenticateToken, updateTeamHandler);
TeamRouter.route("/team/add-member").post(authenticateToken, addMemberHandler);
TeamRouter.route("/team/remove-member").post(
  authenticateToken,
  removeMemberHandler
);
TeamRouter.route("/team/delete/:id").delete(
  authenticateToken,
  deleteTeamHandler
);

export default TeamRouter;

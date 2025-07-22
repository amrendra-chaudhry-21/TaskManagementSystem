import { Router } from "express";
import { applyMethodRateLimits } from "../../middlewares/node.cache.middlewares.js";
import {
  createUserHandler,
  getAllUsersHandler,
  loginHandler,
  signupHandler,
} from "../../controller/User/user.controller.js";
import { authenticateToken } from "../../middlewares/authToken.middleware.js";

const UserRouter = Router();

applyMethodRateLimits(UserRouter, "/signup", {
  POST: {
    capacity: 100,
    refillRate: 10,
  },
});

applyMethodRateLimits(UserRouter, "/login", {
  POST: {
    capacity: 100,
    refillRate: 10,
  },
});

UserRouter.route("/signup").post(signupHandler);
UserRouter.route("/login").post(loginHandler);
UserRouter.route("/all-users").get(getAllUsersHandler);
UserRouter.route("/create").post(authenticateToken, createUserHandler);

export default UserRouter;

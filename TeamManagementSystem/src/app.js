import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import {
  requestIdMiddleware,
  securityMiddleware,
} from "./middlewares/security.middleware.js";
import { errorMiddleware } from "./utils/error.utils.js";
import BackupCollectionRouter from "./routes/BackupAppCollection/backup.app.collection.routes.js";
import UserRouter from "./routes/User/user.routes.js";
import TeamRouter from "./routes/Team/team.routes.js";
import ProjectRouter from "./routes/Project/project.routes.js";

const app = express();

app.use(cors());
securityMiddleware(app);
app.use(requestIdMiddleware);
// app.use(authenticateToken);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(express.static("public"));
app.use(cookieParser());

//routes declaration
app.use(process.env.API_URL, BackupCollectionRouter);
app.use(process.env.API_URL, UserRouter);
app.use(process.env.API_URL, TeamRouter);
app.use(process.env.API_URL, ProjectRouter);

app.use(errorMiddleware);
export { app };

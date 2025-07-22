import { Project } from "../../models/Project/project.model.js";
import { Team } from "../../models/Team/team.model.js";
import { User } from "../../models/User/user.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import mongoose from "mongoose";

export const createProjectHandler = asyncHandler(async (req, res) => {
  if (!req.user.roles.includes("Admin")) {
    throw new ApiError(403, "Forbidden!", {
      reason: "Only Admins can create projects!",
      solution: "Use an Admin account to perform this action!",
    });
  }
  const { name, description, teamId } = req.body;
  const userId = req.user.id;
  if (!name || !teamId) {
    throw new ApiError(400, "Missing required fields!", {
      reason: "Project name and team ID are mandatory!",
      solution: "Provide all required fields in the request body!",
    });
  }
  const team = await Team.findById(teamId);
  if (!team) {
    throw new ApiError(404, "Team not found!", {
      reason: "The specified team does not exist!",
      solution: "Check the team ID and try again!",
    });
  }
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found!", {
      reason: "The authenticated user does not exist!",
      solution: "Verify your authentication token or register a new account!",
    });
  }
  const userTeam = user.teams.find(
    (t) => t.team && t.team.toString() === teamId
  );
  if (!userTeam || userTeam.role !== "Admin") {
    throw new ApiError(403, "Forbidden!", {
      reason: "Only team admins can create projects!",
      solution: "Use an Admin account or contact the team admin!",
    });
  }
  const existingProject = await Project.findOne({ name, team: teamId });
  if (existingProject) {
    throw new ApiError(409, "Project already exists!", {
      reason: "A project with this name already exists in the team!",
      solution: "Choose a different project name!",
    });
  }
  const project = await Project.create({
    name,
    description,
    team: teamId,
    createdBy: userId,
  });
  res.status(201).json({
    success: true,
    message: "Project created successfully!",
    data: {
      id: project._id,
      name: project.name,
      description: project.description,
      team: project.team,
      createdBy: project.createdBy,
    },
  });
});

export const updateProjectHandler = asyncHandler(async (req, res) => {
  if (!req.user.roles.includes("Admin")) {
    throw new ApiError(403, "Forbidden!", {
      reason: "Only Admins can update projects!",
      solution: "Use an Admin account to perform this action!",
    });
  }
  const { id } = req.params;
  const { name, description } = req.body;
  const userId = req.user.id;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid project ID", {
      reason: "The provided project ID is malformed",
      solution: "Provide a valid MongoDB ObjectID",
    });
  }
  if (!name && !description) {
    throw new ApiError(400, "No updates provided", {
      reason: "Neither name nor description was provided",
      solution: "Provide at least one field to update",
    });
  }
  const project = await Project.findById(id).populate({
    path: "team",
    select: "_id",
  });
  if (!project || !project.team) {
    throw new ApiError(404, "Project not found", {
      reason: "Project or its associated team doesn't exist",
      solution: "Verify the project ID and try again",
    });
  }
  const user = await User.findById(userId).select("teams");
  if (!user) {
    throw new ApiError(404, "User not found", {
      reason: "Your account may have been deleted",
      solution: "Contact support or try re-authenticating",
    });
  }
  const hasPermission = user.teams?.some(
    (t) =>
      t?.team?.toString() === project.team._id.toString() && t.role === "Admin"
  );
  if (!hasPermission) {
    throw new ApiError(403, "Forbidden", {
      reason: "You must be a team admin to update projects",
      solution: "Contact your team administrator",
    });
  }
  const updatedProject = await Project.findByIdAndUpdate(
    id,
    {
      ...(name && { name }),
      ...(description && { description }),
      updatedAt: new Date(),
    },
    { new: true }
  ).populate("team", "_id name");
  res.status(200).json({
    success: true,
    statusCode: 200,
    message: "Project updated successfully",
    data: {
      id: updatedProject._id,
      name: updatedProject.name,
      description: updatedProject.description,
      team: updatedProject.team,
      updatedAt: updatedProject.updatedAt,
    },
  });
});

export const deleteProjectHandler = asyncHandler(async (req, res) => {
  if (!req.user.roles.includes("Admin")) {
    throw new ApiError(403, "Forbidden!", {
      reason: "Only Admins can delete projects!",
      solution: "Use an Admin account to perform this action!",
    });
  }
  const { projectId } = req.body;
  const userId = req.user.id;
  if (!projectId) {
    throw new ApiError(400, "Missing project ID!", {
      reason: "Project ID is required!",
      solution: "Provide a valid project ID in the request body!",
    });
  }
  const project = await Project.findById(projectId).populate("team");
  if (!project) {
    throw new ApiError(404, "Project not found!", {
      reason: "The specified project does not exist!",
      solution: "Check the project ID and try again!",
    });
  }
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found!", {
      reason: "The authenticated user does not exist!",
      solution: "Verify your authentication token or register a new account!",
    });
  }
  const userTeam = user.teams.find(
    (t) => t.team && t.team.toString() === project.team._id.toString()
  );
  if (!userTeam || userTeam.role !== "Admin") {
    throw new ApiError(403, "Forbidden!", {
      reason: "Only team admins can delete projects!",
      solution: "Use an Admin account or contact the team admin!",
    });
  }
  await Project.deleteOne({ _id: projectId });
  res.status(200).json({
    success: true,
    message: "Project deleted successfully!",
  });
});

export const listProjectsHandler = asyncHandler(async (req, res) => {
  if (!req.user.roles.includes("Admin")) {
    throw new ApiError(403, "Forbidden!", {
      reason: "Only Admins can list projects!",
      solution: "Use an Admin account to perform this action!",
    });
  }
  const userId = req.user.id;
  const page = Math.max(1, parseInt(req.query.page)) || 1;
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit))) || 10;
  const skip = (page - 1) * limit;
  const user = await User.findById(userId).select("teams");
  if (!user) {
    throw new ApiError(404, "User not found", {
      reason: "The authenticated user doesn't exist in database",
      solution: "Verify your account status",
    });
  }
  const teamIds = user.teams.map((t) => t.team).filter(Boolean);
  if (teamIds.length === 0) {
    throw new ApiError(404, "No teams found", {
      reason: "User is not part of any teams",
      solution: "Join a team first to see projects",
    });
  }
  const [result] = await Project.aggregate([
    { $match: { team: { $in: teamIds } } },
    { $sort: { createdAt: -1 } },
    {
      $facet: {
        projects: [
          { $skip: skip },
          { $limit: limit },
          {
            $lookup: {
              from: "teams",
              localField: "team",
              foreignField: "_id",
              as: "team",
            },
          },
          { $unwind: "$team" },
        ],
        total: [{ $count: "count" }],
      },
    },
    {
      $project: {
        projects: 1,
        total: { $arrayElemAt: ["$total.count", 0] },
      },
    },
  ]);
  const total = result?.total || 0;
  const projects = result?.projects || [];
  if (projects.length === 0) {
    throw new ApiError(404, "No projects found", {
      reason: "No projects exist for your teams",
      solution: "Create a project in one of your teams",
    });
  }
  res.status(200).json({
    success: true,
    statusCode: 200,
    message: "Projects retrieved successfully",
    data: {
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
      },
      projects,
    },
  });
});

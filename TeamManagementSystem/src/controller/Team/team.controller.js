import mongoose from "mongoose";
import { Team } from "../../models/Team/team.model.js";
import { User } from "../../models/User/user.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { createBackup } from "../../services/backup.app.collection.js";

export const createTeamHandler = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const userId = req.user.id;
  if (!req.user.roles.includes("Admin")) {
    throw new ApiError(403, "Forbidden!", {
      reason: "Only Admins can create teams!",
      solution: "Use an Admin account to perform this action!",
    });
  }
  if (!name) {
    throw new ApiError(400, "Missing required fields!", {
      reason: "Team name is mandatory!",
      solution: "Provide a team name in the request body!",
    });
  }
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found!", {
      reason: "The authenticated user does not exist in the database!",
      solution: "Verify your authentication token or register a new account!",
    });
  }
  if (user.teams.length >= 5) {
    throw new ApiError(400, "Team limit reached!", {
      reason: "Users cannot join or create more than 5 teams!",
      solution:
        "Remove the user from an existing team before creating a new one!",
    });
  }
  const existingTeam = await Team.findOne({ name, createdBy: userId });
  if (existingTeam) {
    throw new ApiError(409, "Team already exists!", {
      reason: "A team with this name already exists for this user!",
      solution: "Choose a different team name!",
    });
  }
  const team = await Team.create({
    name,
    description,
    createdBy: userId,
  });
  await User.findByIdAndUpdate(userId, {
    $push: { teams: { team: team._id, role: "Admin" } },
  });
  res.status(201).json({
    success: true,
    statusCode: 201,
    message: "Team created successfully!",
    data: {
      id: team._id,
      name: team.name,
      description: team.description,
      createdBy: team.createdBy,
    },
  });
});

export const updateTeamHandler = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  const userId = req.user.id;
  if (!id) {
    throw new ApiError(400, "Missing team ID!", {
      reason: "Team ID is required in the URL!",
      solution: "Provide a valid team ID in the URL (e.g., /teams/:id)",
    });
  }
  const team = await Team.findById(id);
  if (!team) {
    throw new ApiError(404, "Team not found!", {
      reason: "The specified team does not exist!",
      solution: "Check the team ID and try again!",
    });
  }
  if (
    !req.user.roles.includes("Admin") ||
    team.createdBy.toString() !== userId
  ) {
    throw new ApiError(403, "Forbidden!", {
      reason: "Only team admins can update the team!",
      solution: "Use an Admin account or contact the team creator!",
    });
  }
  if (
    !req.user.roles.includes("Admin") &&
    team.createdBy.toString() !== userId
  ) {
    throw new ApiError(403, "Forbidden!", {
      reason: "Only team admins or creators can update the team!",
      solution: "Use an Admin account or contact the team creator!",
    });
  }
  if (name !== undefined) team.name = name;
  if (description !== undefined) team.description = description;
  await team.save();
  res.status(200).json({
    success: true,
    statusCode: 200,
    message: "Team updated successfully!",
    data: {
      id: team._id,
      name: team.name,
      description: team.description,
      createdBy: team.createdBy,
      updatedAt: team.updatedAt,
    },
  });
});

export const deleteTeamHandler = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  if (!id) {
    throw new ApiError(400, "Missing team ID!", {
      reason: "Team ID is required in the URL!",
      solution: "Provide a valid team ID in the URL",
    });
  }
  const team = await Team.findById(id);
  if (!team) {
    throw new ApiError(404, "Team not found!", {
      reason: "The specified team does not exist!",
      solution: "Check the team ID and try again!",
    });
  }
  if (
    !req.user.roles.includes("Admin") ||
    team.createdBy.toString() !== userId
  ) {
    throw new ApiError(403, "Forbidden!", {
      reason: "Only team admins can delete the team!",
      solution: "Use an Admin account or contact the team creator!",
    });
  }
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    await Team.deleteOne({ _id: id }, { session });
    await User.updateMany(
      { "teams.team": id },
      { $pull: { teams: { team: id } } },
      { session }
    );
    createBackup({
      collectionName: "Team",
      data: team,
      backupReason: "Team deletion",
    });
    await session.commitTransaction();
    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Team deleted successfully!",
      deletedTeamId: id,
    });
  } catch (error) {
    await session.abortTransaction();
    throw new ApiError(500, "Team deletion failed!", {
      reason: error.message,
      solution: "Please try again later",
    });
  } finally {
    session.endSession();
  }
});

export const addMemberHandler = asyncHandler(async (req, res) => {
  const { teamId, userId: targetUserId, role } = req.body;
  const currentUserId = req.user.id;
  if (!teamId || !targetUserId || !role) {
    throw new ApiError(400, "Missing required fields!", {
      reason: "Team ID, user ID, and role are mandatory!",
      solution: "Provide all required fields in the request body!",
    });
  }
  if (!["Admin", "Member"].includes(role)) {
    throw new ApiError(400, "Invalid role!", {
      reason: "Role must be either 'Admin' or 'Member'!",
      solution: "Provide a valid role!",
    });
  }
  const team = await Team.findById(teamId);
  if (!team) {
    throw new ApiError(404, "Team not found!", {
      reason: "The specified team does not exist!",
      solution: "Check the team ID and try again!",
    });
  }
  if (
    !req.user.roles.includes("Admin") ||
    team.createdBy.toString() !== currentUserId
  ) {
    throw new ApiError(403, "Forbidden!", {
      reason: "Only team admins can add members!",
      solution: "Use an Admin account or contact the team creator!",
    });
  }
  const user = await User.findById(targetUserId);
  if (!user) {
    throw new ApiError(404, "User not found!", {
      reason: "The specified user does not exist!",
      solution: "Check the user ID and try again!",
    });
  }

  if (user.teams.length >= 5) {
    throw new ApiError(400, "Team limit reached!", {
      reason: "Users cannot join more than 5 teams!",
      solution:
        "Remove the user from an existing team before adding to a new one!",
    });
  }

  if (user.teams.some((t) => t.team && t.team.toString() === teamId)) {
    throw new ApiError(409, "User already in team!", {
      reason: "The user is already a member of this team!",
      solution: "Check the user ID or update their role instead!",
    });
  }
  await User.findByIdAndUpdate(targetUserId, {
    $push: { teams: { team: teamId, role } },
  });
  res.status(200).json({
    success: true,
    message: "Member added to team successfully!",
    data: {
      teamId,
      userId: targetUserId,
      role,
    },
  });
});

export const removeMemberHandler = asyncHandler(async (req, res) => {
  const { teamId, userId: targetUserId } = req.body;
  const currentUserId = req.user.id;
  if (!teamId || !targetUserId) {
    throw new ApiError(400, "Missing required fields!", {
      reason: "Team ID and user ID are mandatory!",
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

  if (
    !req.user.roles.includes("Admin") ||
    team.createdBy.toString() !== currentUserId
  ) {
    throw new ApiError(403, "Forbidden!", {
      reason: "Only team admins can remove members!",
      solution: "Use an Admin account or contact the team creator!",
    });
  }

  const user = await User.findById(targetUserId);
  if (!user) {
    throw new ApiError(404, "User not found!", {
      reason: "The specified user does not exist!",
      solution: "Check the user ID and try again!",
    });
  }

  if (!user.teams.some((t) => t.team && t.team.toString() === teamId)) {
    throw new ApiError(400, "User not in team!", {
      reason: "The user is not a member of this team!",
      solution: "Check the user ID and try again!",
    });
  }

  await User.findByIdAndUpdate(targetUserId, {
    $pull: { teams: { team: teamId } },
  });

  res.status(200).json({
    success: true,
    message: "Member removed from team successfully!",
    data: {
      teamId,
      userId: targetUserId,
    },
  });
});

export const listTeamsHandler = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const user = await User.findById(userId).populate("teams.team");
  if (!user) {
    throw new ApiError(404, "User not found!", {
      reason: "The authenticated user does not exist in the database!",
      solution: "Verify your authentication token or register a new account!",
    });
  }
  const teamIds = user.teams.map((t) => t.team).filter(Boolean);
  const teams = await Team.find({ _id: { $in: teamIds } })
    .skip(skip)
    .limit(limit)
    .lean();
  const total = await Team.countDocuments({ _id: { $in: teamIds } });
  res.status(200).json({
    success: true,
    message: "Teams retrieved successfully!",
    data: {
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      teams,
    },
  });
});

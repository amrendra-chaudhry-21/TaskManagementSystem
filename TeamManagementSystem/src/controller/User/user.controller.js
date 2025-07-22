import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../../models/User/user.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { Team } from "../../models/Team/team.model.js";

const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      roles: user.teams.map((team) => team.role),
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "1h",
      algorithm: "HS256",
    }
  );
};

export const signupHandler = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    throw new ApiError(400, "Missing required fields!", {
      reason: "Name, email, password, and role are mandatory!",
      solution: "Provide all required fields in the request body!",
    });
  }

  if (!["Admin", "Member"].includes(role)) {
    throw new ApiError(400, "Invalid role!", {
      reason: "Role must be either 'Admin' or 'Member'!",
      solution: "Provide a valid role!",
    });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, "User already exists!", {
      reason: "Email is already registered!",
      solution: "Use a different email or login instead!",
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password: hashedPassword,
    teams: [{ role }],
  });

  const accessToken = generateAccessToken(user);

  res.status(201).json({
    success: true,
    message: "User registered successfully!",
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        teams: user.teams,
      },
      accessToken,
    },
  });
});

export const loginHandler = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new ApiError(400, "Missing required fields!", {
      reason: "Email and password are mandatory!",
      solution: "Provide both email and password in the request body!",
    });
  }
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    throw new ApiError(401, "Invalid credentials!", {
      reason: "Email not found!",
      solution: "Check the email or register a new account!",
    });
  }
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid credentials!", {
      reason: "Incorrect password!",
      solution: "Verify your password and try again!",
    });
  }
  const accessToken = generateAccessToken(user);
  res.status(200).json({
    success: true,
    message: "Login successful!",
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        teams: user.teams,
      },
      accessToken,
    },
  });
});

export const createUserHandler = asyncHandler(async (req, res) => {
  const { name, email, password, role, teamId } = req.body;
  if (!req.user.roles.includes("Admin")) {
    throw new ApiError(403, "Forbidden!", {
      reason: "Only Admins can create users!",
      solution: "Use an Admin account to perform this action!",
    });
  }

  if (!name || !email || !password || !role || !teamId) {
    throw new ApiError(400, "Missing required fields!", {
      reason: "Name, email, password, role, and teamId are mandatory!",
      solution: "Provide all required fields in the request body!",
    });
  }
  if (!["Admin", "Member"].includes(role)) {
    throw new ApiError(400, "Invalid role!", {
      reason: "Role must be either 'Admin' or 'Member'!",
      solution: "Provide a valid role!",
    });
  }
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, "User already exists!", {
      reason: "Email is already registered!",
      solution: "Use a different email!",
    });
  }

  const team = await Team.findById(teamId);
  if (!team) {
    throw new ApiError(400, "Invalid team!", {
      reason: "Team ID does not exist!",
      solution: "Provide a valid team ID!",
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password: hashedPassword,
    teams: [{ team: teamId, role }],
  });

  res.status(201).json({
    success: true,
    message: "User created successfully!",
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
      teams: user.teams,
    },
  });
});

export const getAllUsersHandler = asyncHandler(async (req, res) => {
  const users = await User.find({}, "-password").lean();
  const formattedUsers = users.map((user) => ({
    id: user._id,
    name: user.name,
    email: user.email,
    teams: user.teams,
  }));
  res.status(200).json({
    success: true,
    message: "Users fetched successfully!",
    data: {
      users: formattedUsers,
    },
  });
});

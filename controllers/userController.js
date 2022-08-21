import { v4 as uuidv4 } from "uuid";
import asyncHandler from "express-async-handler";
import argon2 from "argon2";
import { User } from "../models/userModel.js";
import { DeviceToken } from "../models/authTokenModel.js";
import { getDeviceInfoFromUserAgent } from "../utils/deviceResponse.js";

// @desc    Register a new user
// @route   /api/users
// @access  Public
export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Validation
  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please include all fields");
  }

  // Find if user already exists
  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error("User already exists.");
  }

  const hashedPassword = await argon2.hash(password);

  // Create user
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new error("Invalid user data");
  }
});

// @desc    Login a user
// @route   /api/users/login
// @access  Public
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  // Check user and passwords match
  if (user && (await argon2.verify(user.password, password))) {
    const deviceToken = await DeviceToken.create({
      user,
      ip: getClientIp(req),
      userAgent: getClientUserAgent(req),
      deviceId: `web-${uuidv4()}`,
    });
    res.status(200).json({
      token: deviceToken.key,
      device_id: deviceToken.deviceId,
    });
  } else {
    res.status(401);
    throw new Error("Invalid credentials");
  }
});

// @desc    Get current user
// @route   /api/users/me
// @access  Private
export const getMe = asyncHandler(async (req, res) => {
  const user = {
    id: req.user._id,
    email: req.user.email,
    name: req.user.name,
  };
  res.status(200).json(user);
});

export const getActiveSessions = asyncHandler(async (req, res) => {
  const activeSessions = await DeviceToken.find({
    user: req.user,
    isVerified: true,
  })
    .sort("-createdAt")
    .select("-key");

  const currentSession = await DeviceToken.findById(req.authToken.id);

  const sessions = activeSessions.map((session) => {
    return {
      id: session.id,
      user: session.user,
      deviceId: session.deviceId,
      deviceInfo: getDeviceInfoFromUserAgent(
        session.type,
        session.ip,
        session.userAgent
      ),
      isverified: session.isVerified,
      lastLogin: session.createdAt,
      isCurrent: session.deviceId === currentSession.deviceId,
    };
  });

  return res.status(200).json(sessions);
});

export const removeActiveSession = asyncHandler(async (req, res) => {
  const { deviceId } = req.body;
  if (!deviceId) {
    res.status(400);
    throw new Error("Device id is required.");
  }

  const loggedInDevice = await DeviceToken.findOneAndDelete({ deviceId });
  if (!loggedInDevice) {
    res.status(400);
    throw new Error("This device has already been removed.");
  } else {
    return res
      .status(200)
      .json({ message: "Device has been successfully logged out." });
  }
});

export const removeAllActiveSessions = asyncHandler(async (req, res) => {
  await DeviceToken.remove({ user: req.user });
  return res
    .status(200)
    .json({ message: "Logged out from all active sessions." });
});

export const logoutUser = asyncHandler(async (req, res) => {
  await DeviceToken.findByIdAndRemove(req.authToken.id);
  return res.status(200).json({ message: "Logged out successfully." });
});

const getClientIp = (req) => {
  return req.headers["x-forwarded-for"] || req.connection.remoteAddress;
};

const getClientUserAgent = (req) => {
  return req.headers["user-agent"];
};

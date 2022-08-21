import asyncHandler from "express-async-handler";
import { User } from "../models/userModel.js";
import { DeviceToken } from "../models/authTokenModel.js";

export const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Token")
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1];
      // Verify token

      // Get device from token
      const deviceToken = await DeviceToken.findOne({
        key: token,
        isVerified: true,
      });

      req.authToken = deviceToken;

      if (!deviceToken) {
        return res.status(401).json({
          message: "Invalid authentication token.",
          statusCode: res.statusCode,
        });
      } else {
        const user = await User.findById(deviceToken.user).select("-password");
        req.user = user;
      }

      next();
    } catch (error) {
      res.status(401);
      throw new Error("Not authorized");
    }
  }

  if (!token) {
    res.status(401);
    throw new Error("Authentication credentials were not provided.");
  }
});

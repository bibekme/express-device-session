import crypto from "crypto";
import mongoose from "mongoose";

const deviceTokenSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    userAgent: String,
    ip: String,
    type: {
      type: String,
      default: "Web",
    },
    key: {
      type: String,
      unqiue: true,
    },
    deviceId: {
      type: String,
      required: [true, "Device id is required."],
      unique: true,
    },
    isVerified: {
      type: Boolean,
      required: true,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

deviceTokenSchema.pre("save", async function (next) {
  const deviceToken = this;
  deviceToken.key = crypto.randomBytes(20).toString("hex");
  next();
});

export const DeviceToken = mongoose.model("DeviceToken", deviceTokenSchema);

import { Router } from "express";
import {
  registerUser,
  loginUser,
  getMe,
  getActiveSessions,
  removeActiveSession,
  removeAllActiveSessions,
  logoutUser,
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/", registerUser);
router.post("/device-login/", loginUser);
router.get("/me", protect, getMe);
router.get("/sessions/active/", protect, getActiveSessions);
router.post("/sessions/active/remove/", protect, removeActiveSession);
router.post("/sessions/active/remove_all/", protect, removeAllActiveSessions);
router.post("/sessions/logout/", protect, logoutUser);

export default router;

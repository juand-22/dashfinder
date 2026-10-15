import { Router } from "express";
import {
  findMinecraftProfileController,
  ipCountryController,
  findUserController,
  minecraftServerStatusController,
} from "./find.controller";
import { authenticate } from "../../middlewares/auth.middleware";

const router = Router();

router.get("/search", authenticate, findUserController);
router.get("/minecraft-profile", authenticate, findMinecraftProfileController);
router.get("/minecraft-server-status", authenticate, minecraftServerStatusController);
router.get("/ip-country", authenticate, ipCountryController);

export default router;
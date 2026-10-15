import { Router } from "express";
import { findUserController } from "./find.controller";
import { authenticate } from "../../middlewares/auth.middleware";

const router = Router();

router.get("/search", authenticate, findUserController);

export default router;
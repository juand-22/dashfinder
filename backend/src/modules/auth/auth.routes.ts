import { Router } from "express";
import { registerController, loginController, meController } from "./auth.controller";
import { validate } from "../../middlewares/validate";
import { registerSchema, loginSchema } from "./auth.schema";
import { authenticate } from "../../middlewares/auth.middleware";

const router = Router();

router.post("/register", validate(registerSchema), registerController);
router.post("/login", validate(loginSchema), loginController);
router.get("/me", authenticate, meController);

export default router;
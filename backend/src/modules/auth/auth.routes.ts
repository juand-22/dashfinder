import { Router } from "express";
import { registerController, loginController } from "./auth.controller";
import { validate } from "../../middlewares/validate";
import { registerSchema, loginSchema } from "./auth.schema";

const router = Router();

router.post("/register", validate(registerSchema), registerController);
router.post("/login", validate(loginSchema), loginController);

export default router;
import { Router } from "express";
import { recivePlayersController } from "./mod.controller";
import { apiKeyAuth } from "../../middlewares/apiKeyAuth";

const router = Router();

router.post("/recive", apiKeyAuth, recivePlayersController);

export default router
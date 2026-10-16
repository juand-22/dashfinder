import { Router } from "express";
import { recivePlayersController, configuratedController, actualServerController, configureModController, infoNameController } from "./mod.controller";
import { apiKeyAuth } from "../../middlewares/apiKeyAuth";
import { authenticate } from "../../middlewares/auth.middleware";

const router = Router();

router.post("/recive", apiKeyAuth, recivePlayersController);
router.get("/configurated", authenticate, configuratedController);
router.get("/actual", authenticate, actualServerController);
router.post("/configure", authenticate, configureModController);
router.get("/info-name", authenticate, infoNameController);


export default router
import { Router } from "express";
import { recivePlayersController, configuratedController, actualServerController, configureModController, infoNameController, apiKeyController, nicknamesController, nicknamesForModController, createNicknameController, deleteNicknameController } from "./mod.controller";
import { apiKeyAuth } from "../../middlewares/apiKeyAuth";
import { authenticate, authenticateOrApiKey } from "../../middlewares/auth.middleware";

const router = Router();

router.post("/recive", apiKeyAuth, recivePlayersController);
router.get("/configurated", authenticate, configuratedController);
router.get("/actual", authenticate, actualServerController);
router.post("/configure", authenticateOrApiKey, configureModController);
router.get("/info-name", authenticate, infoNameController);
router.get("/api-key", authenticate, apiKeyController);

router.get("/nicknames", authenticate, nicknamesController);
router.get("/nicknames/mod", apiKeyAuth, nicknamesForModController);
router.post("/nicknames", authenticate, createNicknameController);
router.delete("/nicknames/:id", authenticate, deleteNicknameController);


export default router
import { Router } from "express";
import { listServersController, listPlayersController, listNicknameServersController } from "./servers.controller";
import { authenticate } from "../../middlewares/auth.middleware";

const router = Router();

router.get("/", authenticate, listServersController);
router.get("/players", authenticate, listNicknameServersController);
router.get("/:serverId/players", authenticate, listPlayersController);


export default router
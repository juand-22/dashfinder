import { Router } from "express";
import { listServersController, listPlayersController } from "./servers.controller";
import { authenticate } from "../../middlewares/auth.middleware";

const router = Router();

router.get("/", authenticate, listServersController);
router.get("/:serverId/players", authenticate, listPlayersController);


export default router
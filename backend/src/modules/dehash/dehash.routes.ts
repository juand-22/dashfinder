import { authenticate } from "../../middlewares/auth.middleware";
import {
    dehashController,
    dehashResultsController,
    dehashByNameController,
} from "./dehash.controller";
import { Router } from "express";

export const dehashRouter = Router();

dehashRouter.post("/", authenticate, dehashController);
dehashRouter.get("/results", authenticate, dehashResultsController);
dehashRouter.get("/by-name", authenticate, dehashByNameController);


export default dehashRouter;

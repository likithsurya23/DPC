import { Router } from "express";

import {
    prepareAR,
    getAR,
} from "../controllers/arController.js";

const router = Router();

router.post("/prepare", prepareAR);

router.get("/:configurationId", getAR);

export default router;
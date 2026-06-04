import { Router, type IRouter } from "express";
import healthRouter from "./health";
import reportsRouter from "./reports";
import statsRouter from "./stats";
import leaderboardRouter from "./leaderboard";
import donationsRouter from "./donations";
import volunteersRouter from "./volunteers";

const router: IRouter = Router();

router.use(healthRouter);
router.use(reportsRouter);
router.use(statsRouter);
router.use(leaderboardRouter);
router.use(donationsRouter);
router.use(volunteersRouter);

export default router;

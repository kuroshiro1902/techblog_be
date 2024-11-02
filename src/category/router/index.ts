import { Router } from "express";
import _categoryRouter from "./category.route";

const categoryRouter = Router();
categoryRouter.use('/categories', _categoryRouter)

export default categoryRouter;
import { ENVIRONMENT } from "@/common/environments/environment";
import type { Request } from "express";
import { rateLimit } from "express-rate-limit";
const rateLimiteMiddleware = rateLimit({
  legacyHeaders: true,
  limit: ENVIRONMENT.RATE_LIMIT_MAX_REQUESTS,
  message: "Quá nhiều yêu cầu, vui lòng thử lại sau.",
  standardHeaders: true,
  windowMs: ENVIRONMENT.RATE_LIMIT_WINDOW_MS,
  keyGenerator: (req: Request) => req.ip as string,
});

export default rateLimiteMiddleware;

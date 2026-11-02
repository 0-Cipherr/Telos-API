import type { NextFunction, Request, Response } from "express";
import { type Creator } from "../db/telos-queries.js";
declare global {
    namespace Express {
        interface Request {
            privyUserId?: string;
            creator?: Creator;
        }
    }
}
export declare function requirePrivyUser(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function requireTelosKey(req: Request, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=auth.d.ts.map
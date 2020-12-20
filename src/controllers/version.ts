import { RequestHandler, Request, Response, NextFunction } from 'express';
import { APP_VERSION } from '../utils/constants';

export const get: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
    res.status(200).json({ version: APP_VERSION });
};

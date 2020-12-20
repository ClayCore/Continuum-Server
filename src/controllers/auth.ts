import { RequestHandler, Request, Response, NextFunction } from 'express';
import * as NotificationStorage from '../models/Notification/NotificationStorage';
import AuthenticationResponse from '../models/Response/AuthenticationResponse';
import Notification from '../models/Notification';
import passport from 'passport';
import User from '../models/User';
import UserCollection from '../models/User/UserCollection';
import UserDocument from '../models/User/UserDocument';

export const oauth2: RequestHandler = (req: Request, res: Response, next: NextFunction): void => {
    passport.authenticate('oauth2')(req, res, next);
};

export const oauth2Callback: RequestHandler = (req: Request, res: Response, next: NextFunction): void => {
    const authResultHandler = (error: Error, user: UserDocument | boolean, info: any) => {
        if (error) {
            return next(error);
        }

        if (!user) {
            return res.redirect('/login');
        }

        req.logIn(user, async (error: Error) => {
            if (error) {
                return next(error);
            }

            const notifications: Notification[] = await NotificationStorage.findByOwner(
                (user as User)._id.toString(),
                true
            );
            const others: UserDocument[] = await UserCollection.find({});

            (user as User).password = '######';

            others.forEach((other: UserDocument) => {
                other.password = '######';
            });

            return res.json({
                user: user,
                accessToken: info.accessToken,
                notifications: notifications,
                others: others,
            } as AuthenticationResponse);
        });
    };
    passport.authenticate('oauth2', authResultHandler)(req, res, next);
};

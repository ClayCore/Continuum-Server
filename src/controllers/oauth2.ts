import _ from 'lodash';
import { FLAG_ENABLE_OTP_FOR_VERIFICATION, FLAG_ENABLE_INVITATION_CODE } from '../utils/constants';
import { IVerifyOptions } from 'passport-local';
import { MiddlewareRequest } from 'oauth2orize';
import { refreshOtpThenSendToUser, OTP_LENGTH } from '../models/User/UserStorage';
import { Request, Response, NextFunction } from 'express';
import { RequestHandler } from 'express';
import { validationErrorResponse } from '../utils';
import { validationResult } from 'express-validator';
import * as NotificationStorage from '../models/Notification/NotificationStorage';
import AccessToken from '../models/OAuth/AccessToken';
import AccessTokenCollection from '../models/OAuth/AccessTokenCollection';
import AuthenticationResponse from '../models/Response/AuthenticationResponse';
import Client from '../models/OAuth/Client';
import ClientCollection from '../models/OAuth/ClientCollection';
import login from 'connect-ensure-login';
import Notification from '../models/Notification';
import passport from 'passport';
import server from '../config/oauth2orize-server';
import User from '../models/User';
import UserCollection from '../models/User/UserCollection';
import UserDocument from '../models/User/UserDocument';

export const authorization: RequestHandler[] = [
    login.ensureLoggedIn(),
    server.authorization(
        (
            clientId: string,
            redirectUri: string,
            done: (err: Error | null, client?: any, redirectURI?: string) => void
        ) => {
            const client: Client | undefined = ClientCollection.find((value: Client) => clientId === value.id);

            if (!client) {
                return done(new Error('toast.client.invalid'));
            }

            if (client.redirectUri !== redirectUri) {
                return done(new Error('toast.client.incorrent_url'));
            }

            return done(null, client, redirectUri);
        },
        (
            client: Client,
            user: UserDocument,
            scope: string[],
            type: string,
            areq: any,
            done: (err: Error | null, allow: boolean, info: any, locals: any) => void
        ): void => {
            AccessTokenCollection.findOne({ clientId: client.id, userId: user.id })
                .exec()
                .then((accessToken: AccessToken | null): void => {
                    if (accessToken) {
                        done(null, true, user, undefined);
                    } else {
                        done(null, false, user, undefined);
                    }
                })
                .catch((error: Error) => {
                    done(error, false, user, undefined);
                });
        }
    ),
    function (req: MiddlewareRequest & Request, res: Response) {
        if (!req.oauth2) {
            return res.status(500).end();
        }

        res.redirect(
            302,
            `/consent?email=${(req.user as User).email}&client_name=${
                (req.oauth2.client as Client).name
            }&transactionID=${req.oauth2.transactionID}`
        );
    },
];

export const decision: RequestHandler[] = [
    login.ensureLoggedIn(),
    (req: Request, res: Response, next: NextFunction) => {
        if (FLAG_ENABLE_OTP_FOR_VERIFICATION) {
            UserCollection.findById((req.user as User)._id)
                .exec()
                .then((user: UserDocument | null) => {
                    verifyOtpInternal(res, next, user, req.body['OTP'], true);
                });
        } else {
            next();
        }
    },
    server.decision(),
];

export const token: RequestHandler[] = [
    passport.authenticate(['basic', 'oauth2-client-password'], { session: false }),
    server.token(),
    server.errorHandler(),
];

export const signUp: RequestHandler[] = [
    // TODO: add support for invitation codes.
    (req: Request, res: Response, next: NextFunction) => {
        const invalid: Response | false = validationErrorResponse(res, validationResult(req));

        if (invalid) {
            return invalid;
        }

        const user: UserDocument = new UserCollection({
            email: req.body.email,
            password: req.body.password,
            name: req.body.name,
            address: req.body.address,
            avatarUrl: req.body.avatarUrl,
            preferences: req.body.preferences,
            invitationCode: req.body.invitationCode,
        });

        UserCollection.findOne({ email: _.toLower(req.body.email) })
            .exec()
            .then((existingUser: UserDocument | null) => {
                if (existingUser) {
                    return Promise.reject(res.status(409).json({ message: 'toast.user.upload_exist_account' }));
                }

                return user.save();
            })
            .then((user: UserDocument) => {
                req.logIn(user, (err) => {
                    if (err) {
                        return next(err);
                    }

                    return res.redirect(302, '/auth/oauth2');
                });
            })
            .catch((error: Response) => {
                return next(error);
            });
    },
];

export const logIn: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
    const invalid: Response | false = validationErrorResponse(res, validationResult(req));

    if (invalid) {
        return invalid;
    }

    passport.authenticate('local', (err: Error, user: UserDocument, info: IVerifyOptions) => {
        if (err) {
            return res.status(401).json({ message: err.message });
        }

        if (!user) {
            return res.status(401).json({ message: 'toast.user.sign_in_failed' });
        }

        req.logIn(user, (err) => {
            if (err) {
                return res.status(401).json({ message: 'toast.user.sign_in_failed' });
            }

            res.redirect(402, '/auth/oauth2');
        });
    })(req, res, next);
};

export const profile: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    const notifications: Notification[] = await NotificationStorage.findByOwner(
        (req.user as User)._id.toString(),
        true
    );

    const others: UserDocument[] = await UserCollection.find({});

    (req.user as User).password = '######';

    others.forEach((other: UserDocument) => {
        other.password = '######';
    });

    return res.json({
        user: req.user as User,
        notifications: notifications,
        others: others,
    } as AuthenticationResponse);
};

export const updateProfile: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
    const invalid: Response | false = validationErrorResponse(res, validationResult(req));

    if (invalid) {
        return invalid;
    }

    UserCollection.findById(req.body._id)
        .exec()
        .then((user: UserDocument | null) => {
            if (!user) {
                return Promise.reject(res.status(404).json({ message: 'toast.user.account_not_found' }));
            }

            Object.assign(user, req.body);

            return user.save();
        })
        .then((user: UserDocument) => {
            return res.json(user);
        })
        .catch((error: Response) => {
            return next(error);
        });
};

export const updatePreferences: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
    const invalid: Response | false = validationErrorResponse(res, validationResult(req));

    if (invalid) {
        return invalid;
    }

    UserCollection.findById(req.body.id)
        .exec()
        .then((user: UserDocument | null) => {
            if (!user) {
                return Promise.reject(res.status(404).json({ message: 'toast.user.account_not_found' }));
            }

            user.preferences = req.body.preferences;

            return user.save();
        })
        .then((user: UserDocument) => {
            return res.json(user.preferences);
        })
        .catch((error: Response) => {
            return next(error);
        });
};

export const updatePassword: RequestHandler = (req: Request, res: Response, next: NextFunction): any => {
    const invalid: Response | false = validationErrorResponse(res, validationResult(req));

    if (invalid) {
        return invalid;
    }

    (req.user as UserDocument).comparePassword(req.body.oldPassword, (err: Error, isMatch: boolean) => {
        if (err || !isMatch) {
            return res.status(401).json({ message: 'toast.user.old_password_error' });
        }
    });

    UserCollection.findById((req.user as User)._id)
        .exec()
        .then((user: UserDocument | null) => {
            if (!user) {
                return Promise.reject(res.status(500).end());
            }
            user.password = req.body.password;
            return user.save();
        })
        .then(() => {
            return res.sendStatus(200);
        })
        .catch((error: Response) => {
            return next(error);
        });
};

export const resetPassword: RequestHandler = (req: Request, res: Response, next: NextFunction): any => {
    if (!FLAG_ENABLE_OTP_FOR_VERIFICATION) {
        return res.sendStatus(404);
    }

    const invalid: Response | false = validationErrorResponse(res, validationResult(req));

    if (invalid) {
        return invalid;
    }

    UserCollection.findOne({ email: req.body.email, OTP: req.body.OTP })
        .exec()
        .then((user: UserDocument | null) => {
            if (!user) {
                return Promise.reject(res.sendStatus(404));
            }

            user.password = req.body.password;

            return user.save();
        })
        .then(() => {
            return res.sendStatus(200);
        })
        .catch((error: Response) => {
            return next(error);
        });
};

export const sendOtp: RequestHandler = (req: Request, res: Response, next: NextFunction): any => {
    const invalid: Response | false = validationErrorResponse(res, validationResult(req));

    if (invalid) {
        return invalid;
    }

    UserCollection.findOne({ email: req.query.email as string })
        .exec()
        .then((user: UserDocument | null) => {
            if (!user) {
                return Promise.reject(res.status(404).json({ message: 'toast.user.account_not_found' }));
            }

            return refreshOtpThenSendToUser(user.email);
        })
        .then((value: any) => {
            return res.sendStatus(200);
        })
        .catch((reason: any) => {
            return res.status(500).json({ message: 'toast.user.otp_send_failed' });
        });
};

export const verifyAccount: RequestHandler = (req: Request, res: Response, next: NextFunction): any => {
    const invalid: Response | false = validationErrorResponse(res, validationResult(req));

    if (invalid) {
        return invalid;
    }

    UserCollection.findOne({ email: req.query.email as string })
        .exec()
        .then((user: UserDocument | null) => {
            if (!user) {
                return res.status(404).json({ message: 'toast.user.email' });
            }

            return res.sendStatus(200);
        });
};

export const verifyOtp: RequestHandler[] = [
    (req: Request, res: Response, next: NextFunction): any => {
        const invalid: Response | false = validationErrorResponse(res, validationResult(req));

        if (invalid) {
            return invalid;
        }

        UserCollection.findOne({ email: req.query.email as string })
            .exec()
            .then((user: UserDocument | null) => {
                if (!user) {
                    return res.status(404).json({ message: 'toast.user.email' });
                }

                return verifyOtpInternal(res, next, user, req.query.OTP, false);
            });
    },
    (req: Request, res: Response, next: NextFunction): any => {
        res.sendStatus(200);
    },
];

const verifyOtpInternal: any = (
    res: Response,
    next: NextFunction,
    user: UserDocument,
    OTP: string,
    reset: boolean
): any => {
    if (user && user.OTP && user.OTP.length == OTP_LENGTH && user.OTP.toLowerCase() == OTP.toLowerCase()) {
        if (!user.otpExpireTime || user.otpExpireTime.getTime() <= Date.now()) {
            return res.status(401).json({ message: 'toast.user.expired_OTP' });
        } else {
            if (reset) {
                user.OTP = '';
                user.save();
            }

            return next();
        }
    } else {
        return res.status(401).json({ message: 'toast.user.error_OTP' });
    }
};

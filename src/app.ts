import { CORS_WHITELIST } from './utils/hostUrls';
import { MONGODB_URI, SESSION_SECRET, SERVER_PORT, ORIGIN_URI } from './utils/secrets';
import { Response, Request, NextFunction } from 'express';
import bluebird from 'bluebird';
import compression from 'compression';
import cors from 'cors';
import errorHandler from 'errorhandler';
import express from 'express';
import lusca from 'lusca';
import mongo from 'connect-mongo';
import mongoose from 'mongoose';
import passport from 'passport';
import session from 'express-session';

import oauth2 from './routes/oauth2';
import auth from './routes/auth';
import version from './routes/version';

import './config/passport-consumer';

const MongoStore = mongo(session);
const mongoUrl: string = MONGODB_URI as string;
(<any>mongoose).Promise = bluebird;

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose
    .connect(mongoUrl, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        console.log('\tMongoDB is connected succesfully.');
    })
    .catch((err: any) => {
        console.error('\tMongoDB connection error. Please make sure MongoDB is running. \n\t' + err);
        process.exit();
    });

const app = express();

app.set('server_port', SERVER_PORT);
app.set('origin_uri', ORIGIN_URI);

app.use(compression());
app.use(
    cors({
        origin: (requestOrigin: string | undefined, callback: (err: Error | null, allow?: boolean) => void): void => {
            if (requestOrigin && CORS_WHITELIST.indexOf(requestOrigin) === -1) {
                const message: string =
                    "The CORS policy for this origin doesn't allow access from the particular origin.";
                return callback(new Error(message), false);
            } else {
                return callback(null, true);
            }
        },
        credentials: true,
    })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
    session({
        resave: true,
        saveUninitialized: true,
        secret: SESSION_SECRET as string,
        store: new MongoStore({
            url: mongoUrl,
            autoReconnect: true,
        }),
    })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(lusca.xframe('SAMEORIGIN'));
app.use(lusca.xssProtection(true));

app.use(function (req: Request, res: Response, next: NextFunction) {
    console.log(`[${req.method} ${req.originalUrl}] is called, body is ${JSON.stringify(req.body)}`);
    next();
});

app.use((req: Request, res: Response, next: NextFunction) => {
    res.locals.user = req.user;
    next();
});

if (process.env.NODE_ENV === 'development') {
    app.use(errorHandler());
}

if (process.env.NODE_ENV === 'production') {
    app.use(express.static('./view/public/', { maxAge: 31557600000 }));

    app.use((req: Request, res: Response, next: NextFunction) => {
        if (
            req.originalUrl.startsWith('/api') ||
            req.originalUrl.startsWith('/auth') ||
            req.originalUrl.startsWith('/oauth2')
        ) {
            next();
        } else {
            const options = {
                root: './view/public/',
                dotfiles: 'deny',
                header: {
                    'x-timestamp': Date.now(),
                    'x-sent': true,
                },
            };

            const fileName = 'index.html';
            res.sendFile(fileName, options, function (err) {
                if (err) {
                    next(err);
                } else {
                    console.log(`[Sent]: ${fileName}`);
                }
            });
        }
    });
}

app.use('/oauth2', oauth2);
app.use('/auth', auth);
app.use('/api/version', version);

export default app;

import bluebird from 'bluebird';
import compression from 'compression';
import cors from 'cors';
import errorHandler from 'errorhandler';
import express from 'express';
import { Response, Request, NextFunction } from 'express';
import lusca from 'lusca';
import mongo from 'connect-mongo';
import mongoose from 'mongoose';
import passport from 'passport';
import session from 'express-session';

const CORS_WHITELIST = ['https://continuum-server.herokuapp.com:80', 'https://localhost:3000'];

const MongoStore = mongo(session);
const mongoUrl: string = process.env.MONGODB_URI as string;
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

// TODO: replace these with constants
app.set('server_port', process.env.PORT || 3000);
app.set('origin_uri', 'https://continuum-server.herokuapp.com');

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
        secret: process.env.SESSION_SECRET as string,
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

app.use(errorHandler());

export default app;

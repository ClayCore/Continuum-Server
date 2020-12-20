import express, { Router } from 'express';
import * as controllers from '../controllers/auth';

const auth: Router = express.Router();

auth.route('/oauth2').get(controllers.oauth2);
auth.route('/oauth2/callback').get(controllers.oauth2Callback);

export default auth;

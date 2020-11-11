import express from 'express';
import 'express-async-errors'
import cookieSession from 'cookie-session';
import { NotFoundError , errorHandler } from '@jgtickegs/common';
import { currentUserRouter } from './routes/current-user';
import { signinRouter } from './routes/signin';
import { signoutRouter } from './routes/signout';
import { signupRouter } from './routes/signup';
import mongoose from 'mongoose';
const app = express();

/* Middlewares */
app.use(express.json());
app.set('trust proxy', true);
app.use(cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== 'test'
}))

/* routes */
app.use(currentUserRouter);
app.use(signinRouter);
app.use(signoutRouter);
app.use(signupRouter);


app.all('*', (req, res, next) => {
    throw new NotFoundError()
})

app.use(errorHandler);


export { app };


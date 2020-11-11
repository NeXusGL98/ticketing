import express from 'express';
import 'express-async-errors'
import cookieSession from 'cookie-session';
import { NotFoundError , errorHandler, currentUser } from '@jgtickegs/common';
import { indexOrderRouter } from './routes';
import { showOrderRouter } from './routes/show';
import { newOrderRouter } from './routes/new';
import { deleteOrderRouter } from './routes/delete';

const app = express();

/* Middlewares */
app.use(express.json());
app.set('trust proxy', true);
app.use(cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== 'test'
}))

app.use(currentUser);

/* routes */
app.use(indexOrderRouter);
app.use(showOrderRouter);
app.use(newOrderRouter);
app.use(deleteOrderRouter);


app.all('*', (req, res, next) => {
    throw new NotFoundError()
})

app.use(errorHandler);


export { app };


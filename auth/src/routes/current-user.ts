import { Request, Response, Router } from 'express'
import jwt from 'jsonwebtoken';
import { currentUser } from '@jgtickegs/common';


const router = Router();

router.get('/api/users/currentuser',[currentUser],(req: Request, res: Response) => {


    return res.send({currentUser: req.currentUser || null});

});

export { router as currentUserRouter };
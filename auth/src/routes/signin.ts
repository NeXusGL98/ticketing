import { Request, Response, Router } from 'express'
import { body } from 'express-validator';
import { BadRequestError ,validateRequest } from '@jgtickegs/common';
import { User } from '../models/user';
import { Password } from '../services/password';
import jwt from 'jsonwebtoken';
const router = Router();

router.post('/api/users/signin', [
    body('email').isEmail().withMessage('Email must be valid'),
    body('password').isString().trim().withMessage('You must supply a password')
], validateRequest, async (req: Request, res: Response) => {


    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (!existingUser) {
        throw new BadRequestError('Invalid credentials');
    }


    const passwordMatch = await Password.compare(existingUser.password,password);

    if(!passwordMatch){
        throw new BadRequestError('Invalid credentials');
    }

    //Generate Jwt 
    const userJwt = jwt.sign({
        id: existingUser.id,
        email: existingUser.email
    },
    
    //Getting JWT KEY FROM ENV, PLEASE OPEN AUTH-DEPL.YAML TO SEE THE CONFIG
    process.env.JWT_KEY! //! let knows typescript that this env is not undefined
    );
    //Store it in the session object
    req.session = {
        jwt: userJwt
    }
    return res.status(200).send(existingUser);

});

export { router as signinRouter };
import { Router, Request, Response } from 'express'
import { body} from 'express-validator';
import { BadRequestError, validateRequest} from '@jgtickegs/common';
import { User } from '../models/user';
import jwt from 'jsonwebtoken';
const router = Router();

router.post('/api/users/signup', [
    body('email').isEmail().withMessage('Email must be valid'),
    body('password').isString().trim().isLength({ min: 4, max: 20 }).withMessage('Password must be between 4 and 20 characters')
],validateRequest, async (req: Request, res: Response) => {

    const { email,password } = req.body;

    const existingUser = await User.findOne({ email });

    if(existingUser){
        throw new BadRequestError('Email already in use');
    }

    const user = User.build({email: email.toLowerCase(),password});
    await user.save();

    //Generate Jwt 
    const userJwt = jwt.sign({
        id: user.id,
        email: user.email
    },
    
    //Getting JWT KEY FROM ENV, PLEASE OPEN AUTH-DEPL.YAML TO SEE THE CONFIG
    process.env.JWT_KEY! //! let knows typescript that this env is not undefined
    );
    //Store it in the session object
    req.session = {
        jwt: userJwt
    }
    return res.status(201).send(user);

});

export { router as signupRouter };
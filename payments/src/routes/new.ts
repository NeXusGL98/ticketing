import { BadRequestError, NotAuthorizedError, NotFoundError, OrderStatus, requireAuth, validateRequest } from '@jgtickegs/common';
import { Request, Response, Router } from 'express';
import { body } from 'express-validator';
import { Order } from '../models/order';
import { Payment } from '../models/payment';
import { natsWrapper } from '../nats/classes/nats-wrapper';
import { PaymentCreatedPublisher } from '../nats/publishers/payment-created-publisher';
import { stripe } from '../stripe/stripe';


const router = Router();

router.post('/api/payments',
    requireAuth,
    [
        body('token').not().isEmpty(),
        body('orderId').not().isEmpty(),
    ], validateRequest, async (req: Request, res: Response) => {


        const { token, orderId } = req.body;

        const order = await Order.findById(orderId);

        if (!order) {
            throw new NotFoundError();
        }

        if (order.userId !== req.currentUser!.id) {
            throw new NotAuthorizedError();
        }

        if (order.status === OrderStatus.Cancelled) {
            throw new BadRequestError('Can not pay for a cancelled order');
        }

        const charge = await stripe.charges.create({
            currency: 'usd',
            amount: (order.price * 100), //stripe works with cents, so we need to convert the value into dollars.
            source: token
        });

        const payment = Payment.build({
            orderId,
            stripeId: charge.id
        });

        await payment.save();

        await new PaymentCreatedPublisher(natsWrapper.client).publish({
            id: payment.id,
            orderId: payment.orderId,
            stripeId: payment.stripeId
        });

        res.status(201).send({ id: payment.id });

    });


export { router as createChargeRouter };
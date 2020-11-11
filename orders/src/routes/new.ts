import { BadRequestError, NotFoundError, OrderStatus, requireAuth, validateRequest } from '@jgtickegs/common';
import { Request, Response, Router } from 'express';
import { body } from 'express-validator';
import mongoose from 'mongoose';
import { Order } from '../models/order';
import { Ticket } from '../models/ticket';
import { natsWrapper } from '../nats/classes/nats-wrapper';
import { OrderCreatedPublisher } from '../nats/publishers/order-created';
const router = Router();


router.post('/api/orders', [requireAuth,
    body('ticketId')
        .not()
        .isEmpty()
        .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
        .withMessage('TicketId must be provided'),
    validateRequest], async (req: Request, res: Response) => {

        const { ticketId } = req.body;

        //find the ticket the user is trying to order in database
        const ticket = await Ticket.findById(ticketId);

        if (!ticket) {
            throw new NotFoundError();
        }

        //Make sure the ticker is not already reserved
        const isReserved = await ticket.isReserved();
        if (isReserved) {
            throw new BadRequestError('Ticket already reserved');
        }

        //Calculate an expiration date for this order
        const expiration = new Date();
        expiration.setSeconds(expiration.getSeconds() + (5 * 60));
        //Build the order and save it to the db

        const order = await Order.build({
            ticket,
            userId: req.currentUser!.id,
            status: OrderStatus.Created,
            expiresAt: expiration
        })

        await order.save();
        //Publish an event saying that an order was created
        new OrderCreatedPublisher(natsWrapper.client).publish({
            id: order.id,
            status: order.status,
            userId: order.userId,
            expiresAt: order.expiresAt.toISOString(),
            version: order.version,
            ticket: {
                id: ticket.id,
                price: ticket.price,
            },
        });

        res.status(201).send(order);

    });

export { router as newOrderRouter }
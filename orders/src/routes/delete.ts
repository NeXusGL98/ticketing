import { NotAuthorizedError, NotFoundError, OrderStatus, requireAuth } from '@jgtickegs/common';
import {Request, Response, Router} from 'express';
import { Order } from '../models/order';
import { natsWrapper } from '../nats/classes/nats-wrapper';
import { OrderCancelledPublisher } from '../nats/publishers/order-cancelled';

const router = Router();


router.put('/api/orders/:orderId',requireAuth,async(req:Request,res:Response)=> {
   
    const order = await Order.findById(req.params.orderId).populate('ticket');

    if (!order) {
        throw new NotFoundError();
    }

    if (order.userId !== req.currentUser!.id) {
        throw new NotAuthorizedError();
    }

    order.set({
        status: OrderStatus.Cancelled,
        version: order.version + 1
    });
    
    await order.save();

    //publish event
    new OrderCancelledPublisher(natsWrapper.client).publish({
        id: order.id,
        version: order.version,
        ticket: {
            id: order.ticket.id
        }
    });

    res.status(200).send(order);

    
});

export {router as deleteOrderRouter}
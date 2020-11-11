import { requireAuth, validateRequest } from '@jgtickegs/common';
import { Router, Request, Response } from 'express'
import { body } from 'express-validator';
import { Ticket } from '../models/ticket';
import { natsWrapper } from '../nats/classes/nats-wrapper';
import { TicketCreatedPublisher } from '../nats/publishers/ticket-created.publisher';
const router = Router();

router.post('/api/tickets', requireAuth, [
    body('title').not().isEmpty().withMessage('Title is required'),
    body('price').isFloat({ gt: 0 }).withMessage('Price must be greater than 0')
], validateRequest, async (req: Request, res: Response) => {


    const { title, price } = req.body;

    const newTicket = Ticket.build({ title, price, userId: req.currentUser!.id });

    await newTicket.save();


    //publish an event
    await new TicketCreatedPublisher(natsWrapper.client).publish({
        id: newTicket.id,
        title:newTicket.title,
        price: newTicket.price,
        userId: newTicket.userId,
        version: newTicket.version
    });

    return res.status(201).send(newTicket);

});

export { router as createTicketRouter }
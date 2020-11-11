import { BadRequestError, NotAuthorizedError, NotFoundError, requireAuth, validateRequest } from '@jgtickegs/common';
import { Router, Request, Response } from 'express'
import { body } from 'express-validator';
import { Ticket } from '../models/ticket';
import { natsWrapper } from '../nats/classes/nats-wrapper';
import { TicketUpdatedPublisher } from '../nats/publishers/ticket-updated.publisher';


const router = Router();

router.put('/api/tickets/:id', requireAuth, [
    body('title').not().isEmpty().withMessage('Title is required'),
    body('price').isFloat({ gt: 0 }).withMessage('Price must be greater than 0')
],validateRequest, async (req: Request, res: Response) => {

    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
        throw new NotFoundError();
    }

    if(ticket.orderId){
        throw new BadRequestError('Can not edit a reserved ticket');
    }

    if(ticket.userId !== req.currentUser!.id){
        throw new NotAuthorizedError();
    }

   

    const { title, price } = req.body;

    ticket.set({
        title: title,
        price: price,
        version: ticket.version + 1
    })

    await ticket.save();

     //publish an event
     new TicketUpdatedPublisher(natsWrapper.client).publish({
        id: ticket.id,
        title:ticket.title,
        price: ticket.price,
        userId: ticket.userId,
        version: ticket.version
    });

    res.send(ticket);


});

export { router as updateTicketRouter }
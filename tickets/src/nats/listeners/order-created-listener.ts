import { IOrderCreatedEvent, Listener, OrderStatus, Subjects } from "@jgtickegs/common";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../models/ticket";
import { QueueGroupName } from "../enums/QueueGroupName";
import { TicketUpdatedPublisher } from "../publishers/ticket-updated.publisher";


export class OrderCreatedListener extends Listener<IOrderCreatedEvent> {

    subject: Subjects.OrderCreated = Subjects.OrderCreated;
    queueGroupName = QueueGroupName.ticketService
    async onMessage(data: IOrderCreatedEvent['data'], msg: Message){

       //Find the ticket that the order is reserving
       const ticket = await Ticket.findById(data.ticket.id);
       // If no ticket, throw error
       if(!ticket){
           throw new Error('Ticket not found');
       }
       // Mark the ticket as being reserved, by setting its orderId property
       ticket.set({
           orderId: data.id,
           version: ticket.version + 1
       });
       // save the ticket
       await ticket.save();
       //publishing update
       await new TicketUpdatedPublisher(this.client).publish({
           id: ticket.id,
           price: ticket.price,
           title: ticket.title,
           userId: ticket.userId,
           version: ticket.version,
           orderId: ticket.orderId
       });
       //ack the message
       msg.ack();

    }

}
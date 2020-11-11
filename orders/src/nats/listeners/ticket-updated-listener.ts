import { ITicketUpdatedEvent, Listener, Subjects } from "@jgtickegs/common";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../models/ticket";
import { QueueGroupName } from "../enums/queue-group-name";

export class TicketUpdatedListener extends Listener<ITicketUpdatedEvent> {
    subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
    queueGroupName = QueueGroupName.ordersService

    async onMessage(data: ITicketUpdatedEvent['data'], msg: Message) {

        const ticket = await Ticket.findByEvent({ id: data.id, version: data.version });

        if (!ticket) {
            throw new Error('Ticket not found');
        }

        const { title, price, version } = data;

        ticket.set({
            title,
            price,
            version
        });

        await ticket.save();

        msg.ack();
    }

}
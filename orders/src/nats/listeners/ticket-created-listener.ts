import { ITicketCreatedEvent, Listener, Subjects } from "@jgtickegs/common";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../models/ticket";
import { QueueGroupName } from "../enums/queue-group-name";

export class TicketCreatedListener extends Listener<ITicketCreatedEvent> {
    subject: Subjects.TickectCreated = Subjects.TickectCreated;

    queueGroupName = QueueGroupName.ordersService;

    async onMessage(data: ITicketCreatedEvent['data'], msg: Message) {

        const { title, price, id } = data;

        const ticket = Ticket.build({
            title, price, id
        });

        await ticket.save();

        msg.ack();

    }

}
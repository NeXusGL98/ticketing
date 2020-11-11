import { IOrderCreatedEvent, Listener, Subjects } from "@jgtickegs/common";
import { Message } from "node-nats-streaming";
import { Order } from "../../models/order";
import { QueueGroupName } from "../enums/queueGroupName";

export class OrderCreatedListener extends Listener<IOrderCreatedEvent>{
    subject: Subjects.OrderCreated = Subjects.OrderCreated;
    queueGroupName: string = QueueGroupName.PaymentService;


    async onMessage(data: IOrderCreatedEvent['data'], msg: Message) {

        const order = Order.build({
            id: data.id,
            price: data.ticket.price,
            status: data.status,
            userId: data.userId,
            version: data.version
        });

        await order.save();

        msg.ack();

    }

}
import { IOrderCreatedEvent, Listener, OrderStatus, Subjects } from "@jgtickegs/common";
import { Message } from "node-nats-streaming";
import { expirationQueue } from "../../queues/expiration-queue";
import { QueueGroupName } from "../enums/QueueGroupName";


export class OrderCreatedListener extends Listener<IOrderCreatedEvent>{

    subject: Subjects.OrderCreated = Subjects.OrderCreated;
    queueGroupName = QueueGroupName.expirationService

    async onMessage(data:  IOrderCreatedEvent['data'], msg: Message) {

        const delay = new Date(data.expiresAt).getTime() - new Date().getTime();

        console.log('Waiting this milliseconds to process the job',delay);
        await expirationQueue.add({
            orderId:data.id
        },{
            delay
        });

        msg.ack();

    }

}
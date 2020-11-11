import { IOrderCreatedEvent, IOrderUpdated, Listener, Subjects } from "@jgtickegs/common";
import { Message } from "node-nats-streaming";
import { Order } from "../../models/order";
import { QueueGroupName } from "../enums/queueGroupName";

export class OrderUpdatedListener extends Listener<IOrderUpdated>{
    subject: Subjects.OrderUpdated = Subjects.OrderUpdated;
    queueGroupName: string = QueueGroupName.PaymentService;


    async onMessage(data: IOrderUpdated['data'], msg: Message) {

        const order = await Order.findOne({ _id: data.id, version: data.version - 1 });

        if (!order) {
            throw new Error('Order not found');
        }


        order.set({
            status: data.status,
            version: data.version
        });

        await order.save();

        msg.ack();

    }

}
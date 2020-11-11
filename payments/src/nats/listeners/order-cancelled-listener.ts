import {IOrderCancelledEvent, Listener, OrderStatus, Subjects } from "@jgtickegs/common";
import { Message } from "node-nats-streaming";
import { Order } from "../../models/order";
import { QueueGroupName } from "../enums/queueGroupName";

export class OrderCancelledListener extends Listener<IOrderCancelledEvent>{
    subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
    queueGroupName: string = QueueGroupName.PaymentService;


    async onMessage(data: IOrderCancelledEvent['data'], msg: Message) {

        const order = await Order.findOne({ _id: data.id, version: data.version - 1 });

        if (!order) {
            throw new Error('Order not found');
        }


        order.set({
            status: OrderStatus.Cancelled,
            version: data.version
        })

        await order.save();

        msg.ack();

    }

}
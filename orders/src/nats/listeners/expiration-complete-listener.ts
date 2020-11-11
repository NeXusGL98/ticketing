import { IExpirationCompleteEvent, Listener, OrderStatus, Subjects } from "@jgtickegs/common";
import { Message } from "node-nats-streaming";
import { Order } from "../../models/order";
import { natsWrapper } from "../classes/nats-wrapper";
import { QueueGroupName } from "../enums/queue-group-name";
import { OrderCancelledPublisher } from "../publishers/order-cancelled";


export class ExpirationCompleteListener extends Listener<IExpirationCompleteEvent>{
    subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
    queueGroupName: string = QueueGroupName.ordersService;

    async onMessage(data: IExpirationCompleteEvent['data'], msg: Message) {

        const order = await Order.findById(data.orderId).populate('ticket');

        if (!order) {
            throw new Error('Order not found');
        }

        if (order.status == OrderStatus.Complete) {
            return msg.ack();
        }

        order.set({
            status: OrderStatus.Cancelled,
            version: order.version + 1
        });

        await order.save();

        await new OrderCancelledPublisher(natsWrapper.client).publish({
            id: order.id,
            ticket: {
                id: order.ticket.id
            },
            version: order.version
        });

        msg.ack();
    }

}
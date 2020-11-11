import { IPaymentCreatedEvent, Listener, OrderStatus, Subjects } from "@jgtickegs/common";
import { Message } from "node-nats-streaming";
import { Order } from "../../models/order";
import { QueueGroupName } from "../enums/queue-group-name";
import { OrderUpdatedPublisher } from "../publishers/order-updated-publisher";

export class PaymentCreatedListener extends Listener<IPaymentCreatedEvent> {
    subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
    queueGroupName = QueueGroupName.ordersService;

    async onMessage(data: IPaymentCreatedEvent['data'], msg: Message) {

        const order = await Order.findById(data.orderId).populate('ticket');

        if (!order) {
            throw new Error('Order not found');
        }

        order.set({
            status: OrderStatus.Complete,
            version: order.version + 1
        });

        await order.save();

        await new OrderUpdatedPublisher(this.client).publish({
            id: order.id,
            status: order.status,
            ticket: { id: order.ticket.id, price: order.ticket.price },
            version: order.version
        });

        msg.ack();

    }

}
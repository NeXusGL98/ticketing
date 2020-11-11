import { IOrderCreatedEvent, OrderStatus } from "@jgtickegs/common";
import { Ticket } from "../../../models/ticket";
import { natsWrapper } from "../../classes/nats-wrapper"
import { OrderCreatedListener } from "../order-created-listener"
import mongoose from 'mongoose';
import { Message } from "node-nats-streaming";

const setup = async () => {

    //Create an instance of the listener
    const listener = new OrderCreatedListener(natsWrapper.client);

    //create and save a ticket
    const ticket = Ticket.build({
        price: 150,
        title: 'Ticket for test',
        userId: 'testuserid'
    });

    await ticket.save();

    //Create te fake data event
    const data: IOrderCreatedEvent['data'] = {
        id: mongoose.Types.ObjectId().toHexString(),
        version: 0,
        status: OrderStatus.Created,
        userId: 'testuserid2',
        expiresAt: 'fakevalue',
        ticket: {
            id: ticket.id,
            price: ticket.price
        }
    }

    //fake message object
    //@ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    return { listener, ticket, data, msg };
}

it('Sets the orderId of the ticket', async () => {

    const {data,listener,msg,ticket} = await setup();

    await listener.onMessage(data,msg);

    const tcket = await Ticket.findById(ticket.id);

    expect(tcket?.orderId).toEqual(data.id);

});

it('Acks the message', async () => {
    
    const {data,listener,msg,ticket} = await setup();

    await listener.onMessage(data,msg);

    expect(msg.ack).toHaveBeenCalled();

});


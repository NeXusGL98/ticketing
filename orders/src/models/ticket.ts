import mongoose from "mongoose";
import { OrderStatus } from '@jgtickegs/common'
import { Order } from "./order";

interface TicketAttrs {
    title: string;
    price: number;
    id: string;
}

export interface TicketDoc extends mongoose.Document {
    title: string;
    price: number;
    version: number;

    isReserved(): Promise<Boolean>;
}

interface TicketModel extends mongoose.Model<TicketDoc> {
    build(attrs: TicketAttrs): TicketDoc;
    findByEvent(event: { id: string, version: number }): Promise<TicketDoc | null>;
}

const ticketSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    }
}, {
    toJSON: {
        transform(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
        }
    }
});

ticketSchema.set('versionKey', 'version');

ticketSchema.pre('save', function (done) {

    const version = this.get('version') <= 0 ? 0 : this.get('version') - 1
    //@ts-ignore
    this.$where = {
        version: version
    }
    done();
});

ticketSchema.statics.build = (attrs: TicketAttrs) => {
    return new Ticket({
        title: attrs.title,
        price: attrs.price,
        _id: attrs.id
    });
}

ticketSchema.statics.findByEvent = (event: { id: string, version: number }) => {
    return Ticket.findOne({
        _id: event.id,
        version: (event.version - 1)
    });
}

ticketSchema.methods.isReserved = async function () {

    //this is equal to the document we called.

    const existingOrder = await Order.findOne({
        ticket: this,
        status: {
            $in: [
                OrderStatus.Created,
                OrderStatus.AwaitingPayment,
                OrderStatus.Complete
            ]
        }
    });

    return !!existingOrder;

}

const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', ticketSchema);

export { Ticket };
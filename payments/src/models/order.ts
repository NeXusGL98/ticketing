
import { OrderStatus } from '@jgtickegs/common';
import mongoose from 'mongoose';

interface OrderAttrs {
    id: string,
    version: number,
    userId: string,
    price: number,
    status: OrderStatus
}

interface OrderDoc extends mongoose.Document {
    version: number,
    userId: string,
    price: number,
    status: OrderStatus
}

interface OrderModel extends mongoose.Model<OrderDoc> {
    build(attrs: OrderAttrs): OrderDoc
}

const orderSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: Object.values(OrderStatus)
    },

    price: {
        type: Number,
        required: true
    }
}, {
    toJSON: {
        transform(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
        }
    }
});

orderSchema.set('versionKey', 'version');

orderSchema.pre('save', function (done) {

    const version = this.get('version') <= 0 ? 0 : this.get('version') - 1
    //@ts-ignore
    this.$where = {
        version: version
    }
    done();
});

orderSchema.statics.build = (attrs: OrderAttrs) => {
    return new Order({
        userId: attrs.userId,
        version: attrs.version,
        price: attrs.price,
        status: attrs.status,
        _id: attrs.id    
    });
}

const Order = mongoose.model<OrderDoc, OrderModel>('Order', orderSchema);

export { Order };
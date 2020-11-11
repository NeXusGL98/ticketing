
import mongoose from 'mongoose';
import { app } from './app';
import { natsWrapper } from './nats/classes/nats-wrapper';
import { OrderCancelledListener } from './nats/listeners/order-cancelled-listener';
import { OrderCreatedListener } from './nats/listeners/order-created-listener';
import { OrderUpdatedListener } from './nats/listeners/order-updated-listener';

const start = async () => {

    if (!process.env.JWT_KEY) {
        throw new Error('JWT MUST BE DEFINED');
    }

    if (!process.env.STRIPE_KEY) {
        throw new Error('STRIPE KEY MUST BE DEFINED');
    }

    if (!process.env.MONGO_URI) {
        throw new Error('MONGO URI MUST BE DEFINED');
    }

    if (!process.env.NATS_URL) {
        throw new Error('NATS URI MUST BE PROVIDED');
    }

    if (!process.env.NATS_CLUSTER_ID) {
        throw new Error('NATS CLUSTER ID MUST BE PROVIDED');
    }

    if (!process.env.NATS_CLIENT_ID) {
        throw new Error('NATS CLIENT ID MUST BE PROVIDED');
    }

    try {
        await natsWrapper.connect(process.env.NATS_CLUSTER_ID!, process.env.NATS_CLIENT_ID!, process.env.NATS_URL!);

        natsWrapper.client.on('close',()=>{
            console.log('Nats connection close');
            process.exit();
        });

        new OrderCreatedListener(natsWrapper.client).listen();
        new OrderCancelledListener(natsWrapper.client).listen();
        new OrderUpdatedListener(natsWrapper.client).listen();
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true
        });
    } catch (error) {
        console.log(error);
    }

    app.listen(3000, () => console.log('Listening on port 3000'));
}

start();


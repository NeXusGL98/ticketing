
import mongoose from 'mongoose';
import { app } from './app';
import { natsWrapper } from './nats/classes/nats-wrapper';
import { ExpirationCompleteListener } from './nats/listeners/expiration-complete-listener';
import { PaymentCreatedListener } from './nats/listeners/payment-created-listener';
import { TicketCreatedListener } from './nats/listeners/ticket-created-listener';
import { TicketUpdatedListener } from './nats/listeners/ticket-updated-listener';

const start = async () => {

    console.log('Starting order App')

    if (!process.env.JWT_KEY) {
        throw new Error('JWT MUST BE DEFINED');
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


        new TicketCreatedListener(natsWrapper.client).listen();
        new TicketUpdatedListener(natsWrapper.client).listen();
        new ExpirationCompleteListener(natsWrapper.client).listen();
        new PaymentCreatedListener(natsWrapper.client).listen();
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


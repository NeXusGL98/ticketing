
import { natsWrapper } from './nats/classes/nats-wrapper';
import { OrderCreatedListener } from './nats/listeners/order-created-listener';

const start = async () => {

  
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
    } catch (error) {
        console.log(error);
    }

}

start();


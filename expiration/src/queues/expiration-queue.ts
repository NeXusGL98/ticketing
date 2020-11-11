import Queue from 'bull';
import { natsWrapper } from '../nats/classes/nats-wrapper';
import { ExpirationCompletePublisher } from '../nats/publishers/expiration-complete-publisher';

interface Payload {
    orderId: string;
}

const expirationQueue = new Queue<Payload>('order:expiration', {
    redis: {
        host: process.env.REDIS_HOST
    }
});

expirationQueue.process(async (job) => {

    console.log('I want to publish an expiration:complete event for orderId', job.data.orderId);

    new ExpirationCompletePublisher(natsWrapper.client).publish({orderId:job.data.orderId});

});

export { expirationQueue };
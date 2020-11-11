import { Publisher, IOrderCreatedEvent, Subjects } from '@jgtickegs/common';

export class OrderCreatedPublisher extends Publisher<IOrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
}

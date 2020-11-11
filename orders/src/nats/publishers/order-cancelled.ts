import { Subjects, Publisher, IOrderCancelledEvent } from '@jgtickegs/common';

export class OrderCancelledPublisher extends Publisher<IOrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
}

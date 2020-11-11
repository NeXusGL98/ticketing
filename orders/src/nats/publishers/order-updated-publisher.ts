import { IOrderUpdated, Publisher, Subjects } from '@jgtickegs/common';

export class OrderUpdatedPublisher extends Publisher<IOrderUpdated> {
  subject: Subjects.OrderUpdated = Subjects.OrderUpdated;
}

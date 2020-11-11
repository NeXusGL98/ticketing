import { IPaymentCreatedEvent, Publisher, Subjects } from "@jgtickegs/common";


export class PaymentCreatedPublisher extends Publisher<IPaymentCreatedEvent>{
    subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
}
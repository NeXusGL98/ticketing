import { IExpirationCompleteEvent, Publisher, Subjects } from "@jgtickegs/common";

export class ExpirationCompletePublisher extends Publisher<IExpirationCompleteEvent>{
    subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
}
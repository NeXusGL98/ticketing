import { ITicketUpdatedEvent, Publisher, Subjects } from "@jgtickegs/common";



export class TicketUpdatedPublisher extends Publisher<ITicketUpdatedEvent>{
    readonly subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
}
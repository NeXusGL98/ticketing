import { ITicketCreatedEvent, Publisher, Subjects } from "@jgtickegs/common";



export class TicketCreatedPublisher extends Publisher<ITicketCreatedEvent>{
    readonly subject: Subjects.TickectCreated = Subjects.TickectCreated;
}
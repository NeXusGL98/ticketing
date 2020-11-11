import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import { natsWrapper } from '../../nats/classes/nats-wrapper';


it('has a route handler listening to /api/tickets for posts requests', async () => {

    const response = await request(app).post('/api/tickets').send({});


    expect(response.status).not.toEqual(404);

});

it('can only be access if user is signed in', async () => {

    const response = await request(app).post('/api/tickets').send({});

    expect(response.status).toEqual(401);
});

it('returns status different from 401  if user is signed in', async () => {

    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({});

    expect(response.status).not.toEqual(401);
});

it('returns an error if an invalid title is provided', async () => {

    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({
            title: null,
            price: '10'
        });

    expect(response.status).toEqual(400);

});

it('returns an error if invalid price is provided', async () => {

    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({
            title: 'new ticket',
            price: null
        });

    expect(response.status).toEqual(400);

});

it('creates a ticket with valid inputs', async () => {

    let tickets = await Ticket.find({});
    expect(tickets.length).toEqual(0);

    await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({
            title: 'new ticket',
            price: 20
        }).expect(201);

    tickets = await Ticket.find({});
    expect(tickets.length).toEqual(1);
});

it('send a ticket:created event', async () => {

    await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({
            title: 'new ticket',
            price: 20
        }).expect(201);

    
   expect(natsWrapper.client.publish).toHaveBeenCalled();
});

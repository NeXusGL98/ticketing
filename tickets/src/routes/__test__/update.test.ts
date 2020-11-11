import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { natsWrapper } from '../../nats/classes/nats-wrapper';


it('returns 404 if provided id does not exist', async () => {
    const id = new mongoose.Types.ObjectId().toHexString();
    const response = await request(app).put(`/api/tickets/${id}`)
        .send({ title: 'asdasd', price: 10 })
        .set('Cookie', global.signin())
        .expect(404);
})

it('returns 401 if user is not auth', async () => {
    const id = new mongoose.Types.ObjectId().toHexString();
    const response = await request(app).put(`/api/tickets/${id}`)
        .send({
            title: 'asdasd',
            price: 200
        })
        .expect(401);
})

it('returns 401 if user does not own the ticket', async () => {
    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({
            title: 'new ticket',
            price: 20
        }).expect(201);

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', global.signin())
        .send({
            title: 'unauthorized user ticket',
            price: 20
        }).expect(401);

})

it('returns 400 if user provided invalid title or price', async () => {
    const cookie = global.signin();

    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title: 'new ticket',
            price: 10
        }).expect(201);

    //invalid price
    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: 'ticket updated',
            price: -10
        }).expect(400);


    //invalid title
    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: '',
            price: 200
        }).expect(400);
})

it('updates the ticket', async () => {
    const cookie = global.signin();

    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title: 'new ticket',
            price: 20
        }).expect(201);

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: 'ticket updated',
            price: 20
        }).expect(200);
})


it('publish a ticket:updated event', async () => {
    const cookie = global.signin();

    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title: 'new ticket',
            price: 20
        }).expect(201);

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: 'ticket updated',
            price: 20
        }).expect(200);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
})
import request from 'supertest';
import { app } from '../../app';


it('returns 201 on successfull signup',async ()=>{
    return request(app)
    .post('/api/users/signup')
    .send({email: 'josegil9807@gmail.com',password:'password'})
    .expect(201);
});

it('returns 400 with an invalid email',async ()=>{
    return request(app)
    .post('/api/users/signup')
    .send({email: 'josegil9807',password:'password'})
    .expect(400);
});

it('returns 400 with an invalid password',async ()=>{
    return request(app)
    .post('/api/users/signup')
    .send({email: 'josegil9807@gmail.com',password:'123'})
    .expect(400);
});

it('returns 400 with missing email and password',async ()=>{
    return request(app)
    .post('/api/users/signup')
    .send({})
    .expect(400);
});

it('disallows duplicate emails',async ()=>{
    await request(app)
    .post('/api/users/signup')
    .send({email: 'josegil9807@gmail.com',password:'password'})
    .expect(201);


    await request(app)
    .post('/api/users/signup')
    .send({email: 'josegil9807@gmail.com',password:'password'})
    .expect(400);
});

it('sets a cookie after sucessfull signup',async ()=>{
    const response = await request(app)
    .post('/api/users/signup')
    .send({email: 'josegil9807@gmail.com',password:'password'})
    .expect(201);

    expect(response.get('Set-Cookie')).toBeDefined();

});
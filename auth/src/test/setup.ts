import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../app';


let mongo: any;

declare global {
    namespace NodeJS{
        interface Global {
            signin(): Promise<string[]>
        }
    }
}

beforeAll(async () => {

    process.env.JWT_KEY = 'WHATEVERSTRING';
    process.env.NODE_ENV = 'test';

    //starting mongodb memory server
    mongo = new MongoMemoryServer();
    const mongoUri = await mongo.getUri();

    //connecting to db
    await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
});

beforeEach(async () => {

    //deleting all collections before each test
    const collections = await mongoose.connection.db.collections();
    for (const collection of collections) {

        await collection.deleteMany({});

    }
});

afterAll(async () => {

    await mongo.stop();
    await mongoose.connection.close();
})

global.signin = async () => {
    const email = 'test@mailinator.com';
    const password = 'password';

    const response = await request(app).post('/api/users/signup')
        .send({ email, password })
        .expect(201);

    const cookie = response.get('Set-Cookie');

    return cookie;
}
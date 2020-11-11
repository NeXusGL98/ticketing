import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../app';
import jwt from 'jsonwebtoken';

let mongo: any;

declare global {
    namespace NodeJS {
        interface Global {
            signin(): string[]
        }
    }
}

jest.mock('../nats/classes/nats-wrapper')


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

    jest.clearAllMocks();

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

global.signin = () => {

    //Build a JWT payload. {id, email}
    const payload = {
        id: new mongoose.Types.ObjectId().toHexString(),
        email: 'test@mailinator.com'
    }
    // Create jwt
    const token = jwt.sign(payload, process.env.JWT_KEY!);
    // Build a session object
    const session = { jwt: token };

    //Turn that session into JSON
    const sessionJson = JSON.stringify(session);

    const base64 = Buffer.from(sessionJson).toString('base64');

    return [`express:sess=${base64}`];
}
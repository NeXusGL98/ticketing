
import mongoose from 'mongoose';
import { app } from './app';
const start = async () => {

    console.log('Starting auth app')
    if(!process.env.JWT_KEY){
        throw new Error('JWT MUST BE DEFINED');
    }

    if(!process.env.MONGO_URI){
        throw new Error('MONGO URI MUST BE DEFINED');
    }

    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true
        });
    } catch (error) {
        console.log(error);
    }

    app.listen(3000, () => console.log('Listening on port 3000'));
}

start();


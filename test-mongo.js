require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function testConnection() {
    try {
        console.log('Connecting to', process.env.MONGODB_URI.replace(/:([^:@]{1,})@/, ':***@'));
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000
        });
        console.log('Successfully connected to MongoDB.');
        process.exit(0);
    } catch (error) {
        console.error('MongoDB connection error:');
        console.error(error);
        process.exit(1);
    }
}

testConnection();

const mongoose = require('mongoose');

let reviewConnection;

const reviewDB = async () => {
    try {
        if (!process.env.REVIEW_DB_URI) {
            throw new Error(`REVIEW_DB_URI is not defined`);
        }
        if (!reviewConnection) {
            reviewConnection = await mongoose.createConnection(process.env.REVIEW_DB_URI, {
                useNewUrlParser: true,
                useUnifiedTopology: true
            });
            console.log('ReviewDB Connected...');
        }
        return reviewConnection;
    } catch (error) {
        console.error('ReviewDB connection failed:', error.message);
        process.exit(1);
    }
};

module.exports = reviewDB;
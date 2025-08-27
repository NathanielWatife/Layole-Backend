const mongoose = require('mongoose');

let contactConnection;

const contactDB = async () => {
    try {
        if (!process.env.CONTACT_DB_URI) {
            throw new Error(`CONTACT_DB_URI is not defined`);
        }
        if (!contactConnection) {
            contactConnection = await mongoose.createConnection(process.env.CONTACT_DB_URI);
            console.log('ContactDB Connected...');
        }
        return contactConnection;
    } catch (error) {
        console.error('ContactDB connection failed:', error.message);
        process.exit(1);
    }
};

module.exports = contactDB;
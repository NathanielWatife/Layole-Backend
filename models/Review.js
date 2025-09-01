const mongoose = require('mongoose');
const reviewDB = require('../config/reviewDb');

const reviewSchema = new mongoose.Schema({
    patientName: {
        type: String,
        required: [true, 'Patient name is required'],
        trim: true,
        maxlength: [200, 'Patient name cannot exceed 100 characters']
    },
    email: {
        type: String,
        required: [true, 'Patient email is required'],
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
    },
    comment: {
        type: String,
        required: [true, 'Review comment is required'],
        trim: true,
        maxlength: [10000, "Cannot exceed 10000 characters"]
    },
}, {
    timestamps: true
});


const getReviewModel = async () => {
    try {
        const connection = await reviewDB();
        return connection.model('Review', reviewSchema);
    } catch {
        console.error('Error getting review model:', error);
        throw error;
    }
};

module.exports = getReviewModel;
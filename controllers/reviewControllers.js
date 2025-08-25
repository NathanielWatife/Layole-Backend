const Review = require("../models/Review");
const { sendEmail } = require("../utils/sendEmail");
const { sendReviewNotification } = require("../utils/emailTemplates");

// create new review
const createReview = async (req, res, next) => {
    try {
        const reviewData = req.body;

        const review = new Review(reviewData);
        await review.save();

        // Send notification email to admin
        try {
            await sendEmail(
                process.env.HOSPITAL_EMAIL,
                "New Patient Review Submitted",
                sendReviewNotification(reviewData),
                `New review submitted by ${reviewData.patientName}`
            );
        } catch (emailError) {
            console.error("Error sending review notification email:", emailError);
        }
        res.status(201).json({
            success: true,
            message: "Review submitted successfully",
            data: review
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createReview
}
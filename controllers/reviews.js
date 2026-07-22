const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const ExpressError = require("../utils/ExpressError.js");

// CREATE REVIEW
module.exports.createReview = async (req, res, next) => {
    const { id } = req.params;

    const listing = await Listing.findById(id);

    if (!listing) {
        return next(new ExpressError(404, "Listing Not Found"));
    }

    const review = new Review(req.body.review);

    review.author = req.user._id;

    listing.reviews.push(review);

    await review.save();
    await listing.save();

    req.flash("success", "Review Added Successfully!");

    res.redirect(`/listings/${id}`);
};

// DELETE REVIEW
module.exports.destroyReview = async (req, res, next) => {
    const { id, reviewId } = req.params;

    const listing = await Listing.findByIdAndUpdate(
        id,
        {
            $pull: {
                reviews: reviewId,
            },
        }
    );

    const review = await Review.findByIdAndDelete(reviewId);

    if (!listing) {
        return next(new ExpressError(404, "Listing Not Found"));
    }

    if (!review) {
        return next(new ExpressError(404, "Review Not Found"));
    }

    req.flash("success", "Review Deleted Successfully!");

    res.redirect(`/listings/${id}`);
};
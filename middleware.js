const Listing = require("./models/listing");
const Review=require("./models/review");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("./schema.js");
module.exports.isLoggedIn=(req,res,next)=>{
    if(!req.isAuthenticated()){
        req.session.redirectUrl=req.originalUrl;
        req.flash("error","you must be logged in");
        return res.redirect("/login");
    }
    next();
}

module.exports.saveRedirectUrl=(req,res,next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl=req.session.redirectUrl;
    }
    next();
}

module.exports.isOwner = async (req, res, next) => {
    console.log("Middleware called");

    let { id } = req.params;
    let listing = await Listing.findById(id);

    console.log("Listing owner:", listing.owner.toString());
    console.log("Logged in user:", req.user._id.toString());

    if (!listing.owner.equals(req.user._id)) {
        console.log("Not Owner");
        req.flash("error", "You don't have permission to perform this action");
        return res.redirect(`/listings/${id}`);
    }

    console.log("Owner Verified");
    next();
};
// Joi Validation Middleware
module.exports.validateListing = (req, res, next) => {
    const { error } = listingSchema.validate(req.body);

    if (error) {
        throw new ExpressError(400, error.details[0].message);

    }

    next();
};
module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);

    if (error) {
        throw new ExpressError(400, error.details[0].message);
    }

    next();
};
module.exports.isReviewAuthor = async (req, res, next) => {
    console.log("isReviewAuthor called");

    let { id, reviewId } = req.params;
    let review = await Review.findById(reviewId);

    console.log("Review Author:", review.author.toString());
    console.log("Logged in User:", req.user._id.toString());

    if (!review.author.equals(req.user._id)) {
        console.log("NOT AUTHOR");
        req.flash("error", "You didn't create this review");
        return res.redirect(`/listings/${id}`);
    }

    console.log("AUTHOR VERIFIED");
    next();
};
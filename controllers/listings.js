const Listing = require("../models/listing.js");
const ExpressError = require("../utils/ExpressError.js");

// INDEX
module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index", { allListings });
};

// NEW
module.exports.renderNewForm = (req, res) => {
    res.render("listings/new");
};

// SHOW
module.exports.showListing = async (req, res, next) => {
    const { id } = req.params;

    const listing = await Listing.findById(id)
        .populate({
            path: "reviews",
            populate: {
                path: "author",
            },
        })
        .populate("owner");

    if (!listing) {
        return next(new ExpressError(404, "Listing Not Found"));
    }

    res.render("listings/show", { listing });
};

module.exports.createListing = async (req, res) => {
    console.log(req.body);
    console.log(req.file);

    const newListing = new Listing(req.body.listing);

    newListing.owner = req.user._id;

    if (req.file) {
        newListing.image = {
            url: req.file.path,
            filename: req.file.filename,
        };
    }

    await newListing.save();

    req.flash("success", "New Listing Created Successfully!");

    res.redirect("/listings");
};

// EDIT
module.exports.renderEditForm = async (req, res, next) => {
    const { id } = req.params;

    const listing = await Listing.findById(id);

    if (!listing) {
        return next(new ExpressError(404, "Listing Not Found"));
    }

    res.render("listings/edit", { listing });
};

// UPDATE
module.exports.updateListing = async (req, res, next) => {
    const { id } = req.params;

    const listing = await Listing.findByIdAndUpdate(
        id,
        { ...req.body.listing },
        {
            new: true,
            runValidators: true,
        }
    );

    if (!listing) {
        return next(new ExpressError(404, "Listing Not Found"));
    }

    if (req.file) {
        listing.image = {
            url: req.file.path,
            filename: req.file.filename,
        };

        await listing.save();
    }

    req.flash("success", "Listing Updated Successfully!");

    res.redirect(`/listings/${id}`);
};

// DELETE
module.exports.destroyListing = async (req, res, next) => {
    const { id } = req.params;

    const listing = await Listing.findByIdAndDelete(id);

    if (!listing) {
        return next(new ExpressError(404, "Listing Not Found"));
    }

    req.flash("success", "Listing Deleted Successfully!");

    res.redirect("/listings");
};
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review=require("./review.js");

const listingSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: String,
    image: {
        filename: {
            type: String,
            default: "listingimage",
        },
        url: {
            type: String,
            default:
                "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267",
        },
    },
    price: Number,
    location: String,
    country: String,
    reviews:[{
        type:Schema.Types.ObjectId,
        ref:"Review",
    }],
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User"
    }
});

listingSchema.post("findOneAndDelete",async(listing)=>{
        console.log("Middleware running...");
    console.log(listing);
    if(listing){

        await Review.deleteMany({_id:{$in:listing.reviews}})
    }
})

const Listing = mongoose.model("listing", listingSchema);

module.exports = Listing;
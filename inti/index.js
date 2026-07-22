require("dotenv").config({ path: "../.env" });
const mongoose=require("mongoose");
const initData=require("./data.js");
const listing=require("../models/listing.js");
const mongoUrl=process.env.ATLASDB_URL;


main().then(()=>{
    console.log("connected to db");
}).catch((err)=>{
        console.log(err);
    });

async function main(){
await mongoose.connect(mongoUrl);
}

const initDB=async ()=>{
    await listing.deleteMany({});
    initData.data=initData.data.map((obj)=>{
        obj.owner="6a60c9bb818beadd696d35e4";
        return obj;
    })
    await listing.insertMany(initData.data);
    console.log("data was initiliized");
}
initDB();

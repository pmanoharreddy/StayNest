const mongoose=require("mongoose");
const initData=require("./data.js");
const listing=require("../models/listing.js");
const mongoUrl="mongodb://127.0.0.1:27017/airbnb";


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
        obj.owner="6a5f4bf30707acd63319f397";
        return obj;
    })
    await listing.insertMany(initData.data);
    console.log("data was initiliized");
}
initDB();

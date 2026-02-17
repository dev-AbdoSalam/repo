import mongoose from "mongoose"

export const connectDB = async () => {
    return await mongoose.connect(process.env.DB_URI).then(res => {
        console.log("success connect");
    }).catch(err => {
        console.log("fail to connect", err);
    })
}
import mongoose, { model, Schema, Types } from "mongoose";

export const roleTypes = { user: "user", admin: "admin" }
export const genderTypes = { male: "male", female: "female" }
export const providerTypes = { google: "google", system: "system" }

const userSchema = new Schema({
    userName: { type: String, required: true, trim: true, minlength: 2, maxlength: 30 },
    email: { type: String, required: true, unique: true },
    password: {
        type: String, required: (data) => {
            return data?.provider === providerTypes.google ? false : true
        }
    },
    confirmEmail: { type: Boolean, default: false },
    confirmEmailOTP: String,
    forgotPasswordOTP: String,
    tempEmailOTP: String,
    tempEmail: String,
    Phone: String,
    Address: String,
    image: { secure_url: String, public_id: String },
    coverImage: [{ secure_url: String, public_id: String }],
    role: { type: String, enum: Object.values(roleTypes), default: roleTypes.user },
    gender: { type: String, enum: Object.values(genderTypes), default: genderTypes.male },
    provider: { type: String, enum: Object.values(providerTypes), default: providerTypes.system },
    isDeleted: { type: Boolean, default: false },
    changeCredentialsTime: Date,
    DOB: Date,
    viewers: [{
        userId: { type: Types.ObjectId, ref: "User" },
        time: Date
    }]
}, {
    timestamps: true
})

export const userModel = mongoose.models.User || model("User", userSchema)
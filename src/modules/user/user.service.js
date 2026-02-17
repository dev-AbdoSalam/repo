import { emailEvents, emailSubject } from "../../utils/email/enents/event.email.js";
import { asyncHandler } from "../../utils/ressponse/error.response.js";
import { successResponse } from "../../utils/ressponse/success.response.js";
import { compareHash } from "../../utils/security/hash.security.js";
import { findOne, findOneAndUpdate, updateOne } from "./user.repo.js";
import { generateHash } from './../../utils/security/hash.security.js';

export const profile = asyncHandler(async (req, res, next) => {
    const user = await findOne({
        filter: { _id: req.user._id },
        populate: [{
            path: "viewers.userId",
            select: "userName email"
        }]
    })
    return successResponse({ res, data: { user } })
})

export const shareProfile = asyncHandler(async (req, res, next) => {
    const { profileId } = req.params
    let user = ""
    if (profileId === req.user._id.toString()) {
        user = req.user
    } else {
        user = await findOneAndUpdate({
            filter: { _id: req.user._id, isDeleted: false },
            data: {
                $push: { viewers: { userId: req.user._id, time: Date.now() } }
            },
            select: "userName email image"
        })
    }
    return successResponse({ res, data: { user } })
})

export const updateEmail = asyncHandler(async (req, res, next) => {
    const { email } = req.body
    const user = await findOne({ filter: { email } })
    if (user) {
        return next(new Error("email exists", { cause: 409 }))
    }
    await updateOne({
        filter: { _id: req.user._id },
        data: { tempEmail: email }
    })
    emailEvents.emit(emailSubject.confirmEmail, { id: req.user._id, email: req.user.email })
    emailEvents.emit(emailSubject.tempEmail, { id: req.user._id, email })
    return successResponse({ res })
})

export const resetEmail = asyncHandler(async (req, res, next) => {
    const { oldCode, newCode } = req.body
    if (
        !compareHash({ plainText: oldCode, hashValue: req.user.confirmEmailOTP })
        ||
        !compareHash({ plainText: newCode, hashValue: req.user.tempEmailOTP })
    ) {
        return next(new Error("in-valid codes", { cause: 400 }))
    }
    await updateOne({
        filter: { _id: req.user._id },
        data: { email: req.user.tempEmail, $unset: { confirmEmailOTP: 0, tempEmailOTP: 0, tempEmail: 0 }, changeCredentialsTime: Date.now() }
    })
    return successResponse({ res })
})

export const updatePassword = asyncHandler(async (req, res, next) => {
    const { oldPassword, newPassword } = req.body
    if (!compareHash({ plainText: oldPassword, hashValue: req.user.password })) {
        return next(new Error("in-valid oldPassword", { cause: 404 }))
    }
    await updateOne({ filter: { _id: req.user._id }, data: { password: generateHash({ plainText: newPassword }), changeCredentialsTime: Date.now() } })
    return successResponse({ res })
})

export const updateProfile = asyncHandler(async (req, res, next) => {
    const user = await findOneAndUpdate({
        filter: { _id: req.user._id },
        data: req.body,
        options: { new: true }
    })
    return successResponse({ res, data: { user } })
})

export const uploadImageDisk = asyncHandler(async (req, res, next) => {
    const user = await findOneAndUpdate({
        filter: { _id: req.user._id },
        data: {
            image: req.file.finalPath
        },
        options: { new: true }
    })
    return successResponse({ res, data: { user } })
})

export const uploadCoverDisk = asyncHandler(async (req, res, next) => {
    const user = await findOneAndUpdate({
        filter: { _id: req.user._id },
        data: {
            coverImage: req.files.map(file => file.finalPath)
        },
        options: { new: true }
    })
    return successResponse({ res, data: { user } })
})


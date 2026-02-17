import { emailEvents, emailSubject } from "../../utils/email/enents/event.email.js";
import { asyncHandler } from "../../utils/ressponse/error.response.js";
import { successResponse } from "../../utils/ressponse/success.response.js";
import { compareHash, generateHash } from "../../utils/security/hash.security.js";
import { decodedToken, generateToken, tokenTypes } from "../../utils/security/token.security.js";
import { providerTypes, roleTypes } from "../User.schema.js";
import { create, findOne, updateOne } from "./auth.repo.js";
import { OAuth2Client } from 'google-auth-library';

export const signup = asyncHandler(async (req, res, next) => {
    const { userName, email, password } = req.body
    const checkUser = await findOne({ email })
    if (checkUser) {
        return next(new Error("email exists", { cause: 409 }))
    }
    const hashPassword = generateHash({ plainText: password })
    const user = await create({ data: { userName, email, password: hashPassword } })
    emailEvents.emit(emailSubject.confirmEmail, { id: user._id, email })
    return successResponse({ res, status: 201, message: "signup", data: { user } })
})

export const confirmEmail = asyncHandler(async (req, res, next) => {
    const { email, code } = req.body
    const user = await findOne({ filter: { email } })
    if (!user) {
        return next(new Error("in-vaild account", { cause: 404 }))
    }
    if (user.confirmEmail) {
        return next(new Error("Already verifyied account", { cause: 409 }))
    }
    if (!compareHash({ plainText: code, hashValue: user.confirmEmailOTP })) {
        return next(new Error("in-valid code", { cause: 400 }))
    }
    await updateOne({ filter: { email }, data: { confirmEmail: true, $unset: { confirmEmailOTP: 0 } } })
    return successResponse({ res, message: "success confirm" })
})

export const login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body
    const user = await findOne({ filter: { email } })
    if (!user) {
        return next(new Error("in-vaild account", { cause: 404 }))
    }
    if (!user.confirmEmail) {
        return next(new Error("please verify account", { cause: 400 }))
    }
    if (!compareHash({ plainText: password, hashValue: user.password })) {
        return next(new Error("in-valid account", { cause: 400 }))
    }
    const accessToken = generateToken({
        payload: { id: user._id },
        signature: user.role === roleTypes.admin ? process.env.ADMIN_ACCESS_TOKEN : process.env.USER_ACCESS_TOKEN
    })
    const refreshToken = generateToken({
        payload: { id: user._id },
        signature: user.role === roleTypes.admin ? process.env.ADMIN_REFRESH_TOKEN : process.env.USER_REFRESH_TOKEN,
        expiresIn: 31536000
    })
    return successResponse({ res, message: "login", data: { token: { accessToken, refreshToken } } })
})

export const refreshToken = asyncHandler(async (req, res, next) => {
    const { authorization } = req.headers
    const user = await decodedToken({ authorization, tokenType: tokenTypes.refresh, next })
    const accessToken = generateToken({
        payload: { id: user._id },
        signature: user.role === roleTypes.admin ? process.env.ADMIN_ACCESS_TOKEN : process.env.USER_ACCESS_TOKEN,
        expiresIn: 86400
    })
    const refreshToken = generateToken({
        payload: { id: user._id },
        signature: user.role === roleTypes.admin ? process.env.ADMIN_REFRESH_TOKEN : process.env.USER_REFRESH_TOKEN,
        expiresIn: 31536000
    })
    return successResponse({ res, message: "login", data: { token: { accessToken, refreshToken } } })
})

export const loginWithGmail = asyncHandler(async (req, res, next) => {
    const { idToken } = req.body
    const client = new OAuth2Client();
    async function verify() {
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.WEB_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        return payload
    }
    const payload = await verify();
    if (!payload.email_verified) {
        return next(new Error("in-valid account", { cause: 404 }))
    }
    let user = await findOne({ filter: { email: payload.email } })
    if (!user) {
        user = await create({
            data: {
                userName: payload.name,
                email: payload.email,
                confirmEmail: payload.email_verified,
                image: payload.picture,
                provider: providerTypes.google
            }
        })
    }
    if (user.provider !== providerTypes.google) {
        return next(new Error("in-valid provider", { cause: 400 }))
    }
    const accessToken = generateToken({
        payload: { id: user._id },
        signature: user.role === roleTypes.admin ? process.env.ADMIN_ACCESS_TOKEN : process.env.USER_ACCESS_TOKEN
    })
    const refreshToken = generateToken({
        payload: { id: user._id },
        signature: user.role === roleTypes.admin ? process.env.ADMIN_REFRESH_TOKEN : process.env.USER_REFRESH_TOKEN,
        expiresIn: 31536000
    })
    return successResponse({ res, message: "login", data: { token: { accessToken, refreshToken } } })
})

export const forgotPassword = asyncHandler(async (req, res, next) => {
    const { email } = req.body
    const user = await findOne({ filter: { email } })
    if (!user) {
        return next(new Error("in-valid account", { cause: 404 }))
    }
    if (!user.confirmEmail) {
        return next(new Error("please verify account", { cause: 400 }))
    }
    emailEvents.emit(emailSubject.forgotPassword, { id: user._id, email })
    return successResponse({ res })
})

export const verifyForgotPassword = asyncHandler(async (req, res, next) => {
    const { email, code } = req.body
    const user = await findOne({ filter: { email } })
    if (!user) {
        return next(new Error("in-valid account", { cause: 404 }))
    }
    if (!user.confirmEmail) {
        return next(new Error("please verify account", { cause: 400 }))
    }
    if (!compareHash({ plainText: code, hashValue: user.forgotPasswordOTP })) {
        return next(new Error("in-valid code", { cause: 400 }))
    }
    return successResponse({ res })
})

export const resetPassword = asyncHandler(async (req, res, next) => {
    const { email, code, newPassword } = req.body
    const user = await findOne({ filter: { email } })
    if (!user) {
        return next(new Error("in-valid account", { cause: 404 }))
    }
    if (!user.confirmEmail) {
        return next(new Error("please verify account", { cause: 400 }))
    }
    if (!compareHash({ plainText: code, hashValue: user.forgotPasswordOTP })) {
        return next(new Error("in-valid code", { cause: 400 }))
    }
    await updateOne({
        filter: { email, isDeleted: false },
        data: { password: generateHash({ plainText: newPassword }), $unset: { forgotPasswordOTP: 0 }, changeCredentialsTime: Date.now() }
    })
    return successResponse({ res })
})
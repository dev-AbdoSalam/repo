import jwt from "jsonwebtoken"
import { roleTypes } from "../../modules/User.schema.js"
import { findOne } from "./token.repo.js"

export const tokenTypes = { access: "access", refresh: "refresh" }
export const decodedToken = async ({ authorization = {}, tokenType = tokenTypes.access, next = {} } = {}) => {
    const [bearer, token] = authorization?.split(" ") || []
    if (!bearer || !token) {
        return next(new Error("in-valid token components", { cause: 400 }))
    }
    let access_signature = ""
    let refresh_signature = ""
    switch (bearer) {
        case roleTypes.admin:
            access_signature = process.env.ADMIN_ACCESS_TOKEN
            refresh_signature = process.env.ADMIN_REFRESH_TOKEN
            break;
        case roleTypes.user:
            access_signature = process.env.USER_ACCESS_TOKEN
            refresh_signature = process.env.USER_REFRESH_TOKEN
            break;

        default:
            break;
    }
    const decoded = verifyToken({
        token,
        signature: tokenType === tokenTypes.refresh ? refresh_signature : access_signature
    })
    if (!decoded?.id) {
        return next(new Error("in-valid token payload", { cause: 401 }))
    }
    const user = await findOne({ filter: { _id: decoded.id, isDeleted: false } })
    if (!user) {
        return next(new Error("in-valid account", { cause: 404 }))
    }
    if (user.changeCredentialsTime?.getTime() >= decoded.iat * 1000) {
        return next(new Error("in-valid credentials", { cause: 400 }))
    }
    return user
}

export const generateToken = ({ payload = {}, signature = process.env.USER_ACCESS_TOKEN, expiresIn = parseInt(process.env.EXPIRESIN) } = {}) => {
    return jwt.sign(payload, signature, { expiresIn })
}
export const verifyToken = ({ token, signature = process.env.USER_ACCESS_TOKEN } = {}) => {
    return jwt.verify(token, signature)
}
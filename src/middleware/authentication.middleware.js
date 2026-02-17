import { asyncHandler } from "../utils/ressponse/error.response.js"
import { decodedToken } from "../utils/security/token.security.js"

export const authentication = () => {
    return asyncHandler(async (req, res, next) => {
        const { authorization } = req.headers
        req.user = await decodedToken({ authorization, next })
        return next()
    })
}
export const authorization = (accessRole = []) => {
    return asyncHandler(async (req, res, next) => {
        if (!accessRole.includes(req.user.role)) {
            return next(new Error("un authorized account", { cause: 403 }))
        }
        return next()
    })
}
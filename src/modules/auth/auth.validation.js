import joi from "joi"
import { generalField } from "../../middleware/validation.middleware.js"

export const signup = joi.object().keys({
    userName: generalField.userName.required(),
    email: generalField.email.required(),
    password: generalField.password.required(),
    confirmPassword: generalField.confirmPassword.required(),
}).required()

export const confirmEmail = joi.object().keys({
    email: generalField.email.required(),
    code: generalField.code.required(),
}).required()

export const login = joi.object().keys({
    email: generalField.email.required(),
    password: generalField.password.required(),
}).required()

export const forgotPassword = joi.object().keys({
    email: generalField.email.required(),
}).required()

export const verifyForgotPassword = confirmEmail

export const resetPassword = joi.object().keys({
    email: generalField.email.required(),
    code: generalField.code.required(),
    newPassword: generalField.password.required(),
    confirmPassword: joi.string().valid(joi.ref("newPassword")).required(),
}).required()
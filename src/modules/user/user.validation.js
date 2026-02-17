import joi from "joi"
import { generalField } from "../../middleware/validation.middleware.js"

export const shareProfile = joi.object().keys({
    profileId: generalField.id.required()
}).required()

export const updateEmail = joi.object().keys({
    email: generalField.email.required()
}).required()

export const resetEmail = joi.object().keys({
    oldCode: generalField.code.required(),
    newCode: generalField.code.required()
}).required()

export const updatePassword = joi.object().keys({
    oldPassword: generalField.password.required(),
    newPassword: generalField.password.required(),
    confirmPassword: joi.string().valid(joi.ref("newPassword")).required()
}).required()

export const updateProfile = joi.object().keys({
    userName: generalField.userName,
    email: generalField.email,
    Phone: generalField.Phone,
    gender: generalField.gender,
    DOB: generalField.DOB
}).required()

export const uploadImageDisk = joi.object().keys({
    file: generalField.file
})
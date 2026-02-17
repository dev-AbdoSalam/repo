import joi from "joi"
import { Types } from "mongoose"
import { genderTypes } from "../modules/User.schema.js"

const isValidateObjectId = (value, helper) => {
    return Types.ObjectId.isValid(value) ? true : helper("in-valid object id")
}

const fileObj = {
    fieldname: joi.string().valid("attachments"),
    originalname: joi.string(),
    encoding: joi.string(),
    mimetype: joi.string(),
    destination: joi.string(),
    filename: joi.string(),
    finalPath: joi.string(),
    path: joi.string(),
    size: joi.number(),
}

export const generalField = {
    userName: joi.string().trim().min(2).max(30),
    email: joi.string().email({ minDomainSegments: 2, maxDomainSegments: 3, tlds: { allow: ["com"] } }),
    password: joi.string().pattern(new RegExp(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/)),
    confirmPassword: joi.string().valid(joi.ref("password")),
    code: joi.string().pattern(new RegExp(/^\d{4}$/)),
    id: joi.string().custom(isValidateObjectId),
    Phone: joi.string().pattern(new RegExp(/^(002|\+2)?01[0125][0-9]{8}$/)),
    Address: joi.string(),
    DOB: joi.date().less("now"),
    gender: joi.string().valid(...Object.values(genderTypes)),
    fileObj,
    file: joi.object().keys(fileObj)
}

export const validation = (schema) => {
    return (req, res, next) => {
        const inputs = { ...req.body, ...req.params, ...req.query }
        if (req.file || req.files?.length) {
            inputs.file = req.file || req.files
        }
        const validationResualt = schema.validate(inputs, { abortEarly: false })
        if (validationResualt.error) {
            return res.status(400).json({ message: "validation Error", Details: validationResualt.error.details })
        }
        return next()
    }
}
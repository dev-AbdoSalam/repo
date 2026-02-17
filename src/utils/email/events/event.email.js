import EventEmitter from "events";
import { customAlphabet } from "nanoid";
import { generateHash } from "../../security/hash.security.js";
import { updateOne } from "../email.repo.js";
import { verifyEmailTemplate } from "../verifyTemplate.email.js";
import { sendEmail } from "../send.email.js";

export const emailEvents = new EventEmitter()

export const emailSubject = {
    confirmEmail: "confirm-email",
    forgotPassword: "forgot-password",
    tempEmail: "temp-email"
}

const sendOTP = async ({ data = {}, subject = emailSubject.confirmEmail } = {}) => {
    const { id, email } = data
    const OTP = customAlphabet("0123456789", 4)()
    const hashOTP = generateHash({ plainText: OTP })
    let updateData = ""
    switch (subject) {
        case emailSubject.confirmEmail:
            updateData = { confirmEmailOTP: hashOTP }
            break;
        case emailSubject.forgotPassword:
            updateData = { forgotPasswordOTP: hashOTP }
            break;
        case emailSubject.tempEmail:
            updateData = { tempEmailOTP: hashOTP }
            break;

        default:
            break;
    }
    await updateOne({ filter: { _id: id }, data: updateData })
    const html = verifyEmailTemplate({ code: OTP })
    await sendEmail({ to: email, subject, html })
}

emailEvents.on(emailSubject.confirmEmail, async (data) => {
    return await sendOTP({ data })
})
emailEvents.on(emailSubject.forgotPassword, async (data) => {
    return await sendOTP({ data, subject: emailSubject.forgotPassword })
})
emailEvents.on(emailSubject.tempEmail, async (data) => {
    return await sendOTP({ data, subject: emailSubject.tempEmail })
})
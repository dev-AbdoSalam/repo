import bcrypt from "bcrypt"

export const generateHash = ({ plainText = "", salt = parseInt(process.env.SALT) } = {}) => {
    return bcrypt.hashSync(plainText, salt)
}
export const compareHash = ({ plainText = "", hashValue = "" } = {}) => {
    return bcrypt.compareSync(plainText, hashValue)
}
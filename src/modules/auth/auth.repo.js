import { userModel } from "../User.schema.js"

export const findOne = async ({ filter = {} } = {}) => {
    return await userModel.findOne(filter)
}
export const create = async ({ data = {} } = {}) => {
    return await userModel.create(data)
}
export const updateOne = async ({ filter = {}, data = {} } = {}) => {
    return await userModel.updateOne(filter, data)
}
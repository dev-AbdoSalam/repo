import { userModel } from "../User.schema.js"

export const findOneAndUpdate = async ({ filter = {}, data = {}, options = {}, select = "" } = {}) => {
    return await userModel.findOneAndUpdate(filter, data, options).select(select)
}

export const findOne = async ({ filter = {}, select = "", populate = [] } = {}) => {
    return await userModel.findOne(filter).select(select).populate(populate)
}
export const updateOne = async ({ filter = {}, data = {} } = {}) => {
    return await userModel.updateOne(filter, data)
}